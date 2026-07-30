'use client';

import Link from 'next/link';
import type { Report } from '@/lib/types';

export function ReportCard({
  report,
  patientId
}: {
  report: Report;
  patientId: string;
}) {
  const isHighRisk = report.extracted_values?.some((v) => v.flag === 'high' || v.flag === 'low');

  return (
    <a
      href={`/patients/${patientId}/reports/${report.id}`}
      className="glass-card glass-card-hover block p-5 rounded-2xl mb-4 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="badge bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 font-semibold">
              {report.report_type || 'Blood Test'}
            </span>
            {report.report_date && (
              <span className="text-xs font-semibold text-slate-500">
                {new Date(report.report_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            {isHighRisk && (
              <span className="badge bg-amber-50 text-amber-700 border border-amber-500/30">
                ⚠️ Attention Required
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed font-medium">
            {report.summary || 'AI Analysis pending...'}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {report.extracted_values && report.extracted_values.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-emerald-500/10">
          {report.extracted_values.slice(0, 3).map((v) => (
            <span
              key={v.id}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                v.flag === 'high' || v.flag === 'low'
                  ? 'bg-rose-50 text-rose-700 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
              }`}
            >
              {v.metric_name}: <span className="font-bold text-emerald-900">{v.value} {v.unit}</span>
            </span>
          ))}
          {report.extracted_values.length > 3 && (
            <span className="text-xs font-semibold text-slate-500 self-center">
              +{report.extracted_values.length - 3} more
            </span>
          )}
        </div>
      )}
    </a>
  );
}
