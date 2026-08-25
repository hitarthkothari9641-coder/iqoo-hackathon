'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center space-y-2">
          <div className="inline-block rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Institutional Admin
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            College OS Console
          </h2>
          <p className="text-xs text-slate-500">
            Phase 1 Authentication Boundary: Real backend authentication will be enabled in Phase 2.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-medium text-slate-700">Institutional Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <strong>Security Boundary Notice:</strong> Client-side authentication is intentionally non-functional in Phase 1. Backend authorization is authoritative.
          </div>

          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-slate-400 px-4 py-2.5 text-sm font-medium text-white cursor-not-allowed opacity-75"
          >
            Sign In (Phase 2)
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/admin/dashboard" className="text-xs font-medium text-indigo-600 hover:underline">
            ← View Environment Diagnostics
          </Link>
        </div>
      </div>
    </div>
  );
}
