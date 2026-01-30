"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showLastUpdated?: boolean;
}

export function Header({
  title,
  showSearch = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  showLastUpdated = false,
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b ml-64">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {showLastUpdated && (
              <div className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                LAST UPDATED: 2 MINS AGO
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            )}

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
