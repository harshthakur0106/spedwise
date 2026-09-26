import assert from "node:assert/strict";
import test from "node:test";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { ensureDefaultMonthlyData, getMonthlyPlanByKey } from "../lib/db/queries";
import { budgetAllocations, transactions } from "../lib/db/schema";

test("seed default monthly data when a month has no plan", async () => {
  const month = 9;
  const year = 2026;

  await ensureDefaultMonthlyData(month, year);

  const plan = await getMonthlyPlanByKey(month, year);
  assert.ok(plan, "monthly plan should be created");

  const db = getDb();
  const allocations = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.monthlyPlanId, plan!.id));
  const monthTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.monthlyPlanId, plan!.id));

  assert.ok(allocations.length >= 5, "default allocations should be seeded");
  assert.ok(monthTransactions.length >= 3, "default transactions should be seeded");
});
