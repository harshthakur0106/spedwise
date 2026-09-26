import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { budgetAllocations } from "@/lib/db/schema";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const plannedAmount = Number(body.plannedAmount ?? 0);

    if (!plannedAmount || plannedAmount < 0) {
      return NextResponse.json({ error: "Budget amount must be greater than zero." }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(budgetAllocations)
      .set({ plannedAmount: String(plannedAmount), updatedAt: new Date() })
      .where(eq(budgetAllocations.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Allocation not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update allocation." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const [deleted] = await db
      .delete(budgetAllocations)
      .where(eq(budgetAllocations.id, Number(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Allocation not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete allocation." },
      { status: 500 },
    );
  }
}
