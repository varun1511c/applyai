"use client";

import { useEffect, useState } from "react";
import { Bookmark, ExternalLink, Trash2, MapPin, DollarSign, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedJob {
  id: string;
  external_id: string;
  platform: string;
  job_title: string;
  company: string;
  location: string | null;
  job_url: string | null;
  description: string | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  raw_data: Record<string, unknown> | null;
}

const SOURCE_PILL: Record<string, string> = {
  adzuna: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  remoteok: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  themuse: "bg-pink-500/15 text-pink-400 border-pink-500/25",
};

const SOURCE_LABEL: Record<string, string> = {
  adzuna: "Adzuna",
  remoteok: "RemoteOK",
  themuse: "The Muse",
};

function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function SavedJobs() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((d) => setJobs(d.saved ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (job: SavedJob) => {
    setRemoving((p) => new Set([...p, job.id]));
    try {
      await fetch("/api/jobs/saved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_id: job.external_id }),
      });
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      toast.success("Removed from saved jobs");
    } catch {
      toast.error("Failed to remove job");
    } finally {
      setRemoving((p) => { const n = new Set(p); n.delete(job.id); return n; });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          <Bookmark className="h-7 w-7 text-slate-600" />
        </div>
        <p className="font-semibold text-slate-300">No saved jobs yet</p>
        <p className="text-sm text-slate-500">
          Click the bookmark icon on any job to save it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-300">{jobs.length}</span> saved job
        {jobs.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => {
          const salary = formatSalary(job.salary_min, job.salary_max);
          const pill =
            SOURCE_PILL[job.platform] ??
            "bg-slate-700/50 text-slate-400 border-slate-600";
          const label = SOURCE_LABEL[job.platform] ?? job.platform;
          const initials = job.company
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();
          const logo = (job.raw_data?.logo as string) ?? null;

          return (
            <div
              key={job.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/80 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl"
            >
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-violet-500" />
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800 text-sm font-bold text-slate-300">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={job.company}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{job.job_title}</h3>
                    <p className="text-sm text-slate-400 truncate">{job.company}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                      pill
                    )}
                  >
                    {label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {job.location && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                  )}
                  {salary && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400">
                      <DollarSign className="h-3.5 w-3.5" /> {salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> Saved {timeAgo(job.created_at)}
                  </span>
                </div>

                {job.description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {job.description}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40"
                    >
                      Apply Now <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => unsave(job)}
                    disabled={removing.has(job.id)}
                    className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-slate-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    title="Remove from saved"
                  >
                    {removing.has(job.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
