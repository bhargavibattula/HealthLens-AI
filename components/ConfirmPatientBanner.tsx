'use client';

import { useState } from 'react';
import { getLocalData, saveReports } from '@/lib/localStorage';
import type { Patient, Report } from '@/lib/types';

export function ConfirmPatientBanner({
  reportId,
  currentPatientName,
  patients
}: {
  reportId: string;
  currentPatientName: string;
  patients: Patient[];
}) {
  const [loading, setLoading] = useState(false);

  function confirm(targetPatientId: string) {
    setLoading(true);
    const data = getLocalData();
    const updatedReports = data.reports.map((r: Report) => {
      if (r.id === reportId) {
        return { ...r, patient_id: targetPatientId, needs_patient_confirmation: false };
      }
      return r;
    });
    saveReports(updatedReports);
    setLoading(false);
    window.location.href = `/patients/${targetPatientId}/reports/${reportId}`;
  }

  return (
    <div className="mb-6 glass-card p-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 shadow-xl">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">⚠️</span>
        <h3 className="font-['Outfit'] text-base font-bold text-amber-300">
          AI Safeguard: Patient Verification Required
        </h3>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        This document was uploaded while <strong className="text-white">{currentPatientName}</strong> was selected. Please verify which family member this report belongs to:
      </p>
      <div className="flex flex-wrap gap-2">
        {patients.map((p) => (
          <button
            key={p.id}
            disabled={loading}
            onClick={() => confirm(p.id)}
            className="btn-secondary !py-2 !px-4 text-xs font-semibold hover:border-amber-400"
          >
            Assign to {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
