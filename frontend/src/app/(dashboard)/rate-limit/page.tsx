"use client";

import { useState } from "react";
import {
  useCheckRateLimitMutation,
  useResetRateLimitMutation,
} from "@/store/services/rateLimitApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import { ShieldCheck, RefreshCcw, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

export default function RateLimitPage() {
  const { user } = useAppSelector((s) => s.auth);
 

  const [checkRateLimit, { isLoading: isChecking }] = useCheckRateLimitMutation();
  const [resetRateLimit, { isLoading: isResetting }] = useResetRateLimitMutation();

  const [identifier, setIdentifier] = useState(user?.id?.toString() ?? "");
  const [capacity, setCapacity] = useState("100");
  const [refillRate, setRefillRate] = useState("10");
  const [result, setResult] = useState<CheckResult | null>(null);

 const handleCheck = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const data = await checkRateLimit({
      identifier,
      options: {
        capacity: parseInt(capacity),
        refillRate: parseInt(refillRate),
      },
    }).unwrap();

    console.log("Rate limit response:", data);

    setResult(data);
  } catch (error: any) {
    console.error("Rate limit check error:", error);

    toast.error(
      error?.data?.error ||
      error?.data?.message ||
      error?.error ||
      "Check failed"
    );
  }
};

  const handleReset = async () => {
  if (!identifier) return;

  try {
    const response = await resetRateLimit({ identifier }).unwrap();

    console.log("Reset response:", response);

    setResult(null);

    toast.success(response.message || "Rate limit reset");
  } catch (error: any) {
    console.error("Rate limit reset error:", error);

    toast.error(
      error?.data?.error ||
      error?.data?.message ||
      error?.error ||
      "Reset failed"
    );
  }
};

  const usedPct = result ? ((result.limit - result.remaining) / result.limit) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Rate limit</h2>
        <p className="text-muted-foreground mt-1">
          Inspect and manage token bucket state for any identifier
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge size={16} /> Check bucket
          </CardTitle>
          <CardDescription>
            Calls the rate-limit service directly. Each check consumes one token from the bucket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="space-y-2">
              <Label>Identifier</Label>
              <Input
                placeholder="user ID or IP address"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your user ID ({user?.id}) is pre-filled. Enter any identifier to inspect.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Refill rate (tokens/s)</Label>
                <Input
                  type="number"
                  min="1"
                  value={refillRate}
                  onChange={(e) => setRefillRate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isChecking} className="flex-1">
                {isChecking ? "Checking…" : "Check bucket"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isResetting || !identifier}
                onClick={handleReset}
              >
                <RefreshCcw size={14} className="mr-2" />
                {isResetting ? "Resetting…" : "Reset bucket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck size={16} /> Result for{" "}
              <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{identifier}</code>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  result.allowed
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                )}
              >
                {result.allowed ? "✓ Allowed" : "✗ Blocked"}
              </span>
              <span className="text-sm text-muted-foreground">
                {result.allowed
                  ? "Request would be permitted"
                  : "Request would be rate-limited"}
              </span>
            </div>

            {/* Token gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tokens remaining</span>
                <span className="font-medium">
                  {Math.floor(result.remaining)} / {result.limit}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    usedPct > 80
                      ? "bg-red-500"
                      : usedPct > 50
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  )}
                  style={{ width: `${100 - usedPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
              <div>
                <p className="text-muted-foreground">Capacity</p>
                <p className="font-semibold">{result.limit}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-semibold">{Math.floor(result.limit - result.remaining)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Refills in</p>
                <p className="font-semibold">{result.reset}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}