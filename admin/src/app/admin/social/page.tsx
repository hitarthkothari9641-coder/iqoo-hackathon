'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminSocialPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-block rounded-md bg-rose-900 px-3 py-1 text-xs font-semibold text-white">
            Moderation & Safety Console
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Social OS Moderation & Club Approvals
          </h1>
          <p className="text-sm text-slate-500">
            Review user reports, take audit-logged moderation actions, and approve pending club registration requests.
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
          <h3 className="text-base font-bold text-slate-900">Safety Reports Queue</h3>
          <p className="text-xs text-slate-500">Open Reports: <span className="font-bold text-rose-600">0 Pending</span></p>
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            View Moderation Queue
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">Pending Club Requests</h3>
          <p className="text-xs text-slate-500">Approval Requests: <span className="font-bold text-emerald-600">0 Pending</span></p>
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            Review Club Requests
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">Social Analytics</h3>
          <p className="text-xs text-slate-500">Active Communities: <span className="font-bold text-slate-900">2</span></p>
          <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            Social Engagement Overview
          </button>
        </div>
      </div>
    </div>
  );
}
