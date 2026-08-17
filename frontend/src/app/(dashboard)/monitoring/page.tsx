"use client";

import { useState } from "react";
import { useGetLogsQuery } from "@/store/services/logApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Layers,
  Code,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SERVICES = [
  { id: "delivery-service", name: "Delivery Worker", desc: "Dispatches HTTP POST payloads to target endpoints" },
  { id: "retry-service", name: "Retry Worker", desc: "Manages exponential backoff schedules and re-deliveries" },
  { id: "notification-service", name: "Notification Hub", desc: "Broadcasts events and alert notifications" },
  { id: "dlq-service", name: "Dead Letter Queue", desc: "Quarantines exhausted unrecoverable delivery errors" },
];

const levelColors: Record<string, { badge: string; text: string }> = {
  info: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/25", text: "text-blue-400" },
  warn: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/25", text: "text-amber-400" },
  error: { badge: "bg-red-500/10 text-red-400 border-red-500/25", text: "text-red-400" },
  debug: { badge: "bg-slate-800 text-slate-400 border-slate-700", text: "text-slate-400" },
};

export default function MonitoringPage() {
  const [activeService, setActiveService] = useState<string>("");

  const { data: logs, isLoading, refetch } = useGetLogsQuery(
    { service: activeService || undefined, limit: 100 },
    { pollingInterval: 10000 } // Auto-poll every 10s
  );

  // Per-service analytics from current logs
  const serviceStats = SERVICES.map((svc) => {
    const svcLogs = logs?.filter((l) => l.service === svc.id) ?? [];
    const errorLogs = svcLogs.filter((l) => l.level === "error");
    return {
      ...svc,
      total: svcLogs.length,
      errors: errorLogs.length,
      latest: svcLogs[0]?.timestamp,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Live Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Live Service Monitoring</h1>
            <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-Polling 10s
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time health telemetry across delivery, retry, notification, and DLQ worker nodes
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-9"
        >
          <RefreshCw size={13} className="mr-1.5" /> Poll Now
        </Button>
      </div>

      {/* 4 Microservice Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceStats.map((s) => {
          const isSelected = activeService === s.id;
          return (
            <Card
              key={s.id}
              onClick={() => setActiveService(isSelected ? "" : s.id)}
              className={cn(
                "cursor-pointer transition-all duration-200 bg-slate-900/70 border backdrop-blur-xl hover:-translate-y-0.5",
                isSelected
                  ? "border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "border-slate-800 hover:border-slate-700"
              )}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400 border border-slate-700">
                      <Server size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{s.id}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      s.errors > 0 ? "bg-red-400 animate-ping" : "bg-emerald-400"
                    )}
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold font-mono text-white">{s.total}</span>
                    <p className="text-[10px] text-slate-500">events logged</p>
                  </div>
                  {s.errors > 0 ? (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                      {s.errors} errors
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Optimal
                    </span>
                  )}
                </div>

                {s.latest && (
                  <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock size={11} /> Last heartbeat: {format(new Date(s.latest), "HH:mm:ss")}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Chips Bar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium mr-2">Filter Stream:</span>
        <button
          onClick={() => setActiveService("")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
            activeService === ""
              ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20"
              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
          )}
        >
          All Services
        </button>
        {SERVICES.map((svc) => (
          <button
            key={svc.id}
            onClick={() => setActiveService(activeService === svc.id ? "" : svc.id)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono border transition-all",
              activeService === svc.id
                ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            )}
          >
            {svc.id}
          </button>
        ))}
      </div>

      {/* Live Stream Terminal Box */}
      {isLoading ? (
        <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          Aggregating telemetry streams…
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2 text-slate-200 font-semibold">
              <Activity size={14} className="text-emerald-400" /> Active Worker Heartbeats & Events
            </span>
            <span>{logs?.length ?? 0} Recorded Signals</span>
          </div>

          <div className="divide-y divide-slate-800/60 font-mono text-xs max-h-[500px] overflow-y-auto">
            {logs?.length ? (
              logs.map((log) => {
                const lvl = levelColors[log.level] || levelColors.debug;
                return (
                  <div
                    key={log._id}
                    className="p-3 hover:bg-slate-900/50 transition-colors flex items-start gap-3"
                  >
                    <span className="text-slate-500 text-[11px] whitespace-nowrap pt-0.5 w-20 shrink-0">
                      {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {log.service}
                    </span>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0",
                        lvl.badge
                      )}
                    >
                      {log.level}
                    </span>

                    <span className="flex-1 text-slate-200 break-all">{log.message}</span>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="shrink-0">
                        <summary className="text-[11px] text-blue-400 cursor-pointer select-none hover:underline">
                          metadata
                        </summary>
                        <pre className="text-[10px] bg-slate-900 border border-slate-800 rounded-lg p-2.5 mt-1.5 max-w-sm overflow-auto text-slate-300">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center text-slate-500 text-xs">
                No active signals recorded for the selected worker filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}