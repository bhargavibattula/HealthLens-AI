'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalData } from '@/lib/localStorage';
import { Header } from '@/components/Header';
import { PatientSwitcher } from '@/components/PatientSwitcher';
import type { Patient } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getLocalData();
    setPatients(data.patients);
    setLoaded(true);

    if (data.patients && data.patients.length > 0) {
      router.push(`/patients/${data.patients[0].id}`);
    }
  }, [router]);

  if (!loaded) return null;

  return (
    <main className="min-h-screen pb-20">
      <Header email="demo@carecompanion.ai" />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="glass-card p-12 rounded-3xl text-center border border-emerald-500/20 bg-white/80">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-500/30">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            Welcome to HealthLens AI
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your family's medical reports, organized by AI. Add a family member to start building their medical timeline.
          </p>
          <div className="mt-8">
            <PatientSwitcher patients={patients} />
          </div>
        </div>
      </div>
    </main>
  );
}
