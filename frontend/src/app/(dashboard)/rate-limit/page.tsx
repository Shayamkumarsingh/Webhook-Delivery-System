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
import {
  ShieldCheck,
  RefreshCcw,
  Gauge,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

const PRESETS = [
  { name: "Standard (100 cap, 10/s)", capacity: "100", refill: "10" },
  { name: "Strict Tier (20 cap, 2/s)", capacity: "20", refill: "2" },
  { name: "Burst Heavy (500 cap, 50/s)", capacity: "500", refill: "50" },
];

export default function RateLimitPage() {
  const { user } = useAppSelector((s) => s.auth);

  const [checkRateLimit, { isLoading: isChecking }] = useCheckRateLimitMutation();
  const [resetRateLimit, { isLoading: isResetting }] = useResetRateLimitMutation();

  const [identifier, setIdentifier] = useState(user?.id?.toString() ?? "user_1");
  const [capacity, setCapacity] = useState("100");
  const [refillRate, setRefillRate] = useState("10");
  const [result, setResult] = useState<CheckResult | null>(null);

  const applyPreset = (preset: { capacity: string; refill: string }) => {
    setCapacity(preset.capacity);
    setRefillRate(preset.refill);
    toast.info("Applied bucket parameters");
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await checkRateLimit({
        identifier,
        options: {
          capacity: parseInt(capacity) || 100,
          refillRate: parseInt(refillRate) || 10,
        },
      }).unwrap();

      setResult(data);
      if (data.allowed) {
        toast.success("Request Allowed · Token Consumed", {
          description: `${Math.floor(data.remaining)} tokens remaining`,
        });
      } else {
        toast.error("Rate Limit Exceeded · Request Blocked", {
          description: `Bucket exhausted. Reset in ${data.reset}s`,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          "Rate limit check failed"
      );
    }
  };

  const handleReset = async () => {
    if (!identifier) return;

    try {
      const response = await resetRateLimit({ identifier }).unwrap();
      setResult(null);
      toast.success(response.message || "Token bucket reset to maximum capacity!");
    } catch (error: any) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          "Reset failed"
      );
    }
  };

  const remainingTokens = result ? Math.floor(result.remaining) : parseInt(capacity) || 100;
  const maxLimit = result ? result.limit : parseInt(capacity) || 100;
  const tokenPct = Math.max(0, Math.min(100, (remainingTokens / maxLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Rate Limiter Simulator</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Token Bucket Algorithm
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification and token consumption simulator for consumer endpoints and users
          </p>
        </div>
      </div>

      {/* Grid: Simulator Form & Bucket Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Parameters (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Gauge size={16} className="text-cyan-400" /> Bucket Inspection Parameters
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Simulates an incoming request consuming tokens from the identified bucket
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleCheck} className="space-y-4">
                {/* Presets */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Bucket Presets</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-300 transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Identifier */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Consumer Identifier (User ID or IP)</Label>
                  <Input
                    placeholder="user_123 or ip_192.168.1.1"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                  />
                </div>

                {/* Capacity & Refill */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Bucket Capacity (Tokens)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Refill Rate (Tokens/sec)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={refillRate}
                      onChange={(e) => setRefillRate(e.target.value)}
                      className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="submit"
                    disabled={isChecking}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs h-10 font-medium shadow-md shadow-blue-600/20"
                  >
                    <Zap size={14} className="mr-1.5" />
                    {isChecking ? "Evaluating Token Bucket…" : "Consume Token (Check Request)"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isResetting || !identifier}
                    onClick={handleReset}
                    className="border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs h-10 px-3"
                  >
                    <RefreshCcw size={13} className="mr-1.5" />
                    {isResetting ? "Resetting…" : "Reset"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Algorithm Info Card */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">How Token Bucket Rate Limiting Works</p>
              <p className="leading-relaxed">
                Each incoming webhook delivery or API request consumes 1 token. Tokens refill automatically at the configured refill rate up to maximum capacity. If the bucket is empty, requests are rejected (HTTP 429).
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Bucket Visualizer (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" /> Bucket Telemetry & Gauge
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Current token status for target identifier:{" "}
                <span className="font-mono text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded">
                  {identifier || "Not specified"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Allowed / Blocked Status */}
              {result && (
                <div
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between transition-all",
                    result.allowed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {result.allowed ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        {result.allowed ? "Request Permitted (HTTP 200)" : "Rate Limited (HTTP 429)"}
                      </p>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {result.allowed
                          ? "Token successfully deducted from current pool"
                          : "Bucket depleted. Wait for tokens to replenish"}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-black/30">
                    {result.allowed ? "ALLOWED" : "REJECTED"}
                  </span>
                </div>
              )}

              {/* Visual Water Level / Token Gauge */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Token Pool Level</span>
                  <span className="font-mono font-bold text-white">
                    {remainingTokens} / {maxLimit} Tokens ({Math.round(tokenPct)}%)
                  </span>
                </div>

                {/* Progress bar container */}
                <div className="h-4 rounded-full bg-slate-900 border border-slate-700/60 overflow-hidden p-0.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      tokenPct > 50
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30"
                        : tokenPct > 20
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-500/30"
                        : "bg-gradient-to-r from-red-500 to-rose-400 shadow-sm shadow-red-500/30"
                    )}
                    style={{ width: `${tokenPct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>0 Tokens</span>
                  <span>50%</span>
                  <span>{maxLimit} (Full Capacity)</span>
                </div>
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Total Capacity</p>
                  <p className="text-lg font-bold font-mono text-white mt-1">{maxLimit}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Consumed</p>
                  <p className="text-lg font-bold font-mono text-amber-400 mt-1">
                    {maxLimit - remainingTokens}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Next Refill In</p>
                  <p className="text-lg font-bold font-mono text-cyan-400 mt-1">
                    {result ? `${result.reset}s` : "0s"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}