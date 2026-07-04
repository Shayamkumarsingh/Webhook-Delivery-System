"use client";

import { useGetDLQQuery, useRetryDLQMutation, useDeleteDLQMutation } from "@/store/services/dlqApi";
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
import { toast } from "sonner";
import { RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function DLQPage() {
  const { data, isLoading, refetch } = useGetDLQQuery();
  const [retryDLQ] = useRetryDLQMutation();
  const [deleteDLQ] = useDeleteDLQMutation();
  

  const handleRetry = async (id: string) => {
    try {
      await retryDLQ(id).unwrap();
     toast.success("Event re-queued for delivery");
    } catch {
      toast.error("Retry failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDLQ(id).unwrap();
      toast.success("DLQ entry deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dead letter queue</h2>
          <p className="text-muted-foreground mt-1">
            Failed events that have exhausted all retry attempts
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} className="mr-2" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event type</TableHead>
                <TableHead>Webhook URL</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Failed at</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length ? (
                data.data.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {(entry.event as { eventType?: string })?.eventType ?? "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {(entry.webhook as { url?: string })?.url ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.reason}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(entry.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(entry._id)}
                      >
                        <RotateCcw size={13} className="mr-1" /> Retry
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No failed events. Everything is running smoothly.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}