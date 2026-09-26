import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(categories);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database connection failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const db = getDb();
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (existing[0]) {
      return NextResponse.json({ error: "Category already exists." }, { status: 409 });
    }

    const [inserted] = await db.insert(categories).values({ name }).returning();
    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create category." },
      { status: 500 },
    );
  }
}
