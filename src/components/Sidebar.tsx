"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Search,
  Car,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children?: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Acquisition", href: "/acquisition-search", icon: Car },
  { label: "VIN Intel", href: "/vin-intel", icon: Search },
  { label: "Dealership", href: "/dealership", icon: Building2 },
] as const;

export function Sidebar({ children }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (pathname.startsWith(`${href}/`)) return true;
    if (href === "/acquisition-search" && pathname.startsWith("/acquisition/"))
      return true;
    if (href === "/acquisition-search" && pathname.startsWith("/job-listing/"))
      return true;
    return false;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900">
      <div className="flex h-14 items-center border-b border-slate-700 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
          H
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600/80 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-700 p-4">
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Settings className="h-5 w-5 shrink-0" aria-hidden />
          Settings
        </button>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-slate-800 hover:text-red-300"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Sign Out
        </button>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-white">
            {(user?.firstName?.charAt(0) ?? user?.email?.charAt(0) ?? "U")}
            {user?.lastName?.charAt(0) ?? ""}
          </div>
          <span className="truncate text-sm text-slate-300">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email ?? "User"}
          </span>
        </div>
      </div>
    </aside>
  );
}
