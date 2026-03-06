"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, Loader2, Briefcase, Wifi } from "lucide-react";
import { JobCard } from "./JobCard";
import { JobListing, JobSearchParams } from "@/types/jobs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SOURCE_TABS = [
  { value: "all", label: "All Sources" },
  { value: "remoteok", label: "RemoteOK + Jobicy" },
  { value: "themuse", label: "The Muse" },
  { value: "adzuna", label: "Adzuna" },
] as const;

const JOB_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "remote", label: "Remote" },
  { value: "fulltime", label: "Full-time" },
  { value: "contract", label: "Contract" },
] as const;

const DATE_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24h" },
  { value: "week", label: "Last week" },
  { value: "month", label: "Last month" },
] as const;

const POPULAR_SEARCHES = [
  "Cloud Engineer", "Frontend Developer", "Data Scientist",
  "DevOps Engineer", "Product Manager", "UX Designer",
];

function JobSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
      <div className="flex gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-800" />
          <div className="h-3 w-1/2 rounded bg-slate-800" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-24 rounded bg-slate-800" />
        <div className="h-3 w-16 rounded bg-slate-800" />
      </div>
      <div className="h-3 w-full rounded bg-slate-800" />
      <div className="h-3 w-5/6 rounded bg-slate-800" />
      <div className="h-10 w-full rounded-xl bg-slate-800" />
    </div>
  );
}

export function JobSearch({ hasAdzuna }: { hasAdzuna: boolean }) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState<JobSearchParams["source"]>("all");
  const [jobType, setJobType] = useState<JobSearchParams["job_type"]>("all");
  const [datePosted, setDatePosted] = useState<JobSearchParams["date_posted"]>("any");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Load saved job IDs on mount
  useEffect(() => {
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set<string>(
          (d.saved ?? []).map((j: { external_id: string }) => j.external_id)
        );
        setSavedIds(ids);
      })
      .catch(() => {});
  }, []);

  const search = useCallback(
    async (kw?: string) => {
      const q = kw ?? keyword;
      if (!q.trim()) return;
      setLoading(true);
      setSearched(true);

      const params = new URLSearchParams({
        keyword: q,
        location,
        source: source ?? "all",
        job_type: jobType ?? "all",
        date_posted: datePosted ?? "any",
      });

      try {
        const res = await fetch(`/api/jobs/search?${params}`);
        const data = await res.json();
        setJobs(data.jobs ?? []);
      } catch {
        setJobs([]);
        toast.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    },
    [keyword, location, source, jobType, datePosted]
  );

  const handlePopular = (term: string) => {
    setKeyword(term);
    search(term);
  };

  const toggleSave = async (job: JobListing) => {
    const isSaved = savedIds.has(job.id);

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(job.id);
      else next.add(job.id);
      return next;
    });

    try {
      if (isSaved) {
        await fetch("/api/jobs/saved", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ external_id: job.id }),
        });
        toast.success("Removed from saved jobs");
      } else {
        await fetch("/api/jobs/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job),
        });
        toast.success("Job saved!");
      }
    } catch {
      // Revert on error
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(job.id);
        else next.delete(job.id);
        return next;
      });
      toast.error("Failed to update saved jobs");
    }
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 p-4 shadow-lg">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Job title, skills, keywords..."
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="relative sm:w-44">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Location / Remote"
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <button
            onClick={() => search()}
            disabled={loading || !keyword.trim()}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
              showFilters
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-800 pt-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Job type</p>
              <div className="flex gap-1.5">
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setJobType(opt.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      jobType === opt.value
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-slate-700 text-slate-400 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Date posted</p>
              <div className="flex gap-1.5">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDatePosted(opt.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      datePosted === opt.value
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-slate-700 text-slate-400 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SOURCE_TABS.filter((t) => t.value !== "adzuna" || hasAdzuna).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSource(tab.value as JobSearchParams["source"])}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              source === tab.value
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-slate-700/60 bg-slate-900 text-slate-400 hover:text-white"
            )}
          >
            {tab.value === "remoteok" && <Wifi className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        ))}
        {!hasAdzuna && (
          <span className="flex shrink-0 items-center rounded-xl border border-dashed border-slate-700 px-4 py-2 text-xs text-slate-600">
            Adzuna (add API key to .env.local)
          </span>
        )}
      </div>

      {/* Empty state */}
      {!searched && !loading && (
        <div className="space-y-4 py-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/60">
              <Briefcase className="h-7 w-7 text-slate-500" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-300">Search for your next role</p>
            <p className="mt-1 text-sm text-slate-500">
              Aggregates jobs from RemoteOK, Jobicy, The Muse{hasAdzuna ? ", and Adzuna" : ""}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handlePopular(term)}
                className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-blue-400"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)}
        </div>
      )}

      {searched && !loading && jobs.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-slate-400">No jobs found. Try different keywords or broaden your filters.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-300">{jobs.length}</span> jobs found
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={toggleSave}
                isSaved={savedIds.has(job.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
