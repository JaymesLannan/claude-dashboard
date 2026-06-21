"use client";

import * as React from "react";

export interface DashboardSettings {
  defaultRange: "today" | "7d" | "30d" | "mtd";
  showModels: {
    opus: boolean;
    sonnet: boolean;
    haiku: boolean;
    fable: boolean;
  };
  includeCacheInTotal: boolean;
  chartStyle: "area" | "line";
}

const DEFAULTS: DashboardSettings = {
  defaultRange: "7d",
  showModels: { opus: true, sonnet: true, haiku: true, fable: true },
  includeCacheInTotal: true,
  chartStyle: "area",
};

const KEY = "claude-dashboard-settings";

export function loadSettings(): DashboardSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: DashboardSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettings] = React.useState<DashboardSettings>(DEFAULTS);

  React.useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update(partial: Partial<DashboardSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
  }

  return { settings, update };
}
