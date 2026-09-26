import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { monthlyPlans } from "@/lib/db/schema";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const [plan] = await db.select().from(monthlyPlans).where(eq(monthlyPlans.id, Number(id))).limit(1);
    if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch plan." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const salary = Number(body.salary ?? 0);
    const db = getDb();

    const [updated] = await db
      .update(monthlyPlans)
      .set({ salary: String(salary), updatedAt: new Date() })
      .where(eq(monthlyPlans.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update plan." },
      { status: 500 },
    );
  }
}
