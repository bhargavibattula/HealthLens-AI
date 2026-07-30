import { NextResponse } from 'next/server';
import { getGroqChatCompletion } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { term, context } = body as { term: string; context?: string };

    if (!term) {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 });
    }

    const prompt = `You are a helpful, empathetic medical AI assistant.
A patient is reading their medical report and doesn't understand the following medical term or biomarker: "${term}"

${context ? `The term appeared in this context: "${context}"` : ''}

Explain this term simply in 1-2 short sentences, as if you were explaining it to a 5-year-old or someone with no medical background. Do not give medical advice. Keep it extremely concise and easy to read.`;

    const result = await getGroqChatCompletion(prompt);

    return NextResponse.json({ explanation: result.trim() });
  } catch (error: any) {
    console.error('Error explaining term:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to explain term' },
      { status: 500 }
    );
  }
}
