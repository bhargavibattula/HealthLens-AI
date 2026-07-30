import { NextRequest, NextResponse } from 'next/server';
import { ocrImage, analyzeReportText, summarizeOcrText } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const patientId = formData.get('patientId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to Base64 Data URL for Groq Vision Model
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Step 1: Run real Groq Vision OCR on the uploaded image
    const ocr = await ocrImage(dataUrl);

    // Step 2: Run LLM analysis — classification, extraction, summary, reminders
    const analysis = await analyzeReportText(ocr.text || file.name);

    let finalSummary = analysis.summary;
    if (!finalSummary) {
      finalSummary = await summarizeOcrText(ocr.text || file.name);
    }

    // Stable report ID shared between report and its extracted_values
    const reportId = `r-${Date.now()}`;

    return NextResponse.json({
      success: true,
      report: {
        id: reportId,
        patient_id: patientId || 'p-mom',
        owner_id: 'local-user',
        storage_path: `uploaded/${file.name}`,
        file_type: file.type,
        report_type: analysis.reportType,
        report_type_confidence: analysis.reportTypeConfidence,
        status: 'done',
        needs_patient_confirmation: !!analysis.patientNameOnReport,
        ocr_text: ocr.text || `(OCR could not detect text from this image)`,
        ocr_confidence: ocr.confidence,
        summary: finalSummary || `AI processed ${file.name} as ${analysis.reportType}.`,
        report_date: analysis.reportDate || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        extracted_values: analysis.extractedValues.map((v, i) => ({
          id: `ev-${reportId}-${i}`,
          report_id: reportId,
          metric_name: v.metric_name,
          value: v.value,
          unit: v.unit,
          reference_range: v.reference_range,
          flag: v.flag
        })),
        reminder_instruction: analysis.reminderInstruction
      }
    });
  } catch (err: any) {
    console.error('Groq Vision API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze report with Groq Vision AI' },
      { status: 500 }
    );
  }
}
