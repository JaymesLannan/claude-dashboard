import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const ADMIN_API_BASE = "https://api.anthropic.com";

function adminHeaders() {
  return {
    "anthropic-version": "2023-06-01",
    "x-api-key": process.env.ANTHROPIC_ADMIN_KEY,
    "Content-Type": "application/json",
  };
}

async function fetchAllPages(url) {
  const results = [];
  let nextPage;
  do {
    const fullUrl = nextPage ? `${url}&page=${nextPage}` : url;
    const res = await fetch(fullUrl, { headers: adminHeaders() });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Admin API error ${res.status}: ${body}`);
    }
    const data = await res.json();
    results.push(...data.results);
    nextPage = data.has_more ? data.next_page : undefined;
  } while (nextPage);
  return results;
}

async function syncUsage(startingAt, endingAt) {
  const params = new URLSearchParams({
    starting_at: startingAt.toISOString(),
    ending_at: endingAt.toISOString(),
    bucket_width: "1h",
  });
  params.append("group_by[]", "model");
  params.append("group_by[]", "workspace_id");
  params.append("group_by[]", "service_tier");

  const url = `${ADMIN_API_BASE}/v1/organizations/usage_report/messages?${params}`;
  const buckets = await fetchAllPages(url);

  let upserted = 0;
  for (const b of buckets) {
    await db.usageRecord.upsert({
      where: {
        unique_bucket: {
          bucketStart: new Date(b.start_time),
          bucketWidth: "1h",
          model: b.model ?? "",
          workspaceId: b.workspace_id ?? "",
          serviceTier: b.service_tier ?? "",
        },
      },
      create: {
        bucketStart: new Date(b.start_time),
        bucketEnd: new Date(b.end_time),
        bucketWidth: "1h",
        model: b.model ?? null,
        workspaceId: b.workspace_id ?? null,
        serviceTier: b.service_tier ?? null,
        inputTokens: BigInt(b.input_tokens),
        outputTokens: BigInt(b.output_tokens),
        cacheReadTokens: BigInt(b.cache_read_input_tokens),
        cacheCreateTokens: BigInt(b.cache_creation_input_tokens),
        requestCount: b.request_count ?? 0,
      },
      update: {
        inputTokens: BigInt(b.input_tokens),
        outputTokens: BigInt(b.output_tokens),
        cacheReadTokens: BigInt(b.cache_read_input_tokens),
        cacheCreateTokens: BigInt(b.cache_creation_input_tokens),
        requestCount: b.request_count ?? 0,
      },
    });
    upserted++;
  }
  return upserted;
}

async function syncCosts(startingAt, endingAt) {
  const params = new URLSearchParams({
    starting_at: startingAt.toISOString(),
    ending_at: endingAt.toISOString(),
  });
  params.append("group_by[]", "workspace_id");
  params.append("group_by[]", "description");

  const url = `${ADMIN_API_BASE}/v1/organizations/cost_report?${params}`;
  const buckets = await fetchAllPages(url);

  let upserted = 0;
  for (const b of buckets) {
    await db.costRecord.upsert({
      where: {
        unique_cost_bucket: {
          bucketStart: new Date(b.start_time),
          workspaceId: b.workspace_id ?? "",
          description: b.description ?? "",
        },
      },
      create: {
        bucketStart: new Date(b.start_time),
        bucketEnd: new Date(b.end_time),
        workspaceId: b.workspace_id ?? null,
        description: b.description ?? null,
        model: b.model ?? null,
        costUsd: parseFloat(b.cost) / 100,
      },
      update: {
        costUsd: parseFloat(b.cost) / 100,
        model: b.model ?? null,
      },
    });
    upserted++;
  }
  return upserted;
}

async function runSync() {
  const log = await db.syncLog.create({ data: { status: "running" } });
  console.log(`[sync] Starting sync (log id: ${log.id})`);

  try {
    const endingAt = new Date();
    const startingAt = new Date(endingAt.getTime() - 25 * 60 * 60 * 1000);

    const [usageSynced, costSynced] = await Promise.all([
      syncUsage(startingAt, endingAt),
      syncCosts(startingAt, endingAt),
    ]);

    await db.syncLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        completedAt: new Date(),
        recordsSynced: usageSynced + costSynced,
      },
    });

    console.log(`[sync] Done — ${usageSynced} usage + ${costSynced} cost records`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.syncLog.update({
      where: { id: log.id },
      data: { status: "error", completedAt: new Date(), errorMessage: message },
    });
    console.error(`[sync] Error: ${message}`);
  }
}

// Run immediately on startup
runSync();

// Then every hour at :05 past (data lag ~5 min)
cron.schedule("5 * * * *", () => {
  console.log("[sync] Hourly tick");
  runSync();
});

console.log("[sync] Worker started — syncing every hour at :05");
