"use client";

import { useState } from "react";
import { useCreateEventMutation } from "@/store/services/eventApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export default function EventsPage() {
  const [createEvent, { isLoading }] = useCreateEventMutation();
  

  const [eventType, setEventType] = useState("");
  const [email, setEmail] = useState("");
  const [payloadStr, setPayloadStr] = useState("{}");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      toast.error("Invalid JSON in payload");
      return;
    }

    try {
      const result = await createEvent({ eventType, email, payload }).unwrap();
     toast.success("Event published", {
  description: `ID: ${result.data._id}`,
});
      setEventType("");
      setEmail("");
      setPayloadStr("{}");
      setIdempotencyKey("");
    } catch {
      toast.error("Failed to publish event");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Publish event</h2>
        <p className="text-muted-foreground mt-1">
          Trigger an event that will be delivered to registered webhooks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap size={16} /> New event
          </CardTitle>
          <CardDescription>
            Fill in the event details below. The event will be published to Kafka and delivered
            to all matching webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Event type</Label>
              <Input
                placeholder="user.created"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Payload (JSON)</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y"
                value={payloadStr}
                onChange={(e) => setPayloadStr(e.target.value)}
                placeholder='{"key": "value"}'
              />
            </div>
            <div className="space-y-2">
              <Label>
                Idempotency key{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                placeholder="unique-request-id"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Publishing…" : "Publish event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}