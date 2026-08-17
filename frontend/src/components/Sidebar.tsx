"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Webhook,
  Zap,
  FileText,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Gauge,
  Activity,
  Send,
  Radio,
  Server,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/webhooks", label: "Endpoints", icon: Webhook },
  { href: "/events", label: "Event Studio", icon: Zap },
  { href: "/delivery", label: "Delivery Logs", icon: Send },
  { href: "/logs", label: "System Logs", icon: FileText },
  { href: "/dlq", label: "Dead Letter Queue", icon: AlertTriangle },
  { href: "/rate-limit", label: "Rate Limiter", icon: Gauge },
  { href: "/monitoring", label: "Live Monitor", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Radio className="text-white size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-100 text-sm tracking-tight">
                  Webhook Hub
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Microservice Dispatcher</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-3">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative group",
                    isActive
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area: Cluster Telemetry & User Card */}
      <div className="p-3 space-y-3 border-t border-slate-800/80">
        {/* Worker Telemetry Pill */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Server size={13} className="text-slate-500" />
            <span>Delivery Engine</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 4 Active
          </span>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-slate-200 uppercase shrink-0">
              {user?.email ? user.email.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-200 font-medium truncate">
                {user?.email || "Authenticated User"}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">ID: {user?.id ?? "—"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}