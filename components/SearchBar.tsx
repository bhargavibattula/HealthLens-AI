'use client';

import { useState } from 'react';
import type { Report } from '@/lib/types';
import { getLocalData } from '@/lib/localStorage';
import { ReportCard } from './ReportCard';

export function SearchBar({ patientId }: { patientId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Report[] | null>(null);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults(null);
      return;
    }

    const data = getLocalData();
    const pReports = data.reports.filter((r: Report) => r.patient_id === patientId);

    const filtered = pReports.filter((r: Report) => {
      const typeMatch = r.report_type?.toLowerCase().includes(q);
      const summaryMatch = r.summary?.toLowerCase().includes(q);
      const ocrMatch = r.ocr_text?.toLowerCase().includes(q);
      const valueMatch = r.extracted_values?.some((v) => v.metric_name.toLowerCase().includes(q));
      return typeMatch || summaryMatch || ocrMatch || valueMatch;
    });

    setResults(filtered);
  }

  return (
    <div className="mb-8">
      <form onSubmit={runSearch} className="flex gap-3">
        <div className="relative flex-1">
          <input
            className="input !bg-white/90 !border-emerald-500/20 !pl-12 !pr-4 !py-3.5 shadow-xl text-slate-900 placeholder:text-slate-500 rounded-2xl"
            placeholder='Ask AI: "show blood test", "sugar", "MRI", "ECG"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-4 top-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button type="submit" className="btn-primary shrink-0 px-6 flex items-center gap-2 shadow-lg shadow-emerald-500/30">
          <span>✨</span>
          <span>AI Search</span>
        </button>
        {results !== null && (
          <button
            type="button"
            onClick={() => {
              setResults(null);
              setQuery('');
            }}
            className="btn-secondary shrink-0 px-4"
          >
            Clear
          </button>
        )}
      </form>

      {results !== null && (
        <div className="mt-4 space-y-3 glass-card p-6 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            🔍 AI Filtered Results: {results.length} report{results.length === 1 ? '' : 's'}
          </p>
          {results.length === 0 ? (
            <p className="text-sm text-slate-600">No matching reports found for "{query}".</p>
          ) : (
            results.map((r) => <ReportCard key={r.id} report={r} patientId={patientId} />)
          )}
        </div>
      )}
    </div>
  );
}
