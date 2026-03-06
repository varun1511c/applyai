"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { STATUS_CONFIG } from "@/lib/utils";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#6b7280",
];

const DARK_TOOLTIP = {
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "10px",
  color: "#f1f5f9",
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

interface DashboardChartsProps {
  lineData: { date: string; count: number }[];
  donutData: { name: string; value: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={DARK_TOOLTIP} className="px-3 py-2 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-blue-400">{payload[0].value} application{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const name = STATUS_CONFIG[payload[0].name]?.label ?? payload[0].name;
  return (
    <div style={DARK_TOOLTIP} className="px-3 py-2 text-sm">
      <p className="text-slate-400 text-xs mb-1">{name}</p>
      <p className="font-bold text-white">{payload[0].value}</p>
    </div>
  );
}

export function DashboardCharts({ lineData, donutData }: DashboardChartsProps) {
  const hasApplications = lineData.some((d) => d.count > 0);

  return (
    <div className="space-y-4">
      {/* Area chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Applications Activity</h3>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </div>
        </div>

        {hasApplications ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#blueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#3b82f6", stroke: "#1e40af", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-slate-500">
            <TrendingUp className="h-8 w-8 opacity-30" />
            <p className="text-sm">No applications yet — start applying!</p>
          </div>
        )}
      </div>

      {/* Donut chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/20">
            <PieIcon className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Status Breakdown</h3>
            <p className="text-xs text-slate-500">All applications</p>
          </div>
        </div>

        {donutData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-slate-400">
                    {STATUS_CONFIG[value]?.label ?? value}
                  </span>
                )}
                iconSize={7}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-slate-500">
            <PieIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No data yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
