import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm">
          Phase 1 Foundation
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          COLLEGE OS
        </h1>
        <p className="text-lg text-slate-600">
          &quot;Your college. Your community. Your future.&quot;
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/admin/dashboard"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            Environment Status
          </Link>
          <Link
            href="/admin/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
