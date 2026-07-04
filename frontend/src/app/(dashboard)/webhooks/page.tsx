"use client";

import { useState } from "react";
import {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
} from "@/store/services/webhookApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function WebhooksPage() {
  const { data, isLoading, refetch } = useGetWebhooksQuery();
  const [createWebhook, { isLoading: isCreating }] = useCreateWebhookMutation();
  const [deleteWebhook] = useDeleteWebhookMutation();
  

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [eventType, setEventType] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebhook({ url, eventType }).unwrap();
      toast.success("Webhook created");
      setUrl("");
      setEventType("");
      setOpen(false);
    } catch {
      toast.error("Failed to create webhook");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWebhook(id).unwrap();
      toast.success("Webhook deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Webhooks</h2>
          <p className="text-muted-foreground mt-1">Manage your registered endpoints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw size={14} className="mr-2" /> Refresh
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={14} className="mr-2" /> Add webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register new webhook</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://your-server.com/webhook"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event type</Label>
                  <Input
                    placeholder="user.created"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Creating…" : "Create webhook"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Event type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length ? (
                data.data.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-mono text-sm max-w-xs truncate">{wh.url}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{wh.eventType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={wh.isActive ? "default" : "outline"}>
                        {wh.isActive ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(wh.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(wh.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No webhooks registered yet.
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