import { db } from "@/lib/db";

const ADMIN_API_BASE = "https://api.anthropic.com";
const ANTHROPIC_VERSION = "2023-06-01";

function adminHeaders() {
  return {
    "anthropic-version": ANTHROPIC_VERSION,
    "x-api-key": process.env.ANTHROPIC_ADMIN_KEY!,
    "Content-Type": "application/json",
  };
}

interface UsageBucket {
  start_time: string;
  end_time: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
  request_count?: number;
  model?: string;
  workspace_id?: string;
  service_tier?: string;
}

interface UsageResponse {
  results: UsageBucket[];
  has_more: boolean;
  next_page?: string;
}

interface CostBucket {
  start_time: string;
  end_time: string;
  cost: string;
  workspace_id?: string;
  description?: string;
  model?: string;
}

interface CostResponse {
  results: CostBucket[];
  has_more: boolean;
  next_page?: string;
}

async function fetchAllPages<T>(
  url: string,
  pageKey: string = "page"
): Promise<T[]> {
  const results: T[] = [];
  let nextPage: string | undefined;

  do {
    const fullUrl = nextPage ? `${url}&${pageKey}=${nextPage}` : url;
    const res = await fetch(fullUrl, { headers: adminHeaders() });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Admin API error ${res.status}: ${body}`);
    }
    const data = (await res.json()) as { results: T[]; has_more: boolean; next_page?: string };
    results.push(...data.results);
    nextPage = data.has_more ? data.next_page : undefined;
  } while (nextPage);

  return results;
}

export async function syncUsage(startingAt: Date, endingAt: Date): Promise<number> {
  const params = new URLSearchParams({
    starting_at: startingAt.toISOString(),
    ending_at: endingAt.toISOString(),
    bucket_width: "1h",
  });
  params.append("group_by[]", "model");
  params.append("group_by[]", "workspace_id");
  params.append("group_by[]", "service_tier");

  const url = `${ADMIN_API_BASE}/v1/organizations/usage_report/messages?${params}`;
  const buckets = await fetchAllPages<UsageBucket>(url);

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

export async function syncCosts(startingAt: Date, endingAt: Date): Promise<number> {
  const params = new URLSearchParams({
    starting_at: startingAt.toISOString(),
    ending_at: endingAt.toISOString(),
  });
  params.append("group_by[]", "workspace_id");
  params.append("group_by[]", "description");

  const url = `${ADMIN_API_BASE}/v1/organizations/cost_report?${params}`;
  const buckets = await fetchAllPages<CostBucket>(url);

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

export async function runSync(): Promise<{ usageSynced: number; costSynced: number }> {
  const log = await db.syncLog.create({
    data: { status: "running" },
  });

  try {
    // Sync last 25 hours with overlap to catch any stragglers
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

    return { usageSynced, costSynced };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.syncLog.update({
      where: { id: log.id },
      data: { status: "error", completedAt: new Date(), errorMessage: message },
    });
    throw err;
  }
}
