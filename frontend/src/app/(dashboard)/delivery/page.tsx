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
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Send,
  Copy,
  Check,
  Clock,
  Globe,
  Layers,
  ArrowRight,
  Code,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function DeliveryPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "failed">("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<DeliveryLog | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetDeliveryLogsQuery({
    webhookUrl: webhookUrl || undefined,
    status: status === "all" ? undefined : status,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const { data: statsData } = useGetDeliveryStatsQuery();
  const stats = statsData?.data;

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Delivery Logs</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {data?.total ?? 0} Recorded Attempts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time HTTP delivery records, HTTP status codes, and execution latency
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-9"
        >
          <RefreshCw size={13} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Attempts",
              value: stats.total,
              cls: "text-white",
              badge: "bg-slate-800 text-slate-300",
            },
            {
              label: "Successful Deliveries",
              value: stats.success,
              cls: "text-emerald-400",
              badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            },
            {
              label: "Failed Attempts",
              value: stats.failed,
              cls: "text-red-400",
              badge: stats.failed > 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-400",
            },
            {
              label: "Success Ratio",
              value: `${stats.successRate}%`,
              cls: stats.successRate >= 80 ? "text-emerald-400" : "text-amber-400",
              badge: stats.successRate >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20",
            },
          ].map(({ label, value, cls, badge }) => (
            <Card key={label} className="bg-slate-900/70 border-slate-800 backdrop-blur-xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">{label}</p>
                  <p className={cn("text-2xl font-bold font-mono mt-1", cls)}>{value}</p>
                </div>
                <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded", badge)}>
                  {label === "Success Ratio" ? "Health" : "Count"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by target webhook URL…"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                setPage(0);
              }}
              className="pl-9 bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono h-9"
            />
          </div>

          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as "all" | "success" | "failed");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40 bg-slate-950/80 border-slate-800 text-xs h-9 text-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">✓ Success Only</SelectItem>
              <SelectItem value="failed">✗ Failed Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {webhookUrl && (
          <button
            onClick={() => setWebhookUrl("")}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          Loading delivery attempt records…
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-xl">
            <Table>
              <TableHeader className="bg-slate-950/60 border-b border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-10 text-center"></TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400">Target Webhook</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400">Event ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 text-center">Attempt</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400">Timestamp</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-800/60">
                {data?.data?.length ? (
                  data.data.map((log) => {
                    const isSuccess = log.status === "success";
                    return (
                      <TableRow
                        key={log.id}
                        className="border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
                        onClick={() => setSelected(log)}
                      >
                        <TableCell className="text-center py-3.5">
                          {isSuccess ? (
                            <CheckCircle2 size={16} className="text-emerald-400 inline" />
                          ) : (
                            <XCircle size={16} className="text-red-400 inline" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-200 truncate max-w-xs block">
                            {log.webhookUrl}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-400">
                            {log.eventId.length > 14
                              ? `${log.eventId.slice(0, 14)}…`
                              : log.eventId}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-mono font-medium border",
                              log.attempt === 1
                                ? "bg-slate-800 text-slate-300 border-slate-700"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            )}
                          >
                            #{log.attempt}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : "bg-red-500/10 text-red-400 border-red-500/25"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isSuccess ? "bg-emerald-400" : "bg-red-400"
                              )}
                            />
                            {log.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 font-mono whitespace-nowrap">
                          {format(new Date(log.createdAt), "MMM d · HH:mm:ss")}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChevronRight size={15} className="text-slate-500 inline" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-400 py-16 text-xs"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Send size={24} className="text-slate-600 mb-1" />
                        <span>No delivery attempts recorded matching criteria.</span>
                        <span className="text-slate-500">
                          Publish an event via Event Studio to observe delivery dispatch records.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, data?.total ?? 0)} of {data?.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Inspector Slide-over / Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send size={16} className="text-blue-400" />
                Delivery Attempt #{selected?.attempt}
              </span>
              {selected && (
                <span
                  className={cn(
                    "text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border",
                    selected.status === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  )}
                >
                  {selected.status.toUpperCase()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-xs mt-2">
              {/* Key metadata grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <p className="text-slate-500 mb-0.5">Attempt Number</p>
                  <p className="font-mono font-medium text-slate-200">Attempt #{selected.attempt}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Execution Time</p>
                  <p className="font-mono font-medium text-slate-200">
                    {format(new Date(selected.createdAt), "MMM d yyyy, HH:mm:ss")}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-slate-500">Target Webhook Endpoint</p>
                    <button
                      onClick={() => copyToClipboard("url", selected.webhookUrl)}
                      className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1"
                    >
                      {copiedKey === "url" ? <Check size={11} /> : <Copy size={11} />} Copy URL
                    </button>
                  </div>
                  <p className="font-mono text-slate-300 break-all bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                    {selected.webhookUrl}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-slate-500">Event ID (Kafka Topic Reference)</p>
                    <button
                      onClick={() => copyToClipboard("eventId", selected.eventId)}
                      className="text-blue-400 hover:text-blue-300 font-mono text-[10px] flex items-center gap-1"
                    >
                      {copiedKey === "eventId" ? <Check size={11} /> : <Copy size={11} />} Copy ID
                    </button>
                  </div>
                  <p className="font-mono text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                    {selected.eventId}
                  </p>
                </div>
              </div>

              {/* Response Body Inspector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code size={13} className="text-emerald-400" /> Destination Response Body
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">HTTP Response payload</span>
                </div>
                <pre className="bg-slate-950 rounded-xl p-3.5 text-[11px] font-mono text-slate-300 border border-slate-800 overflow-auto max-h-56">
                  {selected.response
                    ? JSON.stringify(selected.response, null, 2)
                    : "No response body captured from endpoint."}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}