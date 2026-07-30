'use client';

import { useState } from 'react';
import { getLocalData, savePatients } from '@/lib/localStorage';
import type { Patient } from '@/lib/types';

export function PatientSwitcher({
  patients,
  activePatientId
}: {
  patients: Patient[];
  activePatientId?: string;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');

  async function createPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      owner_id: 'local-user',
      name: name.trim(),
      relation: relation.trim() || null,
      date_of_birth: null,
      created_at: new Date().toISOString()
    };

    const existing = getLocalData().patients;
    savePatients([...existing, newPatient]);

    setCreating(false);
    setName('');
    setRelation('');
    window.location.href = `/patients/${newPatient.id}`;
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      {patients.map((p) => {
        const isActive = p.id === activePatientId;
        return (
          <a
            key={p.id}
            href={`/patients/${p.id}`}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'border border-emerald-500/20 bg-white/80 text-emerald-900 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <span>{p.name}</span>
            {p.relation && (
              <span className={`text-xs ${isActive ? 'text-emerald-100' : 'text-emerald-700'}`}>
                • {p.relation}
              </span>
            )}
          </a>
        );
      })}

      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-2xl border border-dashed border-emerald-500/30 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:border-emerald-400"
        >
          <span>+</span>
          <span>Add Family Member</span>
        </button>
      ) : (
        <form onSubmit={createPatient} className="flex items-center gap-2 glass-card p-2 rounded-2xl">
          <input
            autoFocus
            className="input !w-32 !bg-white/80"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input !w-36 !bg-white/80"
            placeholder="Relation (e.g. Mother)"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
          />
          <button type="submit" className="btn-primary !px-4 !py-2 !text-xs">
            Save
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="px-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
