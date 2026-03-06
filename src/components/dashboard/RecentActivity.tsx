import Link from "next/link";
import { STATUS_CONFIG, formatRelativeDate } from "@/lib/utils";
import { ArrowRight, Activity } from "lucide-react";

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: string;
  date_applied?: string | null;
  created_at: string;
}

export function RecentActivity({ applications }: { applications: Application[] }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
          <Activity className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>

      {applications.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">No applications yet.</p>
          <Link href="/jobs" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            Find jobs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status] ?? {
              label: app.status,
              color: "text-slate-400",
              bg: "bg-slate-800",
            };
            return (
              <div key={app.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-800/40 bg-slate-800/30 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{app.job_title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.company} · {formatRelativeDate(app.date_applied ?? app.created_at)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium border border-current/20 ${statusConfig.color}`}
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  {statusConfig.label}
                </span>
              </div>
            );
          })}
          <Link href="/tracker" className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/60 py-2 text-xs text-slate-400 transition-colors hover:border-blue-500/40 hover:text-blue-400">
            View all applications <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
