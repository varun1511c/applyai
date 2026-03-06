import { JobSearch } from "@/components/jobs/JobSearch";
import { SavedJobs } from "@/components/jobs/SavedJobs";
import { Briefcase, Bookmark } from "lucide-react";

// Tabs are client-driven — we pass tab state via searchParams
export default function JobsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const hasAdzuna = !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY);
  const tab = searchParams?.tab === "saved" ? "saved" : "search";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/15">
          <Briefcase className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Job Search</h2>
          <p className="text-sm text-slate-400">
            Real listings from RemoteOK, Jobicy, The Muse{hasAdzuna ? ", and Adzuna" : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 w-fit">
        <a
          href="/jobs"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "search"
              ? "bg-slate-800 text-white shadow"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Search
        </a>
        <a
          href="/jobs?tab=saved"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "saved"
              ? "bg-slate-800 text-white shadow"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Bookmark className="h-4 w-4" /> Saved Jobs
        </a>
      </div>

      {tab === "search" ? (
        <JobSearch hasAdzuna={hasAdzuna} />
      ) : (
        <SavedJobs />
      )}
    </div>
  );
}
