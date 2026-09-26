import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { budgetAllocations, monthlyPlans } from "@/lib/db/schema";
import { getMonthlyPlanByKey } from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month") ?? "");
    const year = Number(searchParams.get("year") ?? "");
    const db = getDb();

    if (month && year) {
      const plan = await getMonthlyPlanByKey(month, year);
      return NextResponse.json(plan ? [plan] : []);
    }

    const rows = await db.select().from(monthlyPlans).orderBy(monthlyPlans.year, monthlyPlans.month);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch plans." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const month = Number(body.month);
    const year = Number(body.year);
    const salary = Number(body.salary ?? 0);
    const copyPrevious = Boolean(body.copyPrevious);

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required." }, { status: 400 });
    }

    const db = getDb();
    const existing = await getMonthlyPlanByKey(month, year);
    if (existing) {
      return NextResponse.json({ error: "A plan for this month already exists." }, { status: 409 });
    }

    const [created] = await db
      .insert(monthlyPlans)
      .values({ month, year, salary: String(salary) })
      .returning();

    if (copyPrevious) {
      const previous = await db
        .select()
        .from(monthlyPlans)
        .where(
          and(
            eq(monthlyPlans.month, month === 1 ? 12 : month - 1),
            eq(monthlyPlans.year, month === 1 ? year - 1 : year),
          ),
        )
        .limit(1);

      if (previous[0]) {
        const allocations = await db
          .select()
          .from(budgetAllocations)
          .where(eq(budgetAllocations.monthlyPlanId, previous[0].id));

        for (const allocation of allocations) {
          await db.insert(budgetAllocations).values({
            monthlyPlanId: created.id,
            categoryId: allocation.categoryId,
            plannedAmount: String(allocation.plannedAmount),
          });
        }
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create plan." },
      { status: 500 },
    );
  }
}
