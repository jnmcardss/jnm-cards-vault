"use client";
import { AuthGuard } from "@/components/auth-guard";
import { KpiCards } from "@/components/kpi-cards";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">Your collection at a glance</p>

          <div className="mt-6">
            <KpiCards />
          </div>

          {/* Charts removed */}
        </main>
      </div>
    </AuthGuard>
  );
}