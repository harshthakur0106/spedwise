import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { budgetAllocations } from "@/lib/db/schema";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const rows = await db
      .select()
      .from(budgetAllocations)
      .where(eq(budgetAllocations.monthlyPlanId, Number(id)));
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load allocations." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const categoryId = Number(body.categoryId);
    const plannedAmount = Number(body.plannedAmount ?? 0);

    if (!categoryId || !plannedAmount || plannedAmount < 0) {
      return NextResponse.json({ error: "Valid category and budget amount are required." }, { status: 400 });
    }

    const db = getDb();
    const existing = await db
      .select()
      .from(budgetAllocations)
      .where(
        and(
          eq(budgetAllocations.monthlyPlanId, Number(id)),
          eq(budgetAllocations.categoryId, categoryId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return NextResponse.json({ error: "This category already exists in the plan." }, { status: 409 });
    }

    const [created] = await db
      .insert(budgetAllocations)
      .values({
        monthlyPlanId: Number(id),
        categoryId,
        plannedAmount: String(plannedAmount),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create allocation." },
      { status: 500 },
    );
  }
}
