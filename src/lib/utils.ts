import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTokens(n: number | bigint): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatCost(usd: number): string {
  if (usd >= 1000) return `$${usd.toFixed(0)}`;
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(4)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function modelDisplayName(model: string | null): string {
  if (!model) return "Unknown";
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  if (model.includes("haiku")) return "Haiku";
  if (model.includes("fable")) return "Fable";
  return model;
}

export const MODEL_COLORS: Record<string, string> = {
  opus: "#7c3aed",
  sonnet: "#2563eb",
  haiku: "#059669",
  fable: "#dc2626",
  unknown: "#6b7280",
};

export function getModelColor(model: string | null): string {
  const name = modelDisplayName(model).toLowerCase();
  return MODEL_COLORS[name] ?? MODEL_COLORS.unknown;
}
