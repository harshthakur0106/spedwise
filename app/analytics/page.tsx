import { AppShell } from "@/components/app-shell";
import { FinanceCharts } from "@/components/finance-charts";
import { MonthPicker } from "@/components/month-picker";
import { getAnalyticsData } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const month = Number(params.month ?? new Date().getMonth() + 1);
  const year = Number(params.year ?? new Date().getFullYear());

  let analytics: Awaited<ReturnType<typeof getAnalyticsData>> | null = null;
  let configError = "";

  try {
    analytics = await getAnalyticsData(month, year);
  } catch (error) {
    configError = error instanceof Error ? error.message : "Database configuration failed.";
  }

  return (
    <AppShell active="analytics">
      <div className="space-y-6">
        <MonthPicker />

        {configError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {configError}
          </div>
        ) : null}

        {!analytics ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading analytics…
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total expenses</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(analytics.totalExpenses)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Highest category</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{analytics.highestSpendingCategory.name}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Lowest category</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{analytics.lowestSpendingCategory.name}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Average daily spending</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(analytics.averageDailySpending)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Planned vs actual</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(analytics.plannedAmount)}</p>
                <p className="mt-2 text-sm text-slate-500">Actual: {formatCurrency(analytics.totalExpenses)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Month-over-month</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(analytics.monthOverMonth.delta)}</p>
                <p className="mt-2 text-sm text-slate-500">Previous: {formatCurrency(analytics.monthOverMonth.previous)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Estimated month-end spending</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(analytics.estimatedMonthEnd)}</p>
                <p className="mt-2 text-sm text-slate-500">Estimate based on actual spending rate.</p>
              </div>
            </div>

            <FinanceCharts
              categoryTotals={analytics.categoryTotals}
              plannedVsActual={analytics.plannedVsActual}
              monthlyTrend={analytics.categoryTotals.map((item) => ({ name: item.name, value: item.value }))}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
