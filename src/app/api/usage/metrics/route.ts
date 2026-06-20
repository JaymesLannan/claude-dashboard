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

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const start = new Date(from);
  const end = new Date(to);

  const [usageAgg, costAgg] = await Promise.all([
    db.usageRecord.aggregate({
      where: { bucketStart: { gte: start, lte: end } },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        cacheReadTokens: true,
        cacheCreateTokens: true,
        requestCount: true,
      },
    }),
    db.costRecord.aggregate({
      where: { bucketStart: { gte: start, lte: end } },
      _sum: { costUsd: true },
    }),
  ]);

  const inputTokens = Number(usageAgg._sum.inputTokens ?? 0);
  const outputTokens = Number(usageAgg._sum.outputTokens ?? 0);
  const cacheReadTokens = Number(usageAgg._sum.cacheReadTokens ?? 0);
  const cacheCreateTokens = Number(usageAgg._sum.cacheCreateTokens ?? 0);
  const totalTokens = inputTokens + outputTokens + cacheReadTokens + cacheCreateTokens;
  const requestCount = usageAgg._sum.requestCount ?? 0;
  const costUsd = Number(costAgg._sum.costUsd ?? 0);

  return NextResponse.json({
    totalTokens,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheCreateTokens,
    requestCount,
    costUsd,
  });
}
