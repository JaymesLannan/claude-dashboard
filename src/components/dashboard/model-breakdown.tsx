"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokens, getModelColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ModelData {
  model: string | null;
  displayName: string;
  totalTokens: number;
  requestCount: number;
}

interface Props {
  data: ModelData[];
  loading?: boolean;
}

export function ModelBreakdown({ data, loading }: Props) {
  const total = data.reduce((acc, d) => acc + d.totalTokens, 0);

  const chartData = data.map((d) => ({
    name: d.displayName,
    value: d.totalTokens,
    color: getModelColor(d.model),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Model Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatTokens(value), "Tokens"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {data.map((d) => {
                const pct = total > 0 ? ((d.totalTokens / total) * 100).toFixed(1) : "0";
                return (
                  <div key={d.model ?? "unknown"} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getModelColor(d.model) }}
                      />
                      <span className="text-sm font-medium">{d.displayName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <Badge variant="secondary" className="text-xs">
                        {formatTokens(d.totalTokens)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
