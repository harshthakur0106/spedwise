import { AppShell } from "@/components/app-shell";
import { BudgetAllocationEditor } from "@/components/budget-allocation-editor";
import { MonthPicker } from "@/components/month-picker";
import { getMonthlyPlanWithAllocations } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const month = Number(params.month ?? new Date().getMonth() + 1);
  const year = Number(params.year ?? new Date().getFullYear());

  let budgetData: Awaited<ReturnType<typeof getMonthlyPlanWithAllocations>> | null = null;
  let configError = "";

  try {
    budgetData = await getMonthlyPlanWithAllocations(month, year);
  } catch (error) {
    configError = error instanceof Error ? error.message : "Database configuration failed.";
  }

  return (
    <AppShell active="budget">
      <div className="space-y-6">
        <MonthPicker />

        {configError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {configError}
          </div>
        ) : null}

        {!budgetData ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading budget plan…
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Planned budget</h3>
                <p className="text-sm text-slate-500">
                  Set the exact budget for each category for {month}/{year}.
                </p>
              </div>
            </div>

            <BudgetAllocationEditor
              planId={budgetData.plan.id}
              planSalary={budgetData.plan.salary}
              categories={budgetData.categories}
              allocations={budgetData.allocations}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
