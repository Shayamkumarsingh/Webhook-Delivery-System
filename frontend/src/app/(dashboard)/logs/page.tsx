"use client";

import { useState, Fragment } from "react";
import { useGetLogsQuery } from "@/store/services/logApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileText,
  Search,
  Terminal,
  ChevronDown,
  ChevronRight,
  Filter,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const levelColors: Record<string, { badge: string; text: string }> = {
  info: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    text: "text-blue-400",
  },
  warn: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    text: "text-amber-400",
  },
  error: {
    badge: "bg-red-500/10 text-red-400 border-red-500/25",
    text: "text-red-400",
  },
  debug: {
    badge: "bg-slate-800 text-slate-400 border-slate-700",
    text: "text-slate-400",
  },
};

const serviceBadges: Record<string, string> = {
  "api-gateway": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "event-service": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "delivery-service": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "retry-service": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "dlq-service": "text-red-400 bg-red-500/10 border-red-500/20",
  "rate-limit-service": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "auth-service": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "notification-service": "text-pink-400 bg-pink-500/10 border-pink-500/20",
  "logs-service": "text-slate-300 bg-slate-800 border-slate-700",
};

export default function LogsPage() {
  const [service, setService] = useState("");
  const [level, setLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: logs, isLoading, refetch } = useGetLogsQuery({
    service: service || undefined,
    level: level === "all" ? undefined : level,
    limit: 100,
  });

  const filteredLogs = (logs || []).filter((log) => {
    if (!searchQuery) return true;
    return (
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const copyLogMessage = (id: string, msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopiedId(id);
    toast.success("Log message copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Logs</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {filteredLogs.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated stream across all 9 microservices with severity filtering
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

      {/* Toolbar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search message text…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs h-9 font-mono"
            />
          </div>

          <Input
            placeholder="Filter by service name…"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="max-w-xs bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs h-9 font-mono"
          />

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-36 bg-slate-950/80 border-slate-800 text-xs h-9 text-slate-200">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(service || searchQuery || level !== "all") && (
          <button
            onClick={() => {
              setService("");
              setSearchQuery("");
              setLevel("all");
            }}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Terminal-Style Logs Table */}
      {isLoading ? (
        <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          Streaming log entries…
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-slate-900/90 border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-36 text-xs font-semibold text-slate-400">Timestamp</TableHead>
                <TableHead className="w-44 text-xs font-semibold text-slate-400">Origin Service</TableHead>
                <TableHead className="w-24 text-xs font-semibold text-slate-400">Level</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400">Message Content</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredLogs.length ? (
                filteredLogs.map((log) => {
                  const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;
                  const isExpanded = expandedId === log._id;
                  const lvl = levelColors[log.level] || levelColors.debug;
                  const svcBadge = serviceBadges[log.service] || "text-slate-300 bg-slate-800 border-slate-700";

                  return (
                    <Fragment key={log._id}>
                      <TableRow className="border-slate-800/60 hover:bg-slate-900/50 transition-colors">
                        <TableCell className="text-slate-500 text-[11px] whitespace-nowrap py-3">
                          {format(new Date(log.timestamp), "MMM d · HH:mm:ss.SSS")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-mono border",
                              svcBadge
                            )}
                          >
                            {log.service}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                              lvl.badge
                            )}
                          >
                            {log.level}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-200 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="break-all">{log.message}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => copyLogMessage(log._id, log.message)}
                                className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
                                title="Copy log message"
                              >
                                {copiedId === log._id ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                              {hasMeta && (
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : log._id)}
                                  className="text-[11px] text-blue-400 hover:text-blue-300 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
                                >
                                  {isExpanded ? "Hide JSON" : "View JSON"}
                                </button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>

                      {/* Expandable JSON Metadata */}
                      {isExpanded && hasMeta && (
                        <TableRow className="bg-slate-950 border-slate-800 hover:bg-slate-950">
                          <TableCell colSpan={5} className="p-3 pl-12">
                            <pre className="p-3 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-800 overflow-auto max-h-48 font-mono">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-slate-500 py-16 text-xs"
                  >
                    No log events match the current filter criteria.
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
