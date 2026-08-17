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
  DialogDescription,
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
import {
  Plus,
  Trash2,
  RefreshCw,
  Webhook as WebhookIcon,
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

const EVENT_PRESETS = [
  "user.created",
  "payment.succeeded",
  "order.completed",
  "invoice.paid",
  "subscription.updated",
  "deploy.finished",
];

export default function WebhooksPage() {
  const { data, isLoading, refetch } = useGetWebhooksQuery();
  const [createWebhook, { isLoading: isCreating }] = useCreateWebhookMutation();
  const [deleteWebhook] = useDeleteWebhookMutation();

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [eventType, setEventType] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebhook({ url, eventType }).unwrap();
      toast.success("Webhook endpoint registered successfully", {
        description: `Subscribed to ${eventType}`,
      });
      setUrl("");
      setEventType("");
      setOpen(false);
    } catch {
      toast.error("Failed to register webhook");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWebhook(id).unwrap();
      toast.success("Webhook endpoint removed");
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const copyUrl = (id: number, urlText: string) => {
    navigator.clipboard.writeText(urlText);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const webhooksList = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Webhook Endpoints</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {webhooksList.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure HTTP destination endpoints that listen for published domain events
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-9"
          >
            <RefreshCw size={13} className="mr-1.5" /> Refresh
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 shadow-sm shadow-blue-500/20">
                <Plus size={14} className="mr-1.5" /> Register Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <WebhookIcon size={16} className="text-blue-400" /> Register Webhook Destination
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Specify the destination URL and event subscription pattern for event delivery.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Destination Endpoint URL</Label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="https://api.yourdomain.com/webhooks"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      type="url"
                      className="pl-9 bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Subscribed Event Type</Label>
                  <Input
                    placeholder="user.created"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                    minLength={3}
                    className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                  />
                  {/* Preset chips */}
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-500 mb-1.5">Quick presets:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EVENT_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEventType(preset)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 mt-4"
                  disabled={isCreating}
                >
                  {isCreating ? "Registering Endpoint…" : "Confirm & Save Endpoint"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          Loading configured endpoints…
        </div>
      ) : webhooksList.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
            <WebhookIcon size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">No webhook endpoints configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Register your first HTTP endpoint to begin receiving forwarded events from Kafka.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
          >
            <Plus size={14} className="mr-1.5" /> Add First Webhook
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-slate-950/60 border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-400">Target Endpoint</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Subscribed Event</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Registered Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/60">
              {webhooksList.map((wh) => {
                const isHttps = wh.url.startsWith("https://");
                return (
                  <TableRow
                    key={wh.id}
                    className="border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* URL */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2 max-w-md">
                        <div className="p-1 rounded bg-slate-800 text-slate-400 shrink-0">
                          {isHttps ? (
                            <Lock size={12} className="text-emerald-400" />
                          ) : (
                            <Globe size={12} className="text-amber-400" />
                          )}
                        </div>
                        <span className="font-mono text-xs text-slate-200 truncate">{wh.url}</span>
                        <button
                          onClick={() => copyUrl(wh.id, wh.url)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                          title="Copy URL"
                        >
                          {copiedId === wh.id ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Event Type */}
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {wh.eventType}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                          wh.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            wh.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                          )}
                        />
                        {wh.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    {/* Created At */}
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {format(new Date(wh.createdAt), "MMM d, yyyy · HH:mm")}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/events`}
                          className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-400 transition-colors"
                          title="Dispatch test event to this endpoint"
                        >
                          <Zap size={14} />
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(wh.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete endpoint"
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
    </div>
  );
}