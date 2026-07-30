import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseSearchQuery } from '@/lib/groq';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, patientId } = await req.json();
  if (!query || !patientId) {
    return NextResponse.json({ error: 'query and patientId are required' }, { status: 400 });
  }

  const filters = await parseSearchQuery(query);

  let q = supabase
    .from('reports')
    .select('*, extracted_values(*)')
    .eq('patient_id', patientId)
    .eq('status', 'done');

  if (filters.reportTypes.length > 0) {
    q = q.in('report_type', filters.reportTypes);
  }
  if (filters.dateFrom) q = q.gte('report_date', filters.dateFrom);
  if (filters.dateTo) q = q.lte('report_date', filters.dateTo);

  q = q.order('report_date', { ascending: false, nullsFirst: false });

  const { data: reports, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Keyword match happens in code against real stored text — never
  // fabricated by the model — so an empty result is always honest.
  let results = reports || [];
  if (filters.metricKeyword) {
    const kw = filters.metricKeyword.toLowerCase();
    results = results.filter((r) => {
      const inSummary = (r.summary || '').toLowerCase().includes(kw);
      const inValues = (r.extracted_values || []).some((v: any) =>
        (v.metric_name || '').toLowerCase().includes(kw)
      );
      const inType = (r.report_type || '').toLowerCase().includes(kw);
      return inSummary || inValues || inType;
    });
  }

  if (filters.wantsLatestOnly && results.length > 1) {
    results = [results[0]];
  }

  return NextResponse.json({ reports: results, filters });
}
