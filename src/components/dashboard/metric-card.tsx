import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string };
  loading?: boolean;
}

export function MetricCard({ title, value, subtitle, icon: Icon, iconColor = "text-blue-600", loading }: Props) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-muted" />
            ) : (
              <p className="mt-1.5 text-2xl font-bold text-foreground tracking-tight">{value}</p>
            )}
            {subtitle && !loading && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50", iconColor.includes("blue") ? "bg-blue-50" : iconColor.includes("green") ? "bg-green-50" : iconColor.includes("purple") ? "bg-purple-50" : "bg-orange-50")}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
