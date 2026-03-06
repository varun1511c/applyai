"use client";

import { Briefcase, TrendingUp, MessageSquare, Trophy, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  total: number;
  thisWeek: number;
  responseRate: number;
  activeInterviews: number;
}

const stats = [
  {
    key: "total",
    label: "Total Applications",
    icon: Briefcase,
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    glow: "shadow-blue-500/10",
    badge: "bg-blue-500/10 text-blue-400",
  },
  {
    key: "thisWeek",
    label: "This Week",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    badge: "bg-emerald-500/10 text-emerald-400",
  },
  {
    key: "responseRate",
    label: "Response Rate",
    icon: MessageSquare,
    gradient: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    glow: "shadow-violet-500/10",
    badge: "bg-violet-500/10 text-violet-400",
  },
  {
    key: "activeInterviews",
    label: "Active Interviews",
    icon: Trophy,
    gradient: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    glow: "shadow-amber-500/10",
    badge: "bg-amber-500/10 text-amber-400",
  },
];

export function StatsCards({
  total,
  thisWeek,
  responseRate,
  activeInterviews,
}: StatsCardsProps) {
  const values: Record<string, string | number> = {
    total,
    thisWeek,
    responseRate: `${responseRate}%`,
    activeInterviews,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            stat.gradient,
            stat.border,
            stat.glow
          )}
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl"
            style={{ background: "currentColor" }} />

          <div className="flex items-start justify-between">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.iconBg)}>
              <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
            </div>
            <span className={cn("flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium", stat.badge)}>
              <ArrowUpRight className="h-3 w-3" />
              live
            </span>
          </div>

          <div className="mt-4">
            <p className="text-3xl font-black text-white tabular-nums">
              {values[stat.key]}
            </p>
            <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
