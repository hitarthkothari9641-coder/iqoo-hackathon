'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SystemHealth {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to probe backend health during development
    fetch('http://localhost:4000/api/v1/health')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.data) {
          setHealth(json.data);
        }
      })
      .catch(() => {
        // Backend not running on host yet or running in container
        setHealth({
          status: 'standby',
          service: 'CollegeOS Backend',
          version: '0.1.0',
          environment: 'development',
          timestamp: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const modules = [
    { name: 'Core Foundation & Multi-Tenancy', phase: 'Phase 1', status: 'Active (Foundation)', badge: 'bg-emerald-100 text-emerald-800' },
    { name: 'Identity & Authentication (SSO, OTP, RBAC)', phase: 'Phase 2', status: 'Scheduled', badge: 'bg-indigo-100 text-indigo-800' },
    { name: 'Academics & Timetable Engine', phase: 'Phase 3', status: 'Planned', badge: 'bg-slate-100 text-slate-700' },
    { name: 'Attendance & Fast Roll-Call', phase: 'Phase 3', status: 'Planned', badge: 'bg-slate-100 text-slate-700' },
    { name: 'Campus Social Feed & Communities', phase: 'Phase 4', status: 'Planned', badge: 'bg-slate-100 text-slate-700' },
    { name: 'Clubs & Events (Holo QR Passes)', phase: 'Phase 4', status: 'Planned', badge: 'bg-slate-100 text-slate-700' },
    { name: 'Career, Placements & Alumni', phase: 'Phase 5', status: 'Planned', badge: 'bg-slate-100 text-slate-700' },
    { name: 'Gemini AI Notice OCR & Tutor', phase: 'Phase 6', status: 'Planned', badge: 'bg-slate-100 text-slate-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              OS
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">College OS Console</h1>
              <p className="text-xs text-slate-500">Phase 1 Development & Environment Diagnostics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Phase 1 Clean Foundation
            </span>
            <Link
              href="/admin/login"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white"
            >
              Login Shell
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Environment Status & Architectural Readiness
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                &quot;Your college. Your community. Your future.&quot;
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-2 rounded-lg bg-slate-100 text-xs font-mono text-slate-700">
                v0.1.0-alpha
              </div>
              <div className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700">
                Multi-Tenant: Active
              </div>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Backend API</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">
                {loading ? 'Checking...' : health?.service || 'College OS API'}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Prefix: /api/v1 (NestJS + Swagger)
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Layer</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">PostgreSQL (Prisma)</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Schema: UUID v4 / Tenant Isolation
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cache & Queue</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">Redis / In-Memory</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Abstracted CacheService
            </p>
          </div>
        </div>

        {/* Module Lifecycle Roadmap */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Modular Architecture Status</h3>
            <span className="text-xs text-slate-500 font-mono">8 Core Pillars</span>
          </div>

          <div className="divide-y divide-slate-100">
            {modules.map((mod) => (
              <div key={mod.name} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-800">{mod.name}</h4>
                  <p className="text-xs text-slate-500">{mod.phase} implementation target</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${mod.badge}`}>
                  {mod.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & Security Principles */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Phase 1 Security & Tenancy Rules</h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
            <li><strong>Authoritative Backend:</strong> Admin UI never self-authorizes; all capabilities originate from verified backend permissions.</li>
            <li><strong>Tenant Isolation:</strong> No client-provided institution IDs are blindly trusted. Queries are strictly institution-scoped.</li>
            <li><strong>No Secrets in Frontend:</strong> Zero API keys, database credentials, or private certificates embedded in web or mobile assets.</li>
            <li><strong>Strict DTO Validation:</strong> All requests passing through API gateways are filtered and type-checked via global validation pipes.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
