import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const metric = searchParams.get("metric") ?? "tokens"; // "tokens" | "cost" | "requests"

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const start = new Date(from);
  const end = new Date(to);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  if (metric === "cost") {
    const records = await db.costRecord.findMany({
      where: { bucketStart: { gte: start, lte: end } },
      orderBy: { bucketStart: "asc" },
      select: { bucketStart: true, costUsd: true },
    });

    // Group by day
    const byDay: Record<string, number> = {};
    for (const r of records) {
      const key = r.bucketStart.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] ?? 0) + Number(r.costUsd);
    }

    const series = Object.entries(byDay).map(([date, value]) => ({ date, value }));
    return NextResponse.json({ series });
  }

  // Tokens or requests — use usage records
  const records = await db.usageRecord.findMany({
    where: { bucketStart: { gte: start, lte: end } },
    orderBy: { bucketStart: "asc" },
    select: {
      bucketStart: true,
      inputTokens: true,
      outputTokens: true,
      cacheReadTokens: true,
      cacheCreateTokens: true,
      requestCount: true,
    },
  });

  // Group by day or hour depending on range
  const granularity = diffDays <= 2 ? "hour" : "day";
  const byBucket: Record<string, number> = {};

  for (const r of records) {
    const key =
      granularity === "hour"
        ? r.bucketStart.toISOString().slice(0, 13) + ":00"
        : r.bucketStart.toISOString().slice(0, 10);

    if (metric === "requests") {
      byBucket[key] = (byBucket[key] ?? 0) + r.requestCount;
    } else {
      const tokens =
        Number(r.inputTokens) +
        Number(r.outputTokens) +
        Number(r.cacheReadTokens) +
        Number(r.cacheCreateTokens);
      byBucket[key] = (byBucket[key] ?? 0) + tokens;
    }
  }

  const series = Object.entries(byBucket).map(([date, value]) => ({ date, value }));
  return NextResponse.json({ series, granularity });
}
