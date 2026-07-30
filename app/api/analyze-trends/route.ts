import { NextResponse } from 'next/server';
import { getGroqChatCompletion } from '@/lib/groq';
import type { Report } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reports } = body as { reports: Report[] };

    if (!reports || reports.length < 2) {
      return NextResponse.json({ trends: [] }); // Need at least 2 reports to find trends
    }

    // Sort reports chronologically (oldest first for trend analysis)
    const sortedReports = [...reports].sort(
      (a, b) => new Date(a.report_date || 0).getTime() - new Date(b.report_date || 0).getTime()
    );

    const historySummary = sortedReports.map(r => {
      let sum = `Date: ${r.report_date}\n`;
      if (r.extracted_values && r.extracted_values.length > 0) {
        r.extracted_values.forEach(v => {
          sum += `- ${v.metric_name}: ${v.value} ${v.unit} [${v.flag}]\n`;
        });
      }
      return sum;
    }).join('\n\n');

    const prompt = `You are an expert AI medical analyst. You are looking at a time-series of lab results for a patient.
Here are the chronological lab results:

${historySummary}

Your goal is to identify any significant health trends across time (e.g., "Fasting Glucose has been steadily increasing over the last year", or "Cholesterol has significantly improved").
Identify at most 3 significant trends. 
Return ONLY a JSON array of strings, like this: ["Trend 1", "Trend 2"]. Do not include any intro, outro text, markdown formatting, or explanations. Do not provide medical advice or diagnosis. Just state the observed data trend clearly.`;

    const result = await getGroqChatCompletion(prompt);
    
    let rawTrends: string[] = [];
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
      rawTrends = JSON.parse(cleaned);
      if (!Array.isArray(rawTrends)) rawTrends = [];
    } catch (e) {
      console.error("Failed to parse JSON trends:", result);
      rawTrends = [];
    }

    const trends = rawTrends
      .filter(t => t.length > 0)
      .slice(0, 3)
      .map((t, i) => ({
        id: `ai-trend-${Date.now()}-${i}`,
        patient_id: reports[0].patient_id,
        note: t,
        created_at: new Date().toISOString(),
      }));

    return NextResponse.json({ trends });
  } catch (error: any) {
    console.error('Error analyzing trends:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze trends' },
      { status: 500 }
    );
  }
}
