import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ocrImage, analyzeReportText, writeTrendNote } from '@/lib/groq';

function bufferToDataUrl(buffer: ArrayBuffer, mimeType: string) {
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Very small natural-language relative-date parser for follow-up
// instructions like "repeat after 3 months" / "review in 6 weeks".
// Deliberately simple and predictable rather than delegating date math
// to the LLM, which is prone to arithmetic mistakes.
function computeDueDate(instruction: string, baseIso: string | null): string | null {
  const base = baseIso ? new Date(baseIso) : new Date();
  const match = instruction.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!match) return null;
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const due = new Date(base);
  if (unit === 'day') due.setDate(due.getDate() + amount);
  if (unit === 'week') due.setDate(due.getDate() + amount * 7);
  if (unit === 'month') due.setMonth(due.getMonth() + amount);
  if (unit === 'year') due.setFullYear(due.getFullYear() + amount);
  return due.toISOString().slice(0, 10);
}

function namesRoughlyMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return true; // nothing to compare against, don't flag
  return na.includes(nb) || nb.includes(na);
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RLS-scoped select — 404s if this report doesn't belong to the user.
  const { data: report } = await supabase.from('reports').select('*').eq('id', params.id).single();
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', report.patient_id)
    .single();

  const service = createServiceClient();

  try {
    if (report.file_type && report.file_type !== 'application/pdf' && !report.file_type.startsWith('image/')) {
      throw new Error('Unsupported file type for analysis.');
    }
    if (report.file_type === 'application/pdf') {
      // MVP limitation: the Groq vision pipeline used here reads images.
      // Convert PDF pages to images before upload, or extend this route
      // with a PDF-to-image step (e.g. pdf-lib/pdf.js) before OCR.
      await service
        .from('reports')
        .update({ status: 'failed' })
        .eq('id', report.id);
      return NextResponse.json(
        { error: 'PDF analysis is not wired up in this MVP yet — please upload a photo/image of the report instead.' },
        { status: 422 }
      );
    }

    const { data: fileBlob, error: downloadError } = await service.storage
      .from('reports')
      .download(report.storage_path);
    if (downloadError || !fileBlob) throw new Error(downloadError?.message || 'Could not read uploaded file');

    const arrayBuffer = await fileBlob.arrayBuffer();
    const dataUrl = bufferToDataUrl(arrayBuffer, report.file_type || 'image/jpeg');

    // Step 1 — OCR
    const ocr = await ocrImage(dataUrl);

    // Steps 2-4, 6 — classify, extract, summarize, reminder detection
    const analysis = await analyzeReportText(ocr.text);

    const needsPatientConfirmation = analysis.patientNameOnReport
      ? !namesRoughlyMatch(analysis.patientNameOnReport, patient?.name || '')
      : false;

    await service
      .from('reports')
      .update({
        report_type: analysis.reportType,
        report_type_confidence: analysis.reportTypeConfidence,
        ocr_text: ocr.text,
        ocr_confidence: ocr.confidence,
        summary: analysis.summary,
        report_date: analysis.reportDate,
        status: needsPatientConfirmation ? 'needs_confirmation' : 'done',
        needs_patient_confirmation: needsPatientConfirmation
      })
      .eq('id', report.id);

    // Replace extracted values for this report (handles re-analysis).
    await service.from('extracted_values').delete().eq('report_id', report.id);
    if (analysis.extractedValues.length > 0) {
      await service.from('extracted_values').insert(
        analysis.extractedValues.map((v) => ({
          report_id: report.id,
          metric_name: v.metric_name,
          value: v.value,
          unit: v.unit,
          reference_range: v.reference_range,
          flag: v.flag
        }))
      );
    }

    // Step 6 — reminder
    if (analysis.reminderInstruction) {
      const dueDate = computeDueDate(analysis.reminderInstruction, analysis.reportDate);
      await service.from('reminders').insert({
        patient_id: report.patient_id,
        report_id: report.id,
        instruction_text: analysis.reminderInstruction,
        due_date: dueDate
      });
    }

    // Step 5 — trend detection per extracted metric
    for (const v of analysis.extractedValues) {
      if (v.value === null || !analysis.reportDate) continue;

      const { data: history } = await service
        .from('extracted_values')
        .select('value, reports!inner(report_date, patient_id)')
        .eq('metric_name', v.metric_name)
        // @ts-ignore - filtering on the joined table's column
        .eq('reports.patient_id', report.patient_id);

      const points = (history || [])
        // @ts-ignore
        .filter((h) => h.value !== null && h.reports?.report_date)
        // @ts-ignore
        .map((h) => ({ date: h.reports.report_date as string, value: h.value as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (points.length < 2) continue;

      const first = points[0].value;
      const last = points[points.length - 1].value;
      const pctChange = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;
      const direction: 'up' | 'down' | 'stable' =
        Math.abs(pctChange) < 3 ? 'stable' : pctChange > 0 ? 'up' : 'down';

      const note = await writeTrendNote(v.metric_name, direction, points);

      const { data: existingTrend } = await service
        .from('trends')
        .select('id')
        .eq('patient_id', report.patient_id)
        .eq('metric_name', v.metric_name)
        .maybeSingle();

      if (existingTrend) {
        await service
          .from('trends')
          .update({ direction, note, data_points: points, updated_at: new Date().toISOString() })
          .eq('id', existingTrend.id);
      } else {
        await service.from('trends').insert({
          patient_id: report.patient_id,
          metric_name: v.metric_name,
          direction,
          note,
          data_points: points
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    await service.from('reports').update({ status: 'failed' }).eq('id', report.id);
    return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 });
  }
}
