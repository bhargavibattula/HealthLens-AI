'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-slate-900">
            HealthLens AI
          </span>
        </div>
        <Link href="/login" className="btn-secondary px-6 py-2">
          Sign In
        </Link>
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-sm mb-6 border border-emerald-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            Care Companion
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
            Your family's health, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              understood.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Stop relying on scattered photos of medical reports in WhatsApp. HealthLens AI digitizes, translates, and analyzes your parents' medical history so you can manage their care from anywhere.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-3">
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          
          {/* Feature 1 */}
          <div className="md:col-span-2 glass-card p-8 rounded-[2rem] group hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">AI Vision OCR</h3>
              <p className="text-slate-600 leading-relaxed max-w-sm">
                Just snap a picture of a messy physical lab report. Our advanced vision models instantly digitize it into structured data, preserving every metric and unit.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-[2rem] group hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Plain English Summaries</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Medical jargon is confusing. We translate doctor-speak into simple, clear summaries anyone can understand.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-[2rem] group hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Doctor Prep Sheet</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Going to an appointment? AI analyzes past reports to generate 3-5 smart questions you should ask the doctor.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 glass-card p-8 rounded-[2rem] group hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">Health Trajectory Analysis</h3>
            <p className="text-slate-600 leading-relaxed max-w-sm">
              Stop guessing if things are getting better or worse. Our AI tracks biomarkers across multiple reports and alerts you to significant long-term trends automatically.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 rounded-[2rem] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Click-to-Explain Translator</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Don't know what Eosinophils are? Click on any extracted biomarker in the report to instantly get a 1-sentence translation.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-[2rem] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Semantic AI Search</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Search across your entire family's medical history naturally. Just ask "Show me Mom's blood tests with high sugar" and instantly find what you need.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
