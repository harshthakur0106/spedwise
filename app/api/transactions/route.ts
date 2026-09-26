import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { getMonthlyPlanByKey } from "@/lib/db/queries";
import { monthlyPlans, transactions } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month") ?? "");
    const year = Number(searchParams.get("year") ?? "");
    const db = getDb();

    if (month && year) {
      const plan = await getMonthlyPlanByKey(month, year);
      if (!plan) {
        return NextResponse.json([]);
      }

      const rows = await db
        .select()
        .from(transactions)
        .where(eq(transactions.monthlyPlanId, plan.id))
        .orderBy(desc(transactions.date));
      return NextResponse.json(rows);
    }

    const rows = await db.select().from(transactions).orderBy(desc(transactions.date));
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch transactions." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const month = Number(body.month ?? new Date().getMonth() + 1);
    const year = Number(body.year ?? new Date().getFullYear());
    const amount = Number(body.amount ?? 0);
    const type = String(body.type ?? "expense");
    const description = String(body.description ?? "").trim();
    const date = body.date ? new Date(body.date) : new Date();
    const paymentMethod = String(body.paymentMethod ?? "Other");
    const notes = String(body.notes ?? "");
    const categoryId = body.categoryId ? Number(body.categoryId) : null;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date is required." }, { status: 400 });
    }

    if (type === "expense" && !categoryId) {
      return NextResponse.json({ error: "Category is required for expenses." }, { status: 400 });
    }

    const db = getDb();
    let finalPlan = await getMonthlyPlanByKey(month, year);

    if (!finalPlan) {
      const [newPlan] = await db
        .insert(monthlyPlans)
        .values({ month, year, salary: "0" })
        .returning();

      if (!newPlan) {
        throw new Error("Unable to create month plan for transaction.");
      }

      finalPlan = newPlan;
    }

    const [created] = await db
      .insert(transactions)
      .values({
        monthlyPlanId: finalPlan.id,
        categoryId: type === "expense" ? categoryId : null,
        type,
        amount: String(amount),
        description,
        date,
        paymentMethod,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create transaction." },
      { status: 500 },
    );
  }
}
