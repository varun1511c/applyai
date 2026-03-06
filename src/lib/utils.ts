import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(d);
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  saved:        { label: "Saved",        color: "text-slate-600",  bg: "bg-slate-100" },
  applied:      { label: "Applied",      color: "text-blue-600",   bg: "bg-blue-100" },
  phone_screen: { label: "Phone Screen", color: "text-purple-600", bg: "bg-purple-100" },
  interview:    { label: "Interview",    color: "text-amber-600",  bg: "bg-amber-100" },
  technical:    { label: "Technical",    color: "text-orange-600", bg: "bg-orange-100" },
  offer:        { label: "Offer",        color: "text-green-600",  bg: "bg-green-100" },
  rejected:     { label: "Rejected",     color: "text-red-600",    bg: "bg-red-100" },
  withdrawn:    { label: "Withdrawn",    color: "text-gray-600",   bg: "bg-gray-100" },
  ghosted:      { label: "Ghosted",      color: "text-slate-400",  bg: "bg-slate-50" },
};
