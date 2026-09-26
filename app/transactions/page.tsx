import { AppShell } from "@/components/app-shell";
import { MonthPicker } from "@/components/month-picker";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { getDb } from "@/lib/db/index";
import { ensureDefaultCategories, getMonthlyPlanByKey } from "@/lib/db/queries";
import { transactions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const month = Number(params.month ?? new Date().getMonth() + 1);
  const year = Number(params.year ?? new Date().getFullYear());

  let rows: Array<{
    id: number;
    monthlyPlanId: number;
    categoryId: number | null;
    type: string;
    amount: string;
    description: string;
    date: Date;
    paymentMethod: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  let categories: { id: number; name: string }[] = [];

  try {
    const plan = await getMonthlyPlanByKey(month, year);
    const db = getDb();
    categories = await ensureDefaultCategories();
    if (!plan) {
      rows = [];
    } else {
      rows = await db
        .select()
        .from(transactions)
        .where(eq(transactions.monthlyPlanId, plan.id))
        .orderBy(desc(transactions.date));
    }
  } catch (error) {
    rows = [];
    categories = await ensureDefaultCategories().catch(() => []);
    console.error(error);
  }

  return (
    <AppShell active="transactions">
      <div className="space-y-6">
        <MonthPicker />

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <TransactionForm categories={categories} />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Recent transactions</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {rows.length} records
              </span>
            </div>

            <TransactionTable rows={rows} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
