"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Save, RotateCcw } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-blue-600" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, update } = useSettings();
  const [saved, setSaved] = React.useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    update({
      defaultRange: "7d",
      showModels: { opus: true, sonnet: true, haiku: true, fable: true },
      includeCacheInTotal: true,
      chartStyle: "area",
    });
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const models: { key: keyof typeof settings.showModels; label: string; description: string }[] = [
    { key: "opus", label: "Claude Opus", description: "Most capable, highest cost" },
    { key: "sonnet", label: "Claude Sonnet", description: "Best balance of speed and intelligence" },
    { key: "haiku", label: "Claude Haiku", description: "Fastest and most compact" },
    { key: "fable", label: "Claude Fable", description: "Latest generation model" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your dashboard appearance and report preferences
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how the dashboard looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
                  theme === t.value
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                    : "border-border bg-card text-muted-foreground hover:border-blue-200 hover:text-foreground"
                )}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Defaults</CardTitle>
          <CardDescription>Set default values for filters and charts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Default date range</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applied when you first open any report page
              </p>
            </div>
            <Select
              value={settings.defaultRange}
              onValueChange={(v) =>
                update({ defaultRange: v as typeof settings.defaultRange })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="mtd">Month to date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Chart style</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Visual style used for time-series charts
              </p>
            </div>
            <Select
              value={settings.chartStyle}
              onValueChange={(v) =>
                update({ chartStyle: v as typeof settings.chartStyle })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area chart</SelectItem>
                <SelectItem value="line">Line chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <Toggle
            checked={settings.includeCacheInTotal}
            onChange={(v) => update({ includeCacheInTotal: v })}
            label="Include cache tokens in totals"
            description="When off, only input and output tokens are counted in the Total Tokens metric"
          />
        </CardContent>
      </Card>

      {/* Model visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model Visibility</CardTitle>
          <CardDescription>
            Choose which models appear in charts and breakdowns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {models.map((m) => (
            <Toggle
              key={m.key}
              checked={settings.showModels[m.key]}
              onChange={(v) =>
                update({ showModels: { ...settings.showModels, [m.key]: v } })
              }
              label={m.label}
              description={m.description}
            />
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save settings"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
