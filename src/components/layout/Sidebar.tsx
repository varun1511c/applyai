"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, FileText,
  TableProperties, MessageSquare, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard",   color: "text-blue-400" },
  { href: "/jobs",      icon: Search,          label: "Job Search",   color: "text-cyan-400" },
  { href: "/resume",    icon: FileText,         label: "Resume",       color: "text-violet-400" },
  { href: "/tracker",   icon: TableProperties,  label: "Job Tracker",  color: "text-emerald-400" },
  { href: "/chat",      icon: MessageSquare,    label: "AI Chat",      color: "text-amber-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r border-slate-800/60 bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-slate-800/60 transition-all duration-300",
          collapsed ? "px-3 justify-center" : "px-4 gap-3"
        )}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white font-black text-base shadow-lg shadow-blue-900/40">
            A
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          {!collapsed && (
            <span className="text-lg font-black tracking-tight text-white animate-fade-in">ApplyAI</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "nav-active text-white"
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full opacity-80" />
                    )}

                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      isActive ? "text-white" : item.color,
                      !isActive && "group-hover:scale-110"
                    )} />

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Hover glow dot */}
                    {!isActive && !collapsed && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom: Settings */}
        <div className="border-t border-slate-800/60 py-3 px-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === "/settings"
                    ? "nav-active text-white"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                )}
              >
                <Settings className={cn("h-5 w-5 shrink-0", pathname === "/settings" ? "text-white" : "text-slate-500")} />
                {!collapsed && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-[72px] h-7 w-7 rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white shadow-lg z-10 transition-all"
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </Button>
      </aside>
    </TooltipProvider>
  );
}
