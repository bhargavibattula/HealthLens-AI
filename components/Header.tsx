'use client';

import Link from 'next/link';

export function Header({ email }: { email?: string | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/20 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-emerald-600 bg-clip-text text-transparent">
              HealthLens AI
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-600">
              AI Care Companion
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {email && (
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-900">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {email}
            </span>
          )}
          <Link href="/login" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition">
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}
