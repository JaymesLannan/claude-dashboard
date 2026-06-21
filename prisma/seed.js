const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

const MODELS = [
  {
    name: "claude-opus-4-6",
    share: 0.10,
    peakInputTokens: 18000,
    peakOutputTokens: 4500,
    inputCostPerMTok: 5.0,
    outputCostPerMTok: 25.0,
  },
  {
    name: "claude-sonnet-4-6",
    share: 0.60,
    peakInputTokens: 140000,
    peakOutputTokens: 38000,
    inputCostPerMTok: 3.0,
    outputCostPerMTok: 15.0,
  },
  {
    name: "claude-haiku-4-5-20251001",
    share: 0.30,
    peakInputTokens: 75000,
    peakOutputTokens: 22000,
    inputCostPerMTok: 1.0,
    outputCostPerMTok: 5.0,
  },
];

// Hour-of-day multiplier (0-23) — business hours peak
function hourMultiplier(hour) {
  if (hour >= 0 && hour < 6) return 0.05;
  if (hour >= 6 && hour < 9) return 0.25;
  if (hour >= 9 && hour < 12) return 0.90 + Math.random() * 0.10;
  if (hour >= 12 && hour < 14) return 0.70 + Math.random() * 0.15;
  if (hour >= 14 && hour < 18) return 0.85 + Math.random() * 0.15;
  if (hour >= 18 && hour < 21) return 0.45 + Math.random() * 0.10;
  return 0.15;
}

// Day-of-week multiplier — weekends are quieter
function dayMultiplier(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return 0.25 + Math.random() * 0.10;
  return 0.85 + Math.random() * 0.15;
}

function jitter(value, pct = 0.15) {
  return Math.max(0, Math.round(value * (1 + (Math.random() * 2 - 1) * pct)));
}

async function main() {
  console.log("Clearing existing data...");
  await db.costRecord.deleteMany();
  await db.usageRecord.deleteMany();
  await db.syncLog.deleteMany();

  const now = new Date();
  const DAYS = 30;

  console.log(`Seeding ${DAYS} days of usage data...`);

  let usageCount = 0;
  let costCount = 0;

  for (let dayOffset = DAYS - 1; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - dayOffset);
    dayStart.setHours(0, 0, 0, 0);

    const dm = dayMultiplier(dayStart);

    for (const model of MODELS) {
      // Daily cost record
      let dailyInputTokens = 0;
      let dailyOutputTokens = 0;

      // Hourly usage records
      for (let hour = 0; hour < 24; hour++) {
        const bucketStart = new Date(dayStart);
        bucketStart.setHours(hour, 0, 0, 0);

        // Skip future hours
        if (bucketStart > now) continue;

        const bucketEnd = new Date(bucketStart);
        bucketEnd.setHours(hour + 1, 0, 0, 0);

        const hm = hourMultiplier(hour);
        const scale = dm * hm * model.share;

        const inputTokens = jitter(model.peakInputTokens * scale);
        const outputTokens = jitter(model.peakOutputTokens * scale);
        const cacheReadTokens = jitter(inputTokens * 0.18);
        const cacheCreateTokens = jitter(inputTokens * 0.06);
        const requestCount = jitter(Math.max(1, (inputTokens + outputTokens) / 800));

        dailyInputTokens += inputTokens;
        dailyOutputTokens += outputTokens;

        await db.usageRecord.upsert({
          where: {
            unique_bucket: {
              bucketStart,
              bucketWidth: "1h",
              model: model.name,
              workspaceId: "",
              serviceTier: "",
            },
          },
          create: {
            bucketStart,
            bucketEnd,
            bucketWidth: "1h",
            model: model.name,
            workspaceId: null,
            serviceTier: "standard",
            inputTokens: BigInt(inputTokens),
            outputTokens: BigInt(outputTokens),
            cacheReadTokens: BigInt(cacheReadTokens),
            cacheCreateTokens: BigInt(cacheCreateTokens),
            requestCount,
          },
          update: {
            inputTokens: BigInt(inputTokens),
            outputTokens: BigInt(outputTokens),
            cacheReadTokens: BigInt(cacheReadTokens),
            cacheCreateTokens: BigInt(cacheCreateTokens),
            requestCount,
          },
        });
        usageCount++;
      }

      // Daily cost record
      const dailyCost =
        (dailyInputTokens / 1_000_000) * model.inputCostPerMTok +
        (dailyOutputTokens / 1_000_000) * model.outputCostPerMTok;

      if (dailyCost > 0) {
        const bucketEnd = new Date(dayStart);
        bucketEnd.setDate(bucketEnd.getDate() + 1);

        await db.costRecord.upsert({
          where: {
            unique_cost_bucket: {
              bucketStart: dayStart,
              workspaceId: "",
              description: model.name,
            },
          },
          create: {
            bucketStart: dayStart,
            bucketEnd,
            workspaceId: null,
            description: model.name,
            model: model.name,
            costUsd: parseFloat(dailyCost.toFixed(6)),
          },
          update: {
            costUsd: parseFloat(dailyCost.toFixed(6)),
          },
        });
        costCount++;
      }
    }
  }

  // Add a successful sync log entry
  await db.syncLog.create({
    data: {
      status: "success",
      completedAt: new Date(),
      recordsSynced: usageCount + costCount,
    },
  });

  console.log(`Done — ${usageCount} usage records + ${costCount} cost records seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
