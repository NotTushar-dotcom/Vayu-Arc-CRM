import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateLeadScore(lead: {
  videoQuality?: number | null;
  brandingRating?: number | null;
  followers?: number | null;
  estimatedBudget?: number | null;
  needsEditing?: string | null;
}): number {
  let score = 0;

  // Video quality (1-10, weight 2) → max 20
  if (lead.videoQuality) {
    score += (10 - lead.videoQuality) * 2; // Lower quality = higher opportunity
  }

  // Branding rating (1-10, weight 1.5) → max 15
  if (lead.brandingRating) {
    score += (10 - lead.brandingRating) * 1.5;
  }

  // Followers → max 25
  if (lead.followers) {
    if (lead.followers > 100000) score += 25;
    else if (lead.followers > 50000) score += 20;
    else if (lead.followers > 10000) score += 15;
    else if (lead.followers > 1000) score += 10;
    else score += 5;
  }

  // Budget → max 15
  if (lead.estimatedBudget) {
    if (lead.estimatedBudget >= 5000) score += 15;
    else if (lead.estimatedBudget >= 2000) score += 10;
    else if (lead.estimatedBudget >= 500) score += 5;
  }

  // Needs editing → max 25
  if (lead.needsEditing === "YES") score += 25;
  else if (lead.needsEditing === "MAYBE") score += 10;

  return Math.min(Math.round(score), 100);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#7ec4a8";
  if (score >= 40) return "#e8a87c";
  if (score >= 20) return "#f59e0b";
  return "#8a9b92";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function getDaysUntil(date: Date | string | null | undefined): number {
  if (!date) return 0;
  const d = new Date(date);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
