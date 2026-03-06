export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date_posted: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  is_remote: boolean;
  source: "adzuna" | "remoteok" | "themuse";
  logo?: string;
  tags?: string[];
}

export interface JobSearchParams {
  keyword: string;
  location?: string;
  source?: "all" | "adzuna" | "remoteok" | "themuse";
  job_type?: "all" | "remote" | "fulltime" | "contract";
  date_posted?: "any" | "24h" | "week" | "month";
}
