'use client';

import { useState } from 'react';
import { getLocalData, saveReports } from '@/lib/localStorage';
import type { Reminder } from '@/lib/types';

export function UploadForm({ patientId }: { patientId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<'idle' | 'ocr' | 'analyzing'>('idle');
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
    if (f && f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function handleAnalyze() {
    if (!file) return;
    setError(null);
    setStage('ocr');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);

      setStage('analyzing');
      const res = await fetch('/api/analyze-direct', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Groq API returned an error.');
      }

      const { report } = await res.json();

      // Save report to localStorage
      const data = getLocalData();
      const updatedReports = [report, ...data.reports];
      saveReports(updatedReports);

      // If AI detected a follow-up reminder, save it
      if (report.reminder_instruction) {
        const reminders: Reminder[] = JSON.parse(
          localStorage.getItem('acc_reminders') || '[]'
        );
        reminders.push({
          id: `rem-${Date.now()}`,
          patient_id: patientId,
          report_id: report.id,
          instruction_text: report.reminder_instruction,
          due_date: null,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('acc_reminders', JSON.stringify(reminders));
      }

      // Navigate directly to the AI analysis detail page
      window.location.href = `/patients/${patientId}/reports/${report.id}`;
    } catch (err: any) {
      setStage('idle');
      setError(err.message || 'Analysis failed. Check your Groq API key or try a clearer image.');
    }
  }

  const stageLabel = {
    idle: '✨ Analyze Report with Groq AI',
    ocr: '📷 Running Groq Vision OCR…',
    analyzing: '🧠 Classifying & Extracting Biomarkers…'
  };

  return (
    <div className="glass-card p-8 rounded-3xl border border-emerald-500/10 shadow-2xl">
      <label
        htmlFor="report-file"
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-50/50 px-6 py-14 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
      >
        {preview ? (
          <img src={preview} alt="Report preview" className="max-h-64 rounded-xl object-contain shadow-2xl border border-emerald-500/20" />
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-slate-900">
              {file ? file.name : 'Take a Photo or Choose a Lab Report'}
            </span>
            <span className="mt-2 text-xs font-semibold text-emerald-700">
              JPG, PNG — photographed lab reports, prescriptions, or scans
            </span>
          </>
        )}
        <input
          id="report-file"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFileChange}
        />
      </label>

      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || stage !== 'idle'}
        className="btn-primary mt-8 w-full py-4 text-base font-bold shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {stage !== 'idle' && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span>{stageLabel[stage]}</span>
      </button>

      {stage !== 'idle' && (
        <div className="mt-4 space-y-2">
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ${
              stage === 'ocr' ? 'w-1/3' : 'w-2/3'
            } animate-pulse`} />
          </div>
          <p className="text-center text-xs font-semibold text-emerald-700">
            {stage === 'ocr'
              ? 'Sending image to Groq Vision for text transcription…'
              : 'LLM is classifying the report type, extracting lab values, and writing a plain-language summary…'
            }
          </p>
        </div>
      )}
    </div>
  );
}
