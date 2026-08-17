"use client";

import { useGetWebhooksQuery } from "@/store/services/webhookApi";
import { useGetLogsQuery, useGetLogStatsQuery } from "@/store/services/logApi";
import { useGetDLQQuery } from "@/store/services/dlqApi";
import { useGetDeliveryStatsQuery } from "@/store/services/deliveryApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Webhook,
  FileText,
  AlertTriangle,
  Activity,
  Send,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: webhooksData } = useGetWebhooksQuery();
  const { data: stats } = useGetLogStatsQuery();
  const { data: dlqData } = useGetDLQQuery();
  const { data: logsData } = useGetLogsQuery({ limit: 5 });
  const { data: deliveryStatsData } = useGetDeliveryStatsQuery();

  const webhookCount = webhooksData?.data?.length ?? 0;
  const dlqCount = dlqData?.data?.length ?? 0;
  const errorCount = stats?.find((s) => s._id === "error")?.count ?? 0;
  const recentLogsCount = Array.isArray(logsData) ? logsData.length : 0;
  const deliveryStats = deliveryStatsData?.data;

  const statCards = [
    {
      title: "Active Webhooks",
      value: webhookCount,
      icon: Webhook,
      trend: "Configured endpoints",
      href: "/webhooks",
      accent: "from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/30",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Dead Letter Queue",
      value: dlqCount,
      icon: AlertTriangle,
      trend: dlqCount > 0 ? "Requires attention" : "Zero failed messages",
      href: "/dlq",
      accent: dlqCount > 0 ? "from-red-500/20 to-red-950/20 text-red-400 border-red-500/40" : "from-slate-800/40 to-slate-900/40 text-slate-400 border-slate-800",
      badgeColor: dlqCount > 0 ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Total Errors Logged",
      value: errorCount,
      icon: Activity,
      trend: errorCount > 0 ? "Recorded across services" : "Clean execution",
      href: "/logs",
      accent: errorCount > 0 ? "from-amber-500/20 to-amber-950/20 text-amber-400 border-amber-500/40" : "from-slate-800/40 to-slate-900/40 text-slate-400 border-slate-800",
      badgeColor: errorCount > 0 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Delivery Success Rate",
      value: deliveryStats ? `${deliveryStats.successRate}%` : "—",
      icon: Send,
      trend: deliveryStats ? `${deliveryStats.success} ok · ${deliveryStats.failed} failed` : "No attempts yet",
      href: "/delivery",
      accent: deliveryStats && deliveryStats.successRate >= 80 ? "from-emerald-500/20 to-emerald-950/20 text-emerald-400 border-emerald-500/40" : "from-blue-500/20 to-blue-950/20 text-blue-400 border-blue-500/30",
      badgeColor: deliveryStats && deliveryStats.successRate >= 80 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      title: "Recent Log Streams",
      value: recentLogsCount,
      icon: FileText,
      trend: "Real-time service logs",
      href: "/logs",
      accent: "from-cyan-500/20 to-cyan-950/20 text-cyan-400 border-cyan-500/30",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Dashboard</h1>
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cluster
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and dispatch analytics across all microservices
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-sm shadow-blue-500/20"
          >
            <Zap size={14} /> Send Event
          </Link>
          <Link
            href="/webhooks"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
          >
            <Webhook size={14} /> New Endpoint
          </Link>
        </div>
      </div>

      {/* Hero 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map(({ title, value, icon: Icon, trend, href, accent, badgeColor }) => (
          <Link key={title} href={href} className="group">
            <div className={cn(
              "h-full p-4 rounded-xl bg-slate-900/70 border backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 relative overflow-hidden flex flex-col justify-between",
              accent
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                  {title}
                </span>
                <div className={cn("p-1.5 rounded-lg border", badgeColor)}>
                  <Icon size={16} />
                </div>
              </div>

              <div className="my-3">
                <span className="text-3xl font-bold tracking-tight text-white font-mono">
                  {value}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="truncate">{trend}</span>
                <ArrowUpRight size={13} className="text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Architecture Pipeline Flow Diagram */}
      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers size={16} className="text-blue-400" /> Distributed Pipeline Topology
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Current message dispatch and processing flow through microservices
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Kafka Partition 0
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {[
              {
                step: "1. Event Ingestion",
                svc: "event-service",
                status: "Ready",
                color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
              },
              {
                step: "2. Kafka Queue",
                svc: "kafka:9092",
                status: "Replicated",
                color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/5",
              },
              {
                step: "3. Rate Limiter",
                svc: "rate-limit-service",
                status: "Token Bucket",
                color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
              },
              {
                step: "4. Worker Dispatch",
                svc: "delivery-service",
                status: "HTTP POST",
                color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
              },
              {
                step: "5. DLQ & Retries",
                svc: "retry & dlq-service",
                status: "Exp. Backoff",
                color: "text-amber-400 border-amber-500/30 bg-amber-500/5",
              },
            ].map(({ step, svc, status, color }) => (
              <div
                key={step}
                className={cn(
                  "p-3 rounded-xl border flex flex-col justify-between space-y-2 relative transition-all",
                  color
                )}
              >
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">{step}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{svc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Delivery Analytics & Log Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Analytics Card */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-800/80 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Send size={16} className="text-emerald-400" /> Delivery Health & Analytics
              </CardTitle>
              <Link
                href="/delivery"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View logs <ArrowUpRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {deliveryStats ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Success Ratio</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {deliveryStats.successRate}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      deliveryStats.successRate >= 80
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50"
                        : "bg-gradient-to-r from-red-500 to-orange-400 shadow-sm shadow-red-500/50"
                    )}
                    style={{ width: `${deliveryStats.successRate}%` }}
                  />
                </div>

                {/* Detailed 3-part metric breakdown */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <p className="text-[11px] text-slate-400">Total Attempts</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {deliveryStats.total}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-center">
                    <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 size={12} /> Succeeded
                    </p>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {deliveryStats.success}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-center">
                    <p className="text-[11px] text-red-400 flex items-center justify-center gap-1">
                      <XCircle size={12} /> Failed
                    </p>
                    <p className="text-xl font-bold font-mono text-red-400 mt-1">
                      {deliveryStats.failed}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No delivery attempts recorded yet. Dispatch an event to populate analytics.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Breakdown by Severity */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-800/80 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" /> Log Severity Distribution
              </CardTitle>
              <Link
                href="/logs"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Inspect all <ArrowUpRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {stats?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => {
                  const colors: Record<string, { bg: string; text: string; border: string }> = {
                    info: { bg: "bg-blue-950/30", text: "text-blue-400", border: "border-blue-800/40" },
                    warn: { bg: "bg-amber-950/30", text: "text-amber-400", border: "border-amber-800/40" },
                    error: { bg: "bg-red-950/30", text: "text-red-400", border: "border-red-800/40" },
                    debug: { bg: "bg-slate-950/30", text: "text-slate-400", border: "border-slate-800" },
                  };
                  const color = colors[s._id] || colors.debug;

                  return (
                    <div
                      key={s._id}
                      className={cn("p-4 rounded-xl border text-center flex flex-col justify-between", color.bg, color.border)}
                    >
                      <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
                        {s._id}
                      </span>
                      <span className={cn("text-2xl font-bold font-mono my-2", color.text)}>
                        {s.count}
                      </span>
                      <span className="text-[10px] text-slate-500">entries</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No log entries aggregated yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}