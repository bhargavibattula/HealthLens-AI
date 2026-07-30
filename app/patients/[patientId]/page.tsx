'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLocalData } from '@/lib/localStorage';
import { Header } from '@/components/Header';
import { PatientSwitcher } from '@/components/PatientSwitcher';
import { SearchBar } from '@/components/SearchBar';
import { ReportCard } from '@/components/ReportCard';
import { DoctorPrepButton } from '@/components/DoctorPrepButton';
import type { Patient, Report, Reminder, Trend } from '@/lib/types';

export default function PatientTimelinePage({
  params
}: {
  params: { patientId: string };
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getLocalData();
    setPatients(data.patients);
    const current = data.patients.find((p: Patient) => p.id === params.patientId);
    setPatient(current || data.patients[0] || null);

    const pReports = data.reports.filter((r: Report) => r.patient_id === params.patientId);
    setReports(pReports);

    const pReminders = data.reminders.filter((rem: Reminder) => rem.patient_id === params.patientId && rem.status === 'pending');
    setReminders(pReminders);

    const pTrends = data.trends.filter((t: Trend) => t.patient_id === params.patientId);
    // Initially load mocked trends to prevent empty screen, then fetch real ones if enough reports
    setTrends(pTrends);
    
    setLoaded(true);

    if (pReports.length >= 2) {
      setTrendsLoading(true);
      fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: pReports })
      })
      .then(res => res.json())
      .then(data => {
        if (data.trends && data.trends.length > 0) {
          setTrends(data.trends);
        }
      })
      .catch(err => console.error("Error fetching dynamic trends:", err))
      .finally(() => setTrendsLoading(false));
    }
  }, [params.patientId]);

  if (!loaded || !patient) return null;

  return (
    <main className="min-h-screen pb-20">
      <Header email="demo@carecompanion.ai" />
      <div className="mx-auto max-w-5xl px-6 py-10">
        
        {/* Patient Selector */}
        <PatientSwitcher patients={patients} activePatientId={patient.id} />

        {/* Hero Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 glass-card p-8 rounded-3xl bg-emerald-50/50 border border-emerald-500/20 relative z-50">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-extrabold text-slate-900">
                {patient.name}'s Medical History
              </h1>
              {patient.relation && (
                <span className="badge bg-emerald-100 text-emerald-700 border border-emerald-300">
                  {patient.relation}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              AI-organized timeline of medical reports, lab values, and doctor notes.
            </p>
          </div>
          <div className="flex gap-3">
            <DoctorPrepButton patient={patient} reports={reports} />
            <a href={`/patients/${patient.id}/upload`} className="btn-primary flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload New Report</span>
            </a>
          </div>
        </div>

        {/* Smart AI Search */}
        <SearchBar patientId={patient.id} />

        {/* Grid Section for Reminders & AI Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Reminders */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700 border border-amber-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">Doctor Follow-Up Reminders</h3>
            </div>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-500">No active follow-up reminders.</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((r) => (
                  <div key={r.id} className="rounded-xl border border-emerald-500/10 bg-white p-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{r.instruction_text}</span>
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-300">
                      {r.due_date ? new Date(r.due_date).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Trends */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 border border-emerald-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">AI Health Trends</h3>
            </div>

            {trendsLoading ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 animate-pulse">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                AI is analyzing historical data...
              </div>
            ) : trends.length === 0 ? (
              <p className="text-xs text-slate-500">Upload at least 2 reports to detect health trends.</p>
            ) : (
              <div className="space-y-3">
                {trends.map((t) => (
                  <div key={t.id} className="rounded-xl border border-emerald-500/10 bg-white p-4">
                    <p className="text-xs font-semibold text-emerald-700">📈 {t.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timeline Reports List */}
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Chronological Timeline</h3>
          {reports.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">No Medical Reports Yet</h4>
              <p className="mt-1 text-sm text-slate-500">Upload a lab report photo or PDF to build {patient.name}'s medical timeline.</p>
              <a href={`/patients/${patient.id}/upload`} className="btn-primary mt-6 inline-flex shadow-lg shadow-emerald-500/20">
                Upload First Report
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <ReportCard key={r.id} report={r} patientId={patient.id} />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
