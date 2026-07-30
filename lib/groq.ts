import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model names are configurable via env because Groq's lineup changes often.
// Check https://console.groq.com/docs/models before deploying and update
// the defaults below if these have been deprecated.
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'qwen/qwen3.6-27b';

export interface OcrResult {
  text: string;
  confidence: number; // 0..1, model's own estimate of legibility/certainty
}

export async function getGroqChatCompletion(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });
  const content = completion.choices[0]?.message?.content?.trim() || '';
  // Remove <think>...</think> blocks (including multiline)
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

/**
 * Step 1 — OCR. Sends the image to a Groq vision model and asks it to
 * transcribe all text plus self-report a confidence score. Confidence is
 * intentionally conservative — the model is told to mark itself low when
 * the photo is blurry, angled, or partially cut off, since that's the
 * behavior the product depends on (retake prompt instead of a silent
 * wrong guess).
 */
export async function ocrImage(base64DataUrl: string): Promise<OcrResult> {
  const completion = await groq.chat.completions.create({
    model: VISION_MODEL,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are transcribing a photographed or scanned medical report.
Transcribe ALL visible text, preserving labels, values, and units as they appear
(e.g. "Hemoglobin: 13.2 g/dL"). If handwriting is present, transcribe your best
reading of it.

Then rate your own confidence in this transcription from 0 to 1:
- 1.0 = fully legible, clean scan/photo, nothing ambiguous
- 0.5-0.7 = mostly legible but some words/values are uncertain, angled, or blurry
- below 0.5 = significant portions are illegible, cut off, or too dark/blurry to trust

Respond ONLY with JSON: {"text": string, "confidence": number}`
          },
          { type: 'image_url', image_url: { url: base64DataUrl } }
        ]
      }
    ]
  });

  let raw = completion.choices[0]?.message?.content || '{}';
  raw = raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(raw);
    return {
      text: typeof parsed.text === 'string' ? parsed.text : '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0
    };
  } catch {
    return { text: '', confidence: 0 };
  }
}

export interface AnalysisResult {
  reportType: string;
  reportTypeConfidence: number;
  reportDate: string | null;
  summary: string;
  extractedValues: {
    metric_name: string;
    value: number | null;
    unit: string | null;
    reference_range: string | null;
    flag: 'high' | 'low' | 'normal' | null;
  }[];
  reminderInstruction: string | null;
  patientNameOnReport: string | null;
}

const REPORT_TYPES = ['Blood Test', 'ECG', 'MRI', 'X-Ray', 'CT Scan', 'Prescription', 'Other'];

/**
 * Steps 2–4 & 6 — classification, structured extraction, plain-language
 * summary, and reminder-instruction detection, all from the OCR text.
 * Kept in one call for latency, but each field is validated independently
 * so a weak classification doesn't silently corrupt the summary.
 */
export async function analyzeReportText(ocrText: string): Promise<AnalysisResult> {
  const completion = await groq.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `You are a careful medical-report assistant for a non-medical family member.
You NEVER state or imply a diagnosis. You only describe what is written in the report.
If a doctor's note flags a concern, you must preserve that concern in the summary even if
individual values are in the "normal" range — never smooth it over.`
      },
      {
        role: 'user',
        content: `Here is OCR text from a medical report:
"""
${ocrText}
"""

Return JSON with this exact shape:
{
  "reportType": one of ${JSON.stringify(REPORT_TYPES)},
  "reportTypeConfidence": number 0-1 (lower if the text doesn't clearly match the type, e.g. messy handwriting or an unfamiliar layout — never output high confidence on a guess),
  "reportDate": "YYYY-MM-DD" or null if no date is present in the text,
  "summary": a 4-5 line plain-language summary for a family member with no medical background. State findings only. Do not diagnose. If the text mentions any doctor concern/flag/note, include it explicitly.,
  "extractedValues": [ { "metric_name": string, "value": number|null, "unit": string|null, "reference_range": string|null, "flag": "high"|"low"|"normal"|null } ],
  "reminderInstruction": a short quoted follow-up instruction if present (e.g. "repeat after 3 months"), else null,
  "patientNameOnReport": the patient's name as printed on the report, if one is visible, else null
}`
      }
    ]
  });

  let raw = completion.choices[0]?.message?.content || '{}';
  raw = raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch(e) {
    console.error("Failed to parse JSON in analyzeReportText:", raw);
  }

  return {
    reportType: REPORT_TYPES.includes(parsed.reportType) ? parsed.reportType : 'Other',
    reportTypeConfidence:
      typeof parsed.reportTypeConfidence === 'number' ? parsed.reportTypeConfidence : 0,
    reportDate: parsed.reportDate || null,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    extractedValues: Array.isArray(parsed.extractedValues) ? parsed.extractedValues : [],
    reminderInstruction: parsed.reminderInstruction || null,
    patientNameOnReport: parsed.patientNameOnReport || null
  };
}

/**
 * Step 5 — trend note. Given a metric's historical values (oldest to
 * newest, including the new one), produce one plain-language sentence.
 * The direction itself is computed in code (see analyze route) — the
 * model only writes the sentence — so we never let the LLM invent a
 * trend that isn't actually in the numbers.
 */
export async function writeTrendNote(
  metricName: string,
  direction: 'up' | 'down' | 'stable',
  points: { date: string; value: number }[]
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `Metric: ${metricName}. Direction: ${direction}. Values over time (oldest to newest): ${JSON.stringify(
          points
        )}.
Write ONE short plain-language sentence a non-medical person would understand, e.g.
"Blood sugar has been increasing over the last year." Do not diagnose or recommend action.
Respond with just the sentence, no quotes.`
      }
    ]
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

export interface SearchFilters {
  reportTypes: string[];
  metricKeyword: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  wantsLatestOnly: boolean;
}

/**
 * Step 7 — smart search. Turns a natural-language query into structured
 * filters. The LLM never sees or returns actual report data — it only
 * proposes filters, which the API route then runs as a real Postgres
 * query, so results can never be hallucinated.
 */
export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  const completion = await groq.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Parse this natural-language search over a family's medical reports into filters.
Query: "${query}"

Report types available: ${JSON.stringify(REPORT_TYPES)}.
"Kidney reports" likely means Blood Test (kidney function panels) unless another type is clearly implied.

Return JSON:
{
  "reportTypes": string[] (subset of the list above, [] if the query doesn't imply a type),
  "metricKeyword": string|null (e.g. "kidney", "sugar", "hemoglobin" — a keyword to match against extracted metric names/summary, or null),
  "dateFrom": "YYYY-MM-DD"|null,
  "dateTo": "YYYY-MM-DD"|null,
  "wantsLatestOnly": boolean (true if the query asks for "the last" / "most recent" one)
}`
      }
    ]
  });

  let raw = completion.choices[0]?.message?.content || '{}';
  raw = raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(raw);
    return {
      reportTypes: Array.isArray(parsed.reportTypes) ? parsed.reportTypes : [],
      metricKeyword: parsed.metricKeyword || null,
      dateFrom: parsed.dateFrom || null,
      dateTo: parsed.dateTo || null,
      wantsLatestOnly: !!parsed.wantsLatestOnly
    };
  } catch {
    return { reportTypes: [], metricKeyword: null, dateFrom: null, dateTo: null, wantsLatestOnly: false };
  }
}
