import { NextRequest, NextResponse } from "next/server";
import { JobListing } from "@/types/jobs";

export const runtime = "nodejs";

/**
 * Strict title relevance using word-boundary matching.
 * Each query word must appear as a standalone word (or word-start) in the title.
 * - "cloud" matches "Cloud Engineer" but NOT "SalesCloud Manager"
 * - "engineer" matches "Engineer" and "Engineering" (same stem) but NOT unrelated words
 * Every query word must match — "Cloud Engineer" requires BOTH in the title.
 */
function wordInTitle(title: string, word: string): boolean {
  // \b ensures word boundary — "cloud" won't match mid-word like "salescloud"
  return new RegExp(`\\b${word}`, "i").test(title);
}

function isTitleRelevant(title: string, keyword: string): boolean {
  const kwLower = keyword.toLowerCase().trim();

  // Fast path: exact phrase
  if (title.toLowerCase().includes(kwLower)) return true;

  // Every word must appear at a word boundary in the title
  const words = kwLower.split(/\s+/).filter((w) => w.length > 1);
  return words.every((w) => wordInTitle(title, w));
}

// ─── Adzuna ──────────────────────────────────────────────────────────────────
async function fetchAdzuna(keyword: string, location: string): Promise<JobListing[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  if (!appId || !appKey) return [];

  try {
    // Use what= (broader) so we get a large pool, then our title filter trims it
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: keyword,
      results_per_page: "50",
    });
    if (location) params.set("where", location);

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results ?? []).map((job: Record<string, unknown>) => {
      const company = job.company as Record<string, string>;
      const loc = job.location as Record<string, unknown>;
      const desc = ((job.description as string) ?? "").replace(/<[^>]+>/g, "");
      return {
        id: `adzuna-${job.id}`,
        title: job.title as string,
        company: company?.display_name ?? "Unknown",
        location: (loc?.display_name as string) ?? "Unknown",
        description: desc.slice(0, 320),
        url: job.redirect_url as string,
        date_posted: job.created as string,
        salary_min: job.salary_min as number | undefined,
        salary_max: job.salary_max as number | undefined,
        job_type: job.contract_type as string | undefined,
        is_remote: (desc + (job.title as string)).toLowerCase().includes("remote"),
        source: "adzuna" as const,
      };
    });
  } catch {
    return [];
  }
}

