"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  Package,
  Search,
  MoreVertical,
  LogOut,
  Car,
  AlertTriangle,
} from "lucide-react";

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      label: "Inventory",
      href: "/inventory",
      icon: Package,
    },
    {
      label: "Inventory Alerts",
      href: "/inventory-alerts",
      icon: AlertTriangle,
    },
    {
      label: "Vehicle Acquisition",
      href: "/acquisition-search",
      icon: Car,
    },
    {
      label: "VIN Intel",
      href: "/vin-intel",
      icon: Search,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className="w-64 bg-white shadow-sm fixed left-0 top-0 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Inventory Management
        </h2>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              className={`w-full justify-start transition-all duration-200 ${
                isActive(item.href)
                  ? "text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  : "text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900"
              }`}
              style={isActive(item.href) ? { backgroundColor: "#136dec" } : {}}
              onClick={() => router.push(item.href)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Settings at Bottom */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
          onClick={() => router.push("/settings")}
        >
          <MoreVertical className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2 transition-all duration-200"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
