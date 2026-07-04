"use client";

import { useGetWebhooksQuery } from "@/store/services/webhookApi";
import { useGetLogsQuery, useGetLogStatsQuery } from "@/store/services/logApi";
import { useGetDLQQuery } from "@/store/services/dlqApi";
import { useGetDeliveryStatsQuery } from "@/store/services/deliveryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook, FileText, AlertTriangle, Activity, Send } from "lucide-react";
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
  const recentLogsCount = logsData?.data?.length ?? 0;
  const deliveryStats = deliveryStatsData?.data;

  const statCards = [
    {
      title: "Active webhooks",
      value: webhookCount,
      icon: Webhook,
      color: "text-blue-500",
      sub: null,
    },
    {
      title: "DLQ entries",
      value: dlqCount,
      icon: AlertTriangle,
      color: dlqCount > 0 ? "text-red-500" : "text-muted-foreground",
      sub: dlqCount > 0 ? "Needs attention" : "All clear",
    },
    {
      title: "Total errors logged",
      value: errorCount,
      icon: Activity,
      color: errorCount > 0 ? "text-orange-500" : "text-muted-foreground",
      sub: null,
    },
    {
      title: "Recent logs",
      value: recentLogsCount,
      icon: FileText,
      color: "text-green-500",
      sub: null,
    },
    {
      title: "Delivery success rate",
      value: deliveryStats ? `${deliveryStats.successRate}%` : "—",
      icon: Send,
      color:
        !deliveryStats
          ? "text-muted-foreground"
          : deliveryStats.successRate >= 80
          ? "text-green-500"
          : "text-red-500",
      sub: deliveryStats
        ? `${deliveryStats.success} ok · ${deliveryStats.failed} failed`
        : null,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your webhook infrastructure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, sub }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon size={18} className={color} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log breakdown by level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            {stats?.length ? (
              stats.map((s) => {
                const colors: Record<string, string> = {
                  info: "text-blue-500",
                  warn: "text-yellow-500",
                  error: "text-red-500",
                  debug: "text-gray-500",
                };
                return (
                  <div key={s._id} className="flex flex-col items-center gap-1">
                    <span className={cn("text-2xl font-bold", colors[s._id])}>
                      {s.count}
                    </span>
                    <span className="text-sm text-muted-foreground capitalize">{s._id}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No log data yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery summary */}
      {deliveryStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Success rate</span>
              <span className="font-medium">{deliveryStats.successRate}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  deliveryStats.successRate >= 80 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${deliveryStats.successRate}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-1 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{deliveryStats.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Successful</p>
                <p className="font-semibold text-green-600">{deliveryStats.success}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failed</p>
                <p className="font-semibold text-red-500">{deliveryStats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}