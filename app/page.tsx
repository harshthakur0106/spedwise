import Link from "next/link";
import { ArrowUpRight, PiggyBank, ReceiptText, TrendingDown, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FinanceCharts } from "@/components/finance-charts";
import { MonthPicker } from "@/components/month-picker";
import { getDashboardData } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const month = Number(params.month ?? new Date().getMonth() + 1);
  const year = Number(params.year ?? new Date().getFullYear());

  let dashboardData: Awaited<ReturnType<typeof getDashboardData>> | null = null;
  let configError = "";

  try {
    dashboardData = await getDashboardData(month, year);
  } catch (error) {
    configError = error instanceof Error ? error.message : "Database configuration failed.";
  }

  const chartCategoryData = (dashboardData?.categoryBreakdown ?? [])
    .filter((entry) => entry.spentAmount > 0)
    .map((entry) => ({ name: entry.name, value: entry.spentAmount }));

  const pieReality = chartCategoryData.length > 0 ? chartCategoryData : [{ name: "No data", value: 1 }];

  const plannedVsActual = [
    { name: "Planned", value: Number(dashboardData?.totalPlanned ?? 0) },
    { name: "Actual", value: Number(dashboardData?.totalExpenses ?? 0) },
  ];

  const monthlyTrend = [
    { name: "Planned", value: Number(dashboardData?.totalPlanned ?? 0) },
    { name: "Spent", value: Number(dashboardData?.totalExpenses ?? 0) },
  ];

  return (
    <AppShell active="dashboard">
      <div className="space-y-6">
        <MonthPicker />

        {configError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {configError}
          </div>
        ) : null}

        {!dashboardData ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading data…
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Monthly Salary" value={formatCurrency(dashboardData.plan.salary)} hint="Salary for selected month" icon={Wallet} />
              <StatCard label="Additional Income" value={formatCurrency(dashboardData.totalIncome - Number(dashboardData.plan.salary || 0))} hint="Income from transactions" icon={ArrowUpRight} />
              <StatCard label="Total Expenses" value={formatCurrency(dashboardData.totalExpenses)} hint="All expense transactions" icon={TrendingDown} />
              <StatCard label="Remaining Balance" value={formatCurrency(dashboardData.remainingBalance)} hint="Income minus expenses" icon={Wallet} />
              <StatCard label="Planned Budget" value={formatCurrency(dashboardData.totalPlanned)} hint="Total planned allocation" icon={ReceiptText} />
              <StatCard label="Actual Spending" value={formatCurrency(dashboardData.totalExpenses)} hint="Expense total in this month" icon={PiggyBank} />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Monthly Financial Overview</h3>
                <Link href="/transactions" className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                  View all
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total income</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dashboardData.totalIncome)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total expenses</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dashboardData.totalExpenses)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Remaining balance</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dashboardData.remainingBalance)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Savings</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dashboardData.savings)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Planned allocation</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dashboardData.totalPlanned)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Unallocated budget</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dashboardData.unallocatedBudget)}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Budget Progress</h3>
                  <p className="text-sm text-slate-500">Category-wise</p>
                </div>
                <div className="space-y-4">
                  {dashboardData.categoryBreakdown.map((category) => {
                    const progress = Math.max(0, Math.min((category.progress || 0), 100));
                    const barColor = progress >= 100 ? "bg-red-500" : progress >= 75 ? "bg-yellow-500" : "bg-emerald-500";

                    return (
                      <div key={category.categoryId} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{category.name}</span>
                          <span className="text-slate-500">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Planned: {formatCurrency(category.plannedAmount)}</span>
                          <span>Spent: {formatCurrency(category.spentAmount)}</span>
                          <span>Remaining: {formatCurrency(category.remaining)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Recent Transactions</h3>
                  <Link href="/transactions" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {dashboardData.recentTransactions.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No transactions yet.</div>
                  ) : (
                    dashboardData.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div>
                          <p className="font-medium text-slate-800">{transaction.description}</p>
                          <p className="text-xs text-slate-500">{transaction.categoryName} · {new Date(transaction.date).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-800"}`}>
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs capitalize text-slate-500">{transaction.type}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <FinanceCharts
              categoryTotals={pieReality}
              plannedVsActual={plannedVsActual}
              monthlyTrend={monthlyTrend}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
