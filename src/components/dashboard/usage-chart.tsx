"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokens, formatNumber } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  title: string;
  metric: "tokens" | "requests" | "cost";
  loading?: boolean;
  granularity?: "hour" | "day";
}

function formatXLabel(date: string, granularity: "hour" | "day") {
  if (granularity === "hour") {
    return date.slice(11, 16); // HH:MM
  }
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

function formatYAxis(value: number, metric: "tokens" | "requests" | "cost") {
  if (metric === "cost") return `$${value.toFixed(2)}`;
  return formatNumber(value);
}

function formatTooltip(value: number, metric: "tokens" | "requests" | "cost") {
  if (metric === "cost") return [`$${value.toFixed(4)}`, "Cost"];
  if (metric === "requests") return [formatNumber(value), "Requests"];
  return [formatTokens(value), "Tokens"];
}

export function UsageChart({ data, title, metric, loading, granularity = "day" }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatXLabel(d, granularity)}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatYAxis(v, metric)}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value: number) => formatTooltip(value, metric)}
                labelFormatter={(label) => formatXLabel(label, granularity)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
