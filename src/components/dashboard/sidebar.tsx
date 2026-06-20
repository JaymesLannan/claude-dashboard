"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Activity, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/usage", label: "Usage", icon: Activity },
  { href: "/dashboard/costs", label: "Costs", icon: DollarSign },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">Claude Dashboard</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "text-blue-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 px-3 py-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-4 w-4 text-gray-400" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
