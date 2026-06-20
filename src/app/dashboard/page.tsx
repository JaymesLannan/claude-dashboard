"use client";

import * as React from "react";
import { subDays, startOfDay } from "date-fns";
import { Zap, DollarSign, Activity, BarChart2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { ModelBreakdown } from "@/components/dashboard/model-breakdown";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SyncStatus } from "@/components/dashboard/sync-status";
import { formatTokens, formatCost, formatNumber } from "@/lib/utils";

interface Metrics {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
  costUsd: number;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface ModelData {
  model: string | null;
  displayName: string;
  totalTokens: number;
  requestCount: number;
}

export default function DashboardPage() {
  const [range, setRange] = React.useState({
    from: startOfDay(subDays(new Date(), 6)),
    to: new Date(),
  });

  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [tokenSeries, setTokenSeries] = React.useState<TimeSeriesPoint[]>([]);
  const [costSeries, setCostSeries] = React.useState<TimeSeriesPoint[]>([]);
  const [requestSeries, setRequestSeries] = React.useState<TimeSeriesPoint[]>([]);
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [granularity, setGranularity] = React.useState<"hour" | "day">("day");
  const [loading, setLoading] = React.useState(true);

  async function fetchAll(from: Date, to: Date) {
    setLoading(true);
    const q = `from=${from.toISOString()}&to=${to.toISOString()}`;
    try {
      const [metricsRes, tokenRes, costRes, requestRes, modelsRes] = await Promise.all([
        fetch(`/api/usage/metrics?${q}`),
        fetch(`/api/usage/timeseries?${q}&metric=tokens`),
        fetch(`/api/usage/timeseries?${q}&metric=cost`),
        fetch(`/api/usage/timeseries?${q}&metric=requests`),
        fetch(`/api/usage/models?${q}`),
      ]);

      const [m, t, c, r, md] = await Promise.all([
        metricsRes.json(),
        tokenRes.json(),
        costRes.json(),
        requestRes.json(),
        modelsRes.json(),
      ]);

      setMetrics(m);
      setTokenSeries(t.series ?? []);
      setCostSeries(c.series ?? []);
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

  function handleRangeChange(r: { from: Date; to: Date }) {
    setRange(r);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Usage Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your Claude API token consumption, costs, and requests
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SyncStatus />
          <DateRangePicker onChange={handleRangeChange} />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tokens"
          value={metrics ? formatTokens(metrics.totalTokens) : "—"}
          subtitle={
            metrics
              ? `${formatTokens(metrics.inputTokens)} in · ${formatTokens(metrics.outputTokens)} out`
              : undefined
          }
          icon={Zap}
          iconColor="text-blue-600"
          loading={loading}
        />
        <MetricCard
          title="Total Cost"
          value={metrics ? formatCost(metrics.costUsd) : "—"}
          subtitle="USD"
          icon={DollarSign}
          iconColor="text-green-600"
          loading={loading}
        />
        <MetricCard
          title="API Requests"
          value={metrics ? formatNumber(metrics.requestCount) : "—"}
          subtitle="total requests"
          icon={Activity}
          iconColor="text-purple-600"
          loading={loading}
        />
        <MetricCard
          title="Output Tokens"
          value={metrics ? formatTokens(metrics.outputTokens) : "—"}
          subtitle={`${metrics ? formatTokens(metrics.inputTokens) : "—"} input`}
          icon={BarChart2}
          iconColor="text-orange-500"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UsageChart
          data={tokenSeries}
          title="Token Usage"
          metric="tokens"
          loading={loading}
          granularity={granularity}
        />
        <UsageChart
          data={costSeries}
          title="Daily Cost (USD)"
          metric="cost"
          loading={loading}
          granularity="day"
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsageChart
            data={requestSeries}
            title="API Requests"
            metric="requests"
            loading={loading}
            granularity={granularity}
          />
        </div>
        <ModelBreakdown data={models} loading={loading} />
      </div>
    </div>
  );
}
