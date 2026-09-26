import { AppShell } from "@/components/app-shell";
import { MonthPicker } from "@/components/month-picker";
import { PlanForm } from "@/components/plan-form";
import { SalaryEditor } from "@/components/salary-editor";
import { getMonthlyPlanByKey, getMonthlyPlanWithAllocations } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const month = Number(params.month ?? new Date().getMonth() + 1);
  const year = Number(params.year ?? new Date().getFullYear());

  let plan: Awaited<ReturnType<typeof getMonthlyPlanByKey>> | null = null;
  let budget: Awaited<ReturnType<typeof getMonthlyPlanWithAllocations>> | null = null;
  let configError = "";

  try {
    plan = await getMonthlyPlanByKey(month, year);
    budget = await getMonthlyPlanWithAllocations(month, year);
  } catch (error) {
    configError = error instanceof Error ? error.message : "Database configuration failed.";
  }

  return (
    <AppShell active="settings">
      <div className="space-y-6">
        <MonthPicker />

        {configError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {configError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            {plan ? (
              <SalaryEditor planId={plan.id} currentSalary={Number(plan.salary ?? 0)} />
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-xl font-semibold text-slate-900">Salary management</h3>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Selected monthly salary</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(0)}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <PlanForm
              currentMonth={month}
              currentYear={year}
              currentSalary={Number(plan?.salary ?? 0)}
              hasExistingPlan={Boolean(plan)}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
