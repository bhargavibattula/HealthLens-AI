'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate register and redirect
    window.location.href = '/dashboard';
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-500/30">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            Join HealthLens AI and manage your family's medical history.
          </p>
        </div>

        {/* Register Card */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 rounded-3xl shadow-2xl border border-emerald-500/20">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="input"
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-emerald-500/30 mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Creating Account…</span>
              </>
            ) : (
              <span>Get Started Free →</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-500">
            Sign In
          </Link>
        </p>

      </div>
    </main>
  );
}
