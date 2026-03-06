"use client";

import { ExternalLink, MapPin, Clock, DollarSign, Bookmark, Building2 } from "lucide-react";
import { JobListing } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: JobListing;
  onSave?: (job: JobListing) => void;
  isSaved?: boolean;
}

const SOURCE_CONFIG = {
  adzuna: {
    label: "Adzuna",
    pill: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    bar: "from-orange-500 to-amber-500",
  },
  remoteok: {
    label: "RemoteOK",
    pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    bar: "from-emerald-500 to-teal-500",
  },
  themuse: {
    label: "The Muse",
    pill: "bg-pink-500/15 text-pink-400 border-pink-500/25",
    bar: "from-pink-500 to-rose-500",
  },
};

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
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

export function JobCard({ job, onSave, isSaved }: JobCardProps) {
  const source = SOURCE_CONFIG[job.source];
  const salary = formatSalary(job.salary_min, job.salary_max);
  const initials = job.company
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/80 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-black/30">
      {/* Top color bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${source.bar}`} />

      <div className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800 text-sm font-bold text-slate-300">
            {job.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.logo} alt={job.company} className="h-full w-full object-contain p-1" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-white transition-colors group-hover:text-blue-400">
              {job.title}
            </h3>
            <p className="flex items-center gap-1 text-sm text-slate-400 mt-0.5 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.company}
            </p>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium", source.pill)}>
            {source.label}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
          {salary && (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-medium">
              <DollarSign className="h-3.5 w-3.5" /> {salary}
            </span>
          )}
          {job.date_posted && (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {timeAgo(job.date_posted)}
            </span>
          )}
          {job.is_remote && (
            <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-blue-400 font-medium border border-blue-500/20">
              Remote
            </span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-md bg-slate-800/80 border border-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-400"
          >
            Apply Now <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => onSave?.(job)}
            className={cn(
              "flex items-center justify-center rounded-xl border px-3 py-2.5 transition-all",
              isSaved
                ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                : "border-slate-700 bg-slate-800/60 text-slate-500 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            )}
            title={isSaved ? "Unsave" : "Save job"}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  );
}
