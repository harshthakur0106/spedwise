import assert from "node:assert/strict";
import test from "node:test";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { getMonthlyPlanByKey } from "../lib/db/queries";
import { transactions } from "../lib/db/schema";

test("delete an inserted transaction", async () => {
  const db = getDb();
  const month = 9;
  const year = 2026;
  const plan = await getMonthlyPlanByKey(month, year);

  assert.ok(plan, "monthly plan should exist for the test month");

  const [created] = await db
    .insert(transactions)
    .values({
      monthlyPlanId: plan!.id,
      type: "expense",
      amount: "1999",
      description: "Test delete row",
      date: new Date("2026-09-15T00:00:00.000Z"),
      paymentMethod: "Card",
      notes: "Temporary deletion test",
    })
    .returning();

  assert.ok(created, "transaction should be inserted");

  const [deleted] = await db
    .delete(transactions)
    .where(eq(transactions.id, created.id))
    .returning();

  assert.ok(deleted, "transaction should be deleted");
  assert.equal(deleted.id, created.id, "deleted record should match inserted record");
});
