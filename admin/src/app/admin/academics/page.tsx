'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminAcademicsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-block rounded-md bg-indigo-900 px-3 py-1 text-xs font-semibold text-white">
            Institutional Academic Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Academic Operating System Console
          </h1>
          <p className="text-sm text-slate-500">
            Configure academic policies, attendance thresholds, calendar events, and institution analytics.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← Back to Console
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">Attendance Policies</h3>
          <p className="text-xs text-slate-500">Configured warning threshold: <span className="font-bold text-slate-900">75%</span></p>
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            Update Threshold
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">Academic Calendar</h3>
          <p className="text-xs text-slate-500">Upcoming: <span className="font-bold text-slate-900">Midterm Exam Week (Sep 15 - Sep 22)</span></p>
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            Manage Calendar Events
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">Department Workload</h3>
          <p className="text-xs text-slate-500">Active Departments: <span className="font-bold text-slate-900">4</span></p>
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
