"use client";

import { useState } from "react";
import { useCreateEventMutation } from "@/store/services/eventApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Zap,
  Sparkles,
  Code2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Layers,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_TEMPLATES: Record<
  string,
  { eventType: string; payload: Record<string, unknown> }
> = {
  "User Signup": {
    eventType: "user.created",
    payload: {
      userId: "usr_998241",
      email: "jane.doe@enterprise.io",
      role: "admin",
      tier: "enterprise_pro",
      signupSource: "oauth_github",
      metadata: { region: "us-east-1", ip: "192.0.2.1" },
    },
  },
  "Payment Success": {
    eventType: "payment.succeeded",
    payload: {
      paymentId: "pay_884920",
      amount: 4999,
      currency: "usd",
      customer: "cus_332190",
      paymentMethod: "card_visa_4242",
      status: "succeeded",
    },
  },
  "Order Fulfilled": {
    eventType: "order.completed",
    payload: {
      orderId: "ord_552199",
      itemsCount: 3,
      trackingNumber: "TRK_99182736",
      carrier: "fedex_priority",
      totalAmount: 189.5,
    },
  },
  "Invoice Paid": {
    eventType: "invoice.paid",
    payload: {
      invoiceId: "inv_102938",
      subtotal: 1200.0,
      tax: 120.0,
      dueDate: "2026-09-01",
      autoBilled: true,
    },
  },
};

export default function EventsPage() {
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const [eventType, setEventType] = useState("user.created");
  const [email, setEmail] = useState("admin@company.com");
  const [payloadStr, setPayloadStr] = useState(
    JSON.stringify(SAMPLE_TEMPLATES["User Signup"].payload, null, 2)
  );
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [activeTemplate, setActiveTemplate] = useState("User Signup");

  // Validate JSON on the fly
  let isValidJson = true;
  let parsedPayload: Record<string, unknown> = {};
  try {
    parsedPayload = JSON.parse(payloadStr);
  } catch {
    isValidJson = false;
  }

  const loadTemplate = (name: string) => {
    setActiveTemplate(name);
    const tmpl = SAMPLE_TEMPLATES[name];
    if (tmpl) {
      setEventType(tmpl.eventType);
      setPayloadStr(JSON.stringify(tmpl.payload, null, 2));
    }
  };

  const generateUUID = () => {
    const uuid = "evt_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    setIdempotencyKey(uuid);
    toast.info("Generated unique idempotency key");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidJson) {
      toast.error("Invalid JSON syntax in payload. Please fix syntax errors.");
      return;
    }

    try {
      const result = await createEvent({ eventType, email, payload: parsedPayload }).unwrap();
      toast.success("Event successfully queued in Kafka!", {
        description: `Dispatched Event ID: ${result.data._id || result.data.id || "Published"}`,
      });
      // Generate a fresh key for next event
      generateUUID();
    } catch {
      toast.error("Failed to publish event to Kafka");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Event Studio</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Kafka Producer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch mock domain events directly to Kafka for matching webhook endpoint consumers
          </p>
        </div>
      </div>

      {/* Grid: Left Input Form, Right JSON Editor & Envelope Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap size={16} className="text-blue-400" /> Event Dispatch Parameters
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Configure topic routing and actor metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Template Preset Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Load Preset Template</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(SAMPLE_TEMPLATES).map((tmplName) => (
                      <button
                        key={tmplName}
                        type="button"
                        onClick={() => loadTemplate(tmplName)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all",
                          activeTemplate === tmplName
                            ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        )}
                      >
                        {tmplName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Event Type (Topic Filter)</Label>
                  <Input
                    placeholder="user.created"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                    className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                  />
                </div>

                {/* Actor Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Recipient / Actor Email</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono"
                  />
                </div>

                {/* Idempotency Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-300">Idempotency Key</Label>
                    <button
                      type="button"
                      onClick={generateUUID}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
                    >
                      <Fingerprint size={12} /> Auto-Generate
                    </button>
                  </div>
                  <Input
                    placeholder="evt_random_idempotency_token"
                    value={idempotencyKey}
                    onChange={(e) => setIdempotencyKey(e.target.value)}
                    className="bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs font-mono text-slate-300"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isValidJson}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs h-10 font-medium shadow-md shadow-blue-600/25 mt-2"
                >
                  <Send size={14} className="mr-1.5" />
                  {isLoading ? "Publishing to Kafka Cluster…" : "Publish Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 Cols) - JSON Editor & Envelope Preview */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800/80 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Code2 size={16} className="text-emerald-400" /> Event JSON Payload Body
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Custom serialized data sent inside the webhook HTTP POST request
                </CardDescription>
              </div>

              {/* Validation Status Badge */}
              <div className="flex items-center gap-1.5">
                {isValidJson ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Valid JSON
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertCircle size={12} /> Invalid JSON Syntax
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
                <textarea
                  className="w-full min-h-[260px] bg-transparent text-xs font-mono text-slate-200 outline-none resize-y leading-relaxed"
                  value={payloadStr}
                  onChange={(e) => setPayloadStr(e.target.value)}
                  placeholder='{\n  "key": "value"\n}'
                  spellCheck={false}
                />
              </div>

              {/* Kafka Envelope Preview */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-400" /> Serialized Kafka Envelope Preview
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">topic: webhook.events</span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 overflow-x-auto">
{JSON.stringify(
  {
    event: eventType,
    recipient: email,
    idempotencyKey: idempotencyKey || "auto_generated",
    timestamp: new Date().toISOString(),
    payload: isValidJson ? parsedPayload : "[Invalid JSON]",
  },
  null,
  2
)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}