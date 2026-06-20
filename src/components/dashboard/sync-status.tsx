"use client";

import * as React from "react";
import { RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SyncLog {
  id: string;
  startedAt: string;
  completedAt?: string | null;
  status: string;
  recordsSynced: number;
  errorMessage?: string | null;
}

export function SyncStatus() {
  const [log, setLog] = React.useState<SyncLog | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  async function fetchStatus() {
    const res = await fetch("/api/sync");
    if (res.ok) {
      const data = await res.json();
      setLog(data.lastSync);
    }
  }

  async function triggerSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) await fetchStatus();
    } finally {
      setSyncing(false);
    }
  }

  React.useEffect(() => {
    fetchStatus();
  }, []);

  const icon =
    log?.status === "success" ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : log?.status === "error" ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : log?.status === "running" ? (
      <Clock className="h-4 w-4 text-yellow-500" />
    ) : null;

  const label = log?.completedAt
    ? `Synced ${formatDistanceToNow(new Date(log.completedAt), { addSuffix: true })}`
    : log?.status === "running"
    ? "Sync in progress…"
    : "Never synced";

  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </span>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={triggerSync}
        disabled={syncing}
        className="h-8 gap-1.5 text-xs"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
        {syncing ? "Syncing…" : "Sync now"}
      </Button>
    </div>
  );
}
