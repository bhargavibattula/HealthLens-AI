import { NextResponse } from 'next/server';
import { getGroqChatCompletion } from '@/lib/groq';
import type { Report } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientName, reports } = body as { patientName: string; reports: Report[] };

    if (!reports || reports.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Summarize the data for the LLM
    const historySummary = reports.map(r => {
      let sum = `Report: ${r.report_type} on ${r.report_date}\n`;
      sum += `Summary: ${r.summary}\n`;
      if (r.extracted_values && r.extracted_values.length > 0) {
        sum += `Key Biomarkers:\n`;
        r.extracted_values.forEach(v => {
          sum += `- ${v.metric_name}: ${v.value} ${v.unit} (Range: ${v.reference_range}) [${v.flag}]\n`;
        });
      }
      return sum;
    }).join('\n\n');

    const prompt = `You are an expert medical advocate helping a patient prepare for their next doctor's visit.
The patient's name is ${patientName}.
Here is the patient's recent medical history and lab results:

${historySummary}

Based on these reports, especially any abnormal biomarkers (high/low flags) or concerning trends, generate 3-5 smart, specific questions the patient should ask their doctor at their next visit. 
Return ONLY a JSON array of strings, like this: ["Question 1", "Question 2", "Question 3"]. Do not include any other text, markdown formatting, or explanations.`;

    const result = await getGroqChatCompletion(prompt);

    let questions: string[] = [];
    try {
      // Sometimes the LLM wraps the JSON in markdown code blocks
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleaned);
      if (!Array.isArray(questions)) questions = [];
    } catch (e) {
      console.error("Failed to parse JSON questions:", result);
      questions = ["Could you explain my recent abnormal lab results?", "Are there any lifestyle changes I should make based on these trends?"];
    }

    return NextResponse.json({ questions: questions.slice(0, 5) });
  } catch (error: any) {
    console.error('Error generating prep questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate prep questions' },
      { status: 500 }
    );
  }
}
