'use client';

import { useState } from 'react';
import type { Patient, Report } from '@/lib/types';

export function DoctorPrepButton({ patient, reports }: { patient: Patient; reports: Report[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(force = false) {
    setIsOpen(true);
    if (!force && questions.length > 0) return; // Already generated

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName: patient.name, reports })
      });

      if (!res.ok) {
        throw new Error('Failed to generate prep sheet');
      }

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleGenerate}
        className="btn-secondary flex items-center gap-2 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
        </svg>
        <span>Prepare for Doctor's Visit</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-8 border border-emerald-500/20 shadow-2xl relative bg-white/95">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Doctor Prep Sheet</h3>
                <p className="text-xs text-slate-500">AI-generated questions based on history</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-semibold text-emerald-600 animate-pulse">
                  Analyzing history & generating questions...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-200">
                <p className="text-sm text-rose-700 font-semibold">{error}</p>
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-slate-600">Not enough data to generate questions. Upload more reports.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700 mb-4">
                  Consider asking these questions at your next appointment with {patient.name}'s doctor:
                </p>
                <ul className="space-y-3">
                  {questions.map((q, i) => (
                    <li key={i} className="flex gap-4 text-sm text-slate-700 bg-white p-5 rounded-2xl border border-emerald-500/10 shadow-md shadow-emerald-500/5 group hover:border-emerald-500/30 transition">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed mt-1 font-medium">{q}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(questions.map((q, i) => `${i+1}. ${q}`).join('\n'));
                    }}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </button>
                  <button 
                    onClick={() => handleGenerate(true)}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                  </button>
                  <button onClick={() => setIsOpen(false)} className="btn-primary w-full">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
