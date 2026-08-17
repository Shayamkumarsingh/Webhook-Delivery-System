"use client";

import { useState } from "react";
import {
  useGetDLQQuery,
  useRetryDLQMutation,
  useDeleteDLQMutation,
} from "@/store/services/dlqApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  RefreshCw,
  RotateCcw,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Code,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DLQPage() {
  const { data, isLoading, refetch } = useGetDLQQuery();
  const [retryDLQ] = useRetryDLQMutation();
  const [deleteDLQ] = useDeleteDLQMutation();

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inspectEntry, setInspectEntry] = useState<any | null>(null);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryDLQ(id).unwrap();
      toast.success("Event re-queued to Kafka for immediate delivery!");
    } catch {
      toast.error("Failed to re-queue event from DLQ");
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDLQ(id).unwrap();
      toast.success("Quarantined entry discarded from DLQ");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  };

  const entries = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Dead Letter Queue</h1>
            <span
              className={cn(
                "text-xs font-mono px-2 py-0.5 rounded border",
                entries.length > 0
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}
            >
              {entries.length} Quarantined Messages
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Failed events that exhausted all automated exponential backoff retries
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

      {/* Informative Alert Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5 backdrop-blur-xl">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
          <AlertTriangle size={16} />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200">Automated Quarantine Policy</p>
          <p className="text-slate-400 leading-relaxed">
            Events arrive in the Dead Letter Queue only after exhausting maximum delivery attempts (3 retries with exponential backoff).
            You can inspect the failed payload, verify destination endpoint health, and trigger a manual re-delivery directly back into the Kafka pipeline.
          </p>
        </div>
      </div>

      {/* Main DLQ Table */}
      {isLoading ? (
        <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          Loading quarantined DLQ entries…
        </div>
      ) : entries.length === 0 ? (
        <div className="p-14 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Dead Letter Queue is Empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              All events have been successfully delivered to their subscribed endpoints without unrecoverable errors.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-slate-950/60 border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-400">Event Topic</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Destination Endpoint</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Exhaustion Reason</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Quarantined At</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/60">
              {entries.map((entry) => {
                const eventType = (entry.event as { eventType?: string })?.eventType ?? "unknown";
                const webhookUrl = (entry.webhook as { url?: string })?.url ?? "—";

                return (
                  <TableRow
                    key={entry._id}
                    className="border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Event Type */}
                    <TableCell className="py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {eventType}
                      </span>
                    </TableCell>

                    {/* Webhook URL */}
                    <TableCell>
                      <span className="font-mono text-xs text-slate-200 truncate max-w-xs block">
                        {webhookUrl}
                      </span>
                    </TableCell>

                    {/* Failure Reason */}
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/25">
                        {entry.reason}
                      </span>
                    </TableCell>

                    {/* Time */}
                    <TableCell className="text-xs text-slate-400 font-mono whitespace-nowrap">
                      {format(new Date(entry.createdAt), "MMM d · HH:mm:ss")}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectEntry(entry)}
                          className="h-8 px-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        >
                          <Code size={13} className="mr-1" /> Payload
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={retryingId === entry._id}
                          onClick={() => handleRetry(entry._id)}
                          className="h-8 px-2.5 text-xs bg-slate-900 border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors text-slate-300"
                        >
                          {retryingId === entry._id ? (
                            <Loader2 size={13} className="animate-spin mr-1" />
                          ) : (
                            <RotateCcw size={13} className="mr-1" />
                          )}
                          Re-queue
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === entry._id}
                          onClick={() => handleDelete(entry._id)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                          title="Discard entry"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Payload Inspector Modal */}
      <Dialog open={!!inspectEntry} onOpenChange={(open) => !open && setInspectEntry(null)}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-slate-100 p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-400" /> Quarantined Message Payload
            </DialogTitle>
          </DialogHeader>

          {inspectEntry && (
            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-500">Destination Endpoint:</span>
                  <p className="font-mono text-slate-300 break-all mt-0.5">
                    {(inspectEntry.webhook as { url?: string })?.url || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Error Reason:</span>
                  <p className="font-mono text-red-400 mt-0.5">{inspectEntry.reason}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-300">Raw Event Payload</span>
                  <span className="text-[10px] font-mono text-slate-500">JSON Data</span>
                </div>
                <pre className="bg-slate-950 rounded-xl p-3.5 text-[11px] font-mono text-slate-300 border border-slate-800 overflow-auto max-h-56">
                  {JSON.stringify(inspectEntry.event, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    handleRetry(inspectEntry._id);
                    setInspectEntry(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8"
                >
                  <RotateCcw size={13} className="mr-1.5" /> Re-queue for Delivery
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}