"use client";

import { useAppSelector } from "@/store";
import { useState } from "react";
import { Key, Copy, Check, Terminal, ExternalLink, Activity } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { apiKey, user } = useAppSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (!apiKey) {
      toast.error("No API key found. Please sign in or generate one.");
      return;
    }
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API Key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Cluster: Production</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            Kafka Healthy
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick API Key Action */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
          <Key size={13} className="text-blue-400" />
          <span className="text-slate-400">API Key:</span>
          <span className="text-slate-200">
            {apiKey ? `${apiKey.slice(0, 8)}••••••••` : "Not Configured"}
          </span>
          <button
            onClick={copyApiKey}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Copy API Key"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Quick Dispatch CTA */}
        <Link href="/events">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm shadow-blue-500/20 text-xs h-8">
            <Terminal size={13} className="mr-1.5" /> Dispatch Event
          </Button>
        </Link>
      </div>
    </header>
  );
}
