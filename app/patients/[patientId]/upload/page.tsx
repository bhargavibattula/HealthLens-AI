'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLocalData } from '@/lib/localStorage';
import { Header } from '@/components/Header';
import { UploadForm } from '@/components/UploadForm';
import type { Patient } from '@/lib/types';

export default function UploadPage({
  params
}: {
  params: { patientId: string };
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getLocalData();
    const found = data.patients.find((p: Patient) => p.id === params.patientId);
    setPatient(found || data.patients[0] || null);
    setLoaded(true);
  }, [params.patientId]);

  if (!loaded || !patient) return null;

  return (
    <main className="min-h-screen pb-20">
      <Header email="demo@carecompanion.ai" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        
        <div className="mb-6">
          <Link href={`/patients/${patient.id}`} className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-2">
            <span>←</span> Back to Timeline
          </Link>
        </div>

        <div className="glass-card p-8 mb-8 rounded-3xl border border-emerald-500/20">
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Upload Report for {patient.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Photograph a printed lab report in good light, or upload a digital PDF.
          </p>
        </div>

        <UploadForm patientId={patient.id} />

      </div>
    </main>
  );
}
