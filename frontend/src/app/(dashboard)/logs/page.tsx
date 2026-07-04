"use client";

import { useState } from "react";
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
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const levelColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warn: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  debug: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function LogsPage() {
  const [service, setService] = useState("");
  const [level, setLevel] = useState("all"); // ← "all" instead of ""

  const { data: logs, isLoading, refetch } = useGetLogsQuery({
    service: service || undefined,
    level: level === "all" ? undefined : level, // ← convert "all" back to undefined
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Logs</h2>
          <p className="text-muted-foreground mt-1">Aggregated logs from all services</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} className="mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Filter by service…"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="max-w-xs"
        />
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem> {/* ← "all" not "" */}
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
  <p className="text-muted-foreground">Loading…</p>
) : (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs?.length ? (              // ← logs (not logs.data)
          logs.map((log) => (          // ← logs.map (not logs.data.map)
            <TableRow key={log._id}>
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                {format(new Date(log.timestamp), "MMM d HH:mm:ss")}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-mono">
                  {log.service}
                </Badge>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    levelColors[log.level]
                  )}
                >
                  {log.level}
                </span>
              </TableCell>
              <TableCell className="text-sm">{log.message}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No logs found.
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
