"use client";

import * as React from "react";
import { subDays, startOfDay } from "date-fns";
import { DollarSign, TrendingUp, BarChart2, Zap } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SyncStatus } from "@/components/dashboard/sync-status";
import { formatCost, formatTokens, getModelColor, modelDisplayName } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Metrics {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
  costUsd: number;
}

interface ModelData {
  model: string | null;
  displayName: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
}

export default function CostsPage() {
  const [range, setRange] = React.useState({
    from: startOfDay(subDays(new Date(), 29)),
    to: new Date(),
  });

  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [costSeries, setCostSeries] = React.useState<{ date: string; value: number }[]>([]);
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function fetchAll(from: Date, to: Date) {
    setLoading(true);
    const q = `from=${from.toISOString()}&to=${to.toISOString()}`;
    try {
      const [metricsRes, costRes, modelsRes] = await Promise.all([
        fetch(`/api/usage/metrics?${q}`),
        fetch(`/api/usage/timeseries?${q}&metric=cost`),
        fetch(`/api/usage/models?${q}`),
      ]);
      const [m, c, md] = await Promise.all([
        metricsRes.json(),
        costRes.json(),
        modelsRes.json(),
      ]);
      setMetrics(m);
      setCostSeries(c.series ?? []);
      setModels(md.breakdown ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchAll(range.from, range.to);
  }, [range.from, range.to]);

  const avgDailyCost =
    metrics && costSeries.length > 0
      ? metrics.costUsd / costSeries.length
      : 0;

  const peakDay =
    costSeries.length > 0
      ? costSeries.reduce((max, d) => (d.value > max.value ? d : max), costSeries[0])
      : null;

  const totalTokens = metrics?.totalTokens ?? 0;
  const costPerMToken =
    totalTokens > 0 && metrics ? (metrics.costUsd / totalTokens) * 1_000_000 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Cost Analysis</h1>
          <p className="text-sm text-muted-foreground">
            USD spend breakdown by day and model
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SyncStatus />
          <DateRangePicker onChange={setRange} />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Cost"
          value={metrics ? formatCost(metrics.costUsd) : "—"}
          subtitle="for selected period"
          icon={DollarSign}
          iconColor="text-green-600"
          loading={loading}
        />
        <MetricCard
          title="Avg Daily Cost"
          value={avgDailyCost ? formatCost(avgDailyCost) : "—"}
          subtitle="per day"
          icon={TrendingUp}
          iconColor="text-blue-600"
          loading={loading}
        />
        <MetricCard
          title="Cost / 1M Tokens"
          value={costPerMToken ? formatCost(costPerMToken) : "—"}
          subtitle="blended rate"
          icon={Zap}
          iconColor="text-violet-600"
          loading={loading}
        />
        <MetricCard
          title="Peak Day"
          value={peakDay ? formatCost(peakDay.value) : "—"}
          subtitle={peakDay ? peakDay.date : "no data"}
          icon={BarChart2}
          iconColor="text-orange-500"
          loading={loading}
        />
      </div>

      {/* Cost chart */}
      <UsageChart
        data={costSeries}
        title="Daily Cost (USD)"
        metric="cost"
        loading={loading}
        granularity="day"
      />

      {/* Per-model cost breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cost by Model</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data for this period</p>
          ) : (
            <div className="space-y-3">
              {models.map((m) => {
                const inputCostRate =
                  m.displayName === "Opus" ? 5 :
                  m.displayName === "Sonnet" ? 3 :
                  m.displayName === "Haiku" ? 1 : 3;
                const outputCostRate =
                  m.displayName === "Opus" ? 25 :
                  m.displayName === "Sonnet" ? 15 :
                  m.displayName === "Haiku" ? 5 : 15;
                const est =
                  (m.inputTokens / 1_000_000) * inputCostRate +
                  (m.outputTokens / 1_000_000) * outputCostRate;
                const totalEst = models.reduce((acc, x) => {
                  const ir = x.displayName === "Opus" ? 5 : x.displayName === "Sonnet" ? 3 : 1;
                  const or = x.displayName === "Opus" ? 25 : x.displayName === "Sonnet" ? 15 : 5;
                  return acc + (x.inputTokens / 1_000_000) * ir + (x.outputTokens / 1_000_000) * or;
                }, 0);
                const pct = totalEst > 0 ? ((est / totalEst) * 100).toFixed(1) : "0";
                return (
                  <div key={m.model ?? "unknown"} className="flex items-center gap-4">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: getModelColor(m.model) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{m.displayName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatCost(est)}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: getModelColor(m.model),
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTokens(m.inputTokens)} in · {formatTokens(m.outputTokens)} out
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
