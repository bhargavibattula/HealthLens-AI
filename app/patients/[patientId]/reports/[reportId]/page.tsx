'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLocalData } from '@/lib/localStorage';
import { Header } from '@/components/Header';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Disclaimer } from '@/components/Disclaimer';
import type { Report, ExtractedValue } from '@/lib/types';

export default function ReportDetailPage({
  params
}: {
  params: { patientId: string; reportId: string };
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [explainingTerm, setExplainingTerm] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  async function handleExplain(term: string) {
    if (explainingTerm === term) {
      setExplainingTerm(null);
      setExplanation(null);
      return;
    }
    setExplainingTerm(term);
    setExplanation(null);
    setExplainLoading(true);

    try {
      const res = await fetch('/api/explain-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term })
      });
      const data = await res.json();
      setExplanation(data.explanation || 'Could not fetch explanation.');
    } catch (e) {
      setExplanation('Error fetching explanation.');
    } finally {
      setExplainLoading(false);
    }
  }

  useEffect(() => {
    const data = getLocalData();
    const found = data.reports.find((r: Report) => r.id === params.reportId);
    setReport(found || null);
    setLoaded(true);
  }, [params.reportId]);

  if (!loaded) return null;

  if (!report) {
    return (
      <main className="min-h-screen">
        <Header email="demo@carecompanion.ai" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-slate-900">Report not found</p>
          <Link href={`/patients/${params.patientId}`} className="btn-primary mt-4 inline-flex">
            Back to Timeline
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <Header email="demo@carecompanion.ai" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        
        <div className="mb-6">
          <Link href={`/patients/${params.patientId}`} className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-2">
            <span>←</span> Back to Timeline
          </Link>
        </div>

        {/* Header Badges */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 font-bold">
            {report.report_type || 'Blood Test'}
          </span>
          <ConfidenceBadge value={report.report_type_confidence || 0.95} />
          {report.report_date && (
            <span className="text-xs font-semibold text-slate-500">
              {new Date(report.report_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* AI Summary Card */}
        {report.summary && (
          <div className="glass-card p-8 mb-6 rounded-3xl border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <h3 className="font-display text-lg font-bold text-slate-900">AI Medical Summary</h3>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 font-medium">
              {report.summary}
            </p>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-emerald-500/10">
              <span className="text-xs font-semibold text-slate-500">OCR Legibility Score:</span>
              <ConfidenceBadge value={report.ocr_confidence || 0.92} />
            </div>
          </div>
        )}

        {/* Extracted Lab Values */}
        {report.extracted_values && report.extracted_values.length > 0 && (
          <div className="glass-card mb-6 overflow-hidden rounded-3xl">
            <div className="p-6 pb-4 border-b border-emerald-500/10 flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h3 className="font-display text-lg font-bold text-slate-900">Extracted Lab Biomarkers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-slate-500 text-left border-b border-emerald-500/10">
                    <th className="px-6 py-3.5">Biomarker</th>
                    <th className="px-6 py-3.5">Result</th>
                    <th className="px-6 py-3.5">Reference Range</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {report.extracted_values.map((v: ExtractedValue) => (
                    <tr key={v.id} className="hover:bg-emerald-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{v.metric_name}</span>
                          <button 
                            onClick={() => handleExplain(v.metric_name)}
                            className="text-emerald-500 hover:text-emerald-600 transition"
                            title="Explain this term"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                        {explainingTerm === v.metric_name && (
                          <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 relative shadow-sm">
                            <button onClick={() => setExplainingTerm(null)} className="absolute top-2 right-2 text-emerald-500 hover:text-emerald-700">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            {explainLoading ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Asking AI...
                              </span>
                            ) : explanation}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {v.value ?? '—'} <span className="text-xs font-semibold text-slate-500">{v.unit || ''}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">{v.reference_range || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {v.flag && v.flag !== 'normal' ? (
                          <span className="badge bg-rose-50 text-rose-700 border border-rose-200">
                            {v.flag}
                          </span>
                        ) : (
                          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                            normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OCR Transcription */}
        {report.ocr_text && (
          <div className="glass-card p-6 mb-6 rounded-3xl">
            <button 
              onClick={() => setShowOcr(!showOcr)}
              className="w-full flex items-center justify-between font-display text-sm font-bold text-slate-600 uppercase tracking-wider focus:outline-none"
            >
              <span className="flex items-center gap-2">
                📄 Raw Transcribed OCR Text
              </span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${showOcr ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showOcr && (
              <pre className="mt-4 whitespace-pre-wrap text-xs text-slate-600 bg-slate-100 p-4 rounded-2xl font-mono border border-emerald-500/10 leading-relaxed max-h-96 overflow-y-auto">
                {report.ocr_text}
              </pre>
            )}
          </div>
        )}

        <Disclaimer />

      </div>
    </main>
  );
}
