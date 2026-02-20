import { AuthGuard } from "@/components/auth-guard";
import { KpiCards } from "@/components/kpi-cards";
import { Charts } from "@/components/charts";


export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">Your collection at a glance</p>

          <div className="mt-6">
            <KpiCards />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Charts />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

