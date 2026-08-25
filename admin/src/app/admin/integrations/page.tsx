'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface IntegrationItem {
  id: string;
  name: string;
  vendor: string;
  status: string;
  connectionType: string;
  lastSync: string;
  capabilities: string[];
}

export default function AdminIntegrationsPage() {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const integrations: IntegrationItem[] = [
    {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Mock ERP Provider (Development Only)',
      vendor: 'College OS Mock Suite',
      status: 'CONNECTED',
      connectionType: 'FILE_IMPORT',
      lastSync: '2026-08-25 23:00',
      capabilities: ['Students', 'Faculty', 'Subjects', 'Timetable', 'Attendance', 'Exams', 'Results'],
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Generic Campus ERP',
      vendor: 'Generic ERP Systems',
      status: 'PAUSED',
      connectionType: 'API_KEY',
      lastSync: '2026-08-24 18:30',
      capabilities: ['Students', 'Faculty', 'Attendance', 'Results'],
    },
  ];

  const handleSync = async (id: string) => {
    setSyncingId(id);
    setMessage(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:4000/api/v1/admin/integrations/${id}/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage(`Sync initiated successfully! Processed ${data.data.recordsProcessed || 0} records.`);
      } else {
        setMessage(data.error?.message || 'Sync failed or unauthorized.');
      }
    } catch (err: any) {
      setMessage('Sync request failed. Please check backend connection.');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-block rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Institutional Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
            ERP & Academic Integration Console
          </h1>
          <p className="text-sm text-slate-500">
            Manage official college ERP adapters, connection capabilities, and synchronization schedules.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← Back to Console
        </Link>
      </div>

      {message && (
        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-xs font-medium text-indigo-900">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">{item.vendor}</span>
                <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                  Method: {item.connectionType}
                </span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  item.status === 'CONNECTED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'PAUSED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700">Declared Capabilities:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.capabilities.map((cap) => (
                  <span key={cap} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                    ✓ {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Last Successful Sync: <span className="font-semibold text-slate-700">{item.lastSync}</span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => handleSync(item.id)}
                disabled={syncingId === item.id}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {syncingId === item.id ? 'Syncing...' : 'Trigger Manual Sync'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
