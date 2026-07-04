"use client";

import { useState } from "react";
import {
  useGetDeliveryLogsQuery,
  useGetDeliveryStatsQuery,
  type DeliveryLog,
} from "@/store/services/deliveryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function DeliveryPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "failed">("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<DeliveryLog | null>(null);

 const { data, isLoading, refetch } = useGetDeliveryLogsQuery({
  webhookUrl: webhookUrl || undefined,
  status: status === "all" ? undefined : status,
  limit: PAGE_SIZE,
  offset: page * PAGE_SIZE,
});

  const { data: statsData } = useGetDeliveryStatsQuery();
  const stats = statsData?.data;

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Delivery logs</h2>
          <p className="text-muted-foreground mt-1">
            Every webhook delivery attempt recorded by the delivery service
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} className="mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total attempts", value: stats.total, cls: "" },
            { label: "Successful", value: stats.success, cls: "text-green-600" },
            { label: "Failed", value: stats.failed, cls: "text-red-500" },
            {
              label: "Success rate",
              value: `${stats.successRate}%`,
              cls: stats.successRate >= 80 ? "text-green-600" : "text-red-500",
            },
          ].map(({ label, value, cls }) => (
            <Card key={label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-muted-foreground font-normal">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold", cls)}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Filter by webhook URL…"
          value={webhookUrl}
          onChange={(e) => {
            setWebhookUrl(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <Select
  value={status}
  onValueChange={(v) => {
    setStatus(v as "all" | "success" | "failed");
    setPage(0);
  }}
>
  <SelectTrigger className="w-36">
    <SelectValue placeholder="All statuses" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">All statuses</SelectItem>
    <SelectItem value="success">Success</SelectItem>
    <SelectItem value="failed">Failed</SelectItem>
  </SelectContent>
</Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Webhook URL</TableHead>
                  <TableHead>Event ID</TableHead>
                  <TableHead className="text-center">Attempt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length ? (
                  data.data.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelected(log)}
                    >
                      <TableCell>
                        {log.status === "success" ? (
                          <CheckCircle2 size={15} className="text-green-500" />
                        ) : (
                          <XCircle size={15} className="text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs  truncate">
                        {log.webhookUrl}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.eventId.length > 12
                          ? `${log.eventId.slice(0, 12)}…`
                          : log.eventId}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            log.attempt === 1
                              ? "bg-muted text-muted-foreground"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          )}
                        >
                          #{log.attempt}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            log.status === "success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          )}
                        >
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM d HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-12"
                    >
                      No delivery logs yet. Publish an event to see attempts here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, data?.total ?? 0)} of{" "}
                {data?.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Delivery attempt #{selected?.attempt} —{" "}
              <span
                className={cn(
                  "text-sm font-medium",
                  selected?.status === "success" ? "text-green-600" : "text-red-500"
                )}
              >
                {selected?.status}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Attempt</p>
                  <p className="font-medium">#{selected.attempt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Time</p>
                  <p className="font-medium">
                    {format(new Date(selected.createdAt), "MMM d yyyy, HH:mm:ss")}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">Webhook URL</p>
                  <p className="font-mono text-xs break-all bg-muted px-2 py-1.5 rounded">
                    {selected.webhookUrl}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">Event ID</p>
                  <p className="font-mono text-xs bg-muted px-2 py-1.5 rounded">
                    {selected.eventId}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">
                  {selected.status === "success" ? "Response body" : "Error"}
                </p>
                <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-52 font-mono">
                  {selected.response
                    ? JSON.stringify(selected.response, null, 2)
                    : "No response captured"}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}