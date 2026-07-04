"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store";
import { logout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Webhook, Zap, FileText, AlertTriangle,
  LayoutDashboard, LogOut, Gauge, Activity, Send,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",         icon: LayoutDashboard },
  { href: "/webhooks",   label: "Webhooks",          icon: Webhook },
  { href: "/events",     label: "Events",            icon: Zap },
  { href: "/delivery",   label: "Delivery logs",     icon: Send },
  { href: "/logs",       label: "Logs",              icon: FileText },
  { href: "/dlq",        label: "Dead letter queue", icon: AlertTriangle },
  { href: "/rate-limit", label: "Rate limit",        icon: Gauge },
  { href: "/monitoring", label: "Monitoring",        icon: Activity },
];
export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold tracking-tight">Webhook Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">Microservices dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}