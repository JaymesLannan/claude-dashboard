"use client";

import * as React from "react";
import { subDays, startOfDay } from "date-fns";
import { Zap, Activity, ArrowDown, ArrowUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { ModelBreakdown } from "@/components/dashboard/model-breakdown";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SyncStatus } from "@/components/dashboard/sync-status";
import { formatTokens, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metrics {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreateTokens: number;
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

export default function UsagePage() {
  const [range, setRange] = React.useState({
    from: startOfDay(subDays(new Date(), 6)),
    to: new Date(),
  });

  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [tokenSeries, setTokenSeries] = React.useState<{ date: string; value: number }[]>([]);
  const [requestSeries, setRequestSeries] = React.useState<{ date: string; value: number }[]>([]);
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [granularity, setGranularity] = React.useState<"hour" | "day">("day");
  const [loading, setLoading] = React.useState(true);

  async function fetchAll(from: Date, to: Date) {
    setLoading(true);
    const q = `from=${from.toISOString()}&to=${to.toISOString()}`;
    try {
      const [metricsRes, tokenRes, requestRes, modelsRes] = await Promise.all([
        fetch(`/api/usage/metrics?${q}`),
        fetch(`/api/usage/timeseries?${q}&metric=tokens`),
        fetch(`/api/usage/timeseries?${q}&metric=requests`),
        fetch(`/api/usage/models?${q}`),
      ]);
      const [m, t, r, md] = await Promise.all([
        metricsRes.json(),
        tokenRes.json(),
        requestRes.json(),
        modelsRes.json(),
      ]);
      setMetrics(m);
      setTokenSeries(t.series ?? []);
      setRequestSeries(r.series ?? []);
      setGranularity(t.granularity ?? "day");
      setModels(md.breakdown ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchAll(range.from, range.to);
  }, [range.from, range.to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Token Usage</h1>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of input, output, and cache token consumption
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
          title="Total Tokens"
          value={metrics ? formatTokens(metrics.totalTokens) : "—"}
          subtitle="input + output + cache"
          icon={Zap}
          iconColor="text-blue-600"
          loading={loading}
        />
        <MetricCard
          title="Input Tokens"
          value={metrics ? formatTokens(metrics.inputTokens) : "—"}
          subtitle="tokens sent to model"
          icon={ArrowUp}
          iconColor="text-violet-600"
          loading={loading}
        />
        <MetricCard
          title="Output Tokens"
          value={metrics ? formatTokens(metrics.outputTokens) : "—"}
          subtitle="tokens generated"
          icon={ArrowDown}
          iconColor="text-green-600"
          loading={loading}
        />
        <MetricCard
          title="API Requests"
          value={metrics ? formatNumber(metrics.requestCount) : "—"}
          subtitle="total requests"
          icon={Activity}
          iconColor="text-orange-500"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UsageChart
          data={tokenSeries}
          title="Token Usage Over Time"
          metric="tokens"
          loading={loading}
          granularity={granularity}
        />
        <UsageChart
          data={requestSeries}
          title="API Requests Over Time"
          metric="requests"
          loading={loading}
          granularity={granularity}
        />
      </div>

      {/* Cache + model breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cache Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium">Cache Read</span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatTokens(metrics?.cacheReadTokens ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium">Cache Write</span>
                  <span className="text-sm font-bold text-violet-600">
                    {formatTokens(metrics?.cacheCreateTokens ?? 0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Cache reads are cheaper than standard input tokens
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <ModelBreakdown data={models} loading={loading} />
        </div>
      </div>
    </div>
  );
}