// ─── RemoteOK ─────────────────────────────────────────────────────────────────
async function fetchRemoteOK(keyword: string): Promise<JobListing[]> {
  try {
    // RemoteOK is tag-based — use the first word for the widest match pool,
    // then our global title filter will trim to exact relevance
    const primaryTag = keyword.split(" ")[0];

    const res = await fetch(
      `https://remoteok.com/api?tag=${encodeURIComponent(primaryTag.toLowerCase())}`,
      {
        headers: { "User-Agent": "ApplyAI/1.0" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = Array.isArray(data) ? data.slice(1) : [];

    return jobs
      .filter((j: Record<string, unknown>) => j.position)
      .slice(0, 15)
      .map((job: Record<string, unknown>) => ({
        id: `remoteok-${job.id}`,
        title: job.position as string,
        company: job.company as string,
        location: (job.location as string) || "Remote",
        description: ((job.description as string) ?? "").replace(/<[^>]+>/g, "").slice(0, 320),
        url: job.url as string,
        date_posted: new Date((job.epoch as number) * 1000).toISOString(),
        salary_min: job.salary_min ? Number(job.salary_min) : undefined,
        salary_max: job.salary_max ? Number(job.salary_max) : undefined,
        is_remote: true,
        source: "remoteok" as const,
        logo: job.company_logo as string | undefined,
        tags: (job.tags as string[]) ?? [],
      }));
  } catch {
    return [];
  }
}

// ─── Jobicy (free, no key needed) ────────────────────────────────────────────
async function fetchJobicy(keyword: string): Promise<JobListing[]> {
  try {
    // Use first word as tag for broadest pool; title filter handles relevance
    const tag = encodeURIComponent(keyword.split(" ")[0].toLowerCase());
    const res = await fetch(
      `https://jobicy.com/api/v2/remote-jobs?count=20&tag=${tag}`,
      {
        headers: { "User-Agent": "ApplyAI/1.0" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.jobs) return [];

    return data.jobs
      .slice(0, 30)
      .map((job: Record<string, unknown>) => {
        const pubDate = job.pubDate as string;
        return {
          id: `jobicy-${job.id}`,
          title: job.jobTitle as string,
          company: job.companyName as string,
          location: (job.jobGeo as string) || "Remote",
          description: ((job.jobExcerpt as string) ?? "").replace(/<[^>]+>/g, "").slice(0, 320),
          url: job.url as string,
          date_posted: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          is_remote: true,
          source: "remoteok" as const, // display under RemoteOK tab (both are remote)
          logo: job.companyLogo as string | undefined,
          tags: Array.isArray(job.jobIndustry) ? job.jobIndustry as string[] : [],
        };
      });
  } catch {
    return [];
  }
}

// ─── The Muse ────────────────────────────────────────────────────────────────
const MUSE_CATEGORY_MAP: Record<string, string> = {
  engineer: "Software Engineer", developer: "Software Engineer",
  software: "Software Engineer", frontend: "Software Engineer",
  backend: "Software Engineer", fullstack: "Software Engineer",
  cloud: "Software Engineer", devops: "Software Engineer",
  data: "Data and Analytics", scientist: "Data and Analytics",
  analyst: "Data and Analytics", design: "Design and UX",
  ux: "Design and UX", ui: "Design and UX",
  product: "Product", marketing: "Marketing and PR",
  sales: "Sales", finance: "Finance",
  hr: "Human Resources", operations: "Operations",
};

async function fetchTheMuse(keyword: string): Promise<JobListing[]> {
  try {
    const lower = keyword.toLowerCase();
    const category =
      Object.entries(MUSE_CATEGORY_MAP).find(([k]) => lower.includes(k))?.[1] ??
      "Software Engineer";

    const res = await fetch(
      `https://www.themuse.com/api/public/jobs?page=1&descending=true&category.name=${encodeURIComponent(category)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results ?? [])
      .slice(0, 30)
      .map((job: Record<string, unknown>) => {
        const company = job.company as Record<string, string>;
        const locations = job.locations as Array<Record<string, string>>;
        const refs = job.refs as Record<string, string>;
        const locationStr = locations?.[0]?.name ?? "Unknown";
        return {
          id: `themuse-${job.id}`,
          title: job.name as string,
          company: company?.name ?? "Unknown",
          location: locationStr,
          description: ((job.contents as string) ?? "").replace(/<[^>]+>/g, "").slice(0, 320),
          url: refs?.landing_page ?? "https://www.themuse.com",
          date_posted: job.publication_date as string,
          is_remote:
            locationStr.toLowerCase().includes("remote") ||
            locationStr.toLowerCase().includes("flexible"),
          source: "themuse" as const,
        };
      });
  } catch {
    return [];
  }
}

// ─── Date filter ─────────────────────────────────────────────────────────────
function filterByDate(jobs: JobListing[], dateFilter: string): JobListing[] {
  if (dateFilter === "any") return jobs;
  const ms: Record<string, number> = {
    "24h": 86400000, week: 604800000, month: 2592000000,
  };
  const cutoff = Date.now() - (ms[dateFilter] ?? 0);
  return jobs.filter((j) => !j.date_posted || new Date(j.date_posted).getTime() >= cutoff);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get("keyword") ?? "";
  const location = searchParams.get("location") ?? "";
  const source = searchParams.get("source") ?? "all";
  const jobType = searchParams.get("job_type") ?? "all";
  const datePosted = searchParams.get("date_posted") ?? "any";

  if (!keyword.trim()) return NextResponse.json({ jobs: [], total: 0 });

  const fetchers: Promise<JobListing[]>[] = [];
  if (source === "all" || source === "adzuna") fetchers.push(fetchAdzuna(keyword, location));
  if (source === "all" || source === "remoteok") {
    fetchers.push(fetchRemoteOK(keyword));
    fetchers.push(fetchJobicy(keyword)); // bundled with remoteok tab
  }
  if (source === "all" || source === "themuse") fetchers.push(fetchTheMuse(keyword));

  const results = await Promise.allSettled(fetchers);
  let jobs: JobListing[] = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((j) => j.title && j.company)
    // ── Strict title filter applied to ALL sources ──────────────────────────
    // Every word in the query must appear in the job title.
    // Prevents "Software Engineer" appearing when searching "Cloud Engineer".
    .filter((j) => isTitleRelevant(j.title, keyword));

  // Deduplicate by title+company
  const seen = new Set<string>();
  jobs = jobs.filter((j) => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (jobType === "remote") {
    jobs = jobs.filter((j) => j.is_remote || j.location.toLowerCase().includes("remote"));
  } else if (jobType === "fulltime") {
    jobs = jobs.filter((j) => !j.job_type || j.job_type.toLowerCase().includes("full") || j.source === "remoteok");
  } else if (jobType === "contract") {
    jobs = jobs.filter((j) => j.job_type?.toLowerCase().includes("contract"));
  }

  jobs = filterByDate(jobs, datePosted);
  jobs.sort((a, b) => {
    const ta = a.date_posted ? new Date(a.date_posted).getTime() : 0;
    const tb = b.date_posted ? new Date(b.date_posted).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({ jobs, total: jobs.length });
}
