import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { transactions } from "@/lib/db/schema";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount ?? 0);
    const type = String(body.type ?? "expense");
    const description = String(body.description ?? "").trim();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(transactions)
      .set({
        type,
        amount: String(amount),
        description,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        date: new Date(body.date ?? new Date()),
        paymentMethod: String(body.paymentMethod ?? "Other"),
        notes: body.notes ? String(body.notes) : null,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update transaction." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const [deleted] = await db
      .delete(transactions)
      .where(eq(transactions.id, Number(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete transaction." },
      { status: 500 },
    );
  }
}
