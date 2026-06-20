import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { modelDisplayName } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const start = new Date(from);
  const end = new Date(to);

  const records = await db.usageRecord.groupBy({
    by: ["model"],
    where: { bucketStart: { gte: start, lte: end } },
    _sum: {
      inputTokens: true,
      outputTokens: true,
      cacheReadTokens: true,
      cacheCreateTokens: true,
      requestCount: true,
    },
  });

  const breakdown = records.map((r) => {
    const totalTokens =
      Number(r._sum.inputTokens ?? 0) +
      Number(r._sum.outputTokens ?? 0) +
      Number(r._sum.cacheReadTokens ?? 0) +
      Number(r._sum.cacheCreateTokens ?? 0);
    return {
      model: r.model,
      displayName: modelDisplayName(r.model),
      totalTokens,
      inputTokens: Number(r._sum.inputTokens ?? 0),
      outputTokens: Number(r._sum.outputTokens ?? 0),
      requestCount: r._sum.requestCount ?? 0,
    };
  });

  // Sort by total tokens desc
  breakdown.sort((a, b) => b.totalTokens - a.totalTokens);

  return NextResponse.json({ breakdown });
}
