"use client";

import { useState } from "react";
import { useGetLogsQuery } from "@/store/services/logApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SERVICES = ["retry-service", "notification-service", "delivery-service", "dlq-service"];

const levelColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warn: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  debug: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const serviceColors: Record<string, string> = {
  "retry-service": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "notification-service": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "delivery-service": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "dlq-service": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function MonitoringPage() {
  const [activeService, setActiveService] = useState<string>("");

  const { data: logs, isLoading, refetch } = useGetLogsQuery(
    { service: activeService || undefined, limit: 100 },
    { pollingInterval: 10000 } // auto-refresh every 10s
  );

  // Per-service error counts from current data
  const serviceStats = SERVICES.map((svc) => {
    const svcLogs = logs?.filter((l) => l.service === svc) ?? [];
    return {
      name: svc,
      total: svcLogs.length,
      errors: svcLogs.filter((l) => l.level === "error").length,
      latest: svcLogs[0]?.timestamp,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Service monitoring</h2>
          <p className="text-muted-foreground mt-1">
            Real-time activity from retry, notification, and delivery services. Auto-refreshes
            every 10s.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} className="mr-2" /> Refresh now
        </Button>
      </div>

      {/* Per-service summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceStats.map((s) => (
          <Card
            key={s.name}
            className={cn(
              "cursor-pointer transition-all",
              activeService === s.name && "ring-2 ring-primary"
            )}
            onClick={() => setActiveService(activeService === s.name ? "" : s.name)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground">
                {s.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold">{s.total}</span>
                {s.errors > 0 && (
                  <span className="text-sm font-medium text-red-500">{s.errors} errors</span>
                )}
              </div>
              {s.latest && (
                <p className="text-xs text-muted-foreground">
                  Last: {format(new Date(s.latest), "HH:mm:ss")}
                </p>
              )}
              {s.total === 0 && (
                <p className="text-xs text-muted-foreground">No logs yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveService("")}
          className={cn(
            "px-3 py-1 rounded-full text-sm transition-colors border",
            activeService === ""
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All services
        </button>
        {SERVICES.map((svc) => (
          <button
            key={svc}
            onClick={() => setActiveService(activeService === svc ? "" : svc)}
            className={cn(
              "px-3 py-1 rounded-full text-sm transition-colors border font-mono",
              activeService === svc
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {svc}
          </button>
        ))}
      </div>

      {/* Log stream */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border divide-y">
          {logs?.length ? (
            logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 p-3 text-sm">
                <span className="text-muted-foreground text-xs whitespace-nowrap pt-0.5 w-20 shrink-0">
                  {format(new Date(log.timestamp), "HH:mm:ss")}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap shrink-0",
                    serviceColors[log.service] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {log.service}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                    levelColors[log.level]
                  )}
                >
                  {log.level}
                </span>
                <span className="flex-1 text-foreground">{log.message}</span>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="shrink-0">
                    <summary className="text-xs text-muted-foreground cursor-pointer select-none">
                      metadata
                    </summary>
                    <pre className="text-xs bg-muted rounded p-2 mt-1 max-w-xs overflow-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No log entries for the selected service.
            </div>
          )}
        </div>
      )}
    </div>
  );
}