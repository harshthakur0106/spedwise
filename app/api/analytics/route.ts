import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    const analytics = await getAnalyticsData(month, year);
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to compute analytics." },
      { status: 500 },
    );
  }
}
