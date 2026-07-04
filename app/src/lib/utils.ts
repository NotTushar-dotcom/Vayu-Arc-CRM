import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

export function getPriorityColor(score: number): string {
  if (score >= 80) return "text-emerald-400 bg-emerald-400/10";
  if (score >= 50) return "text-amber-400 bg-amber-400/10";
  return "text-slate-400 bg-slate-400/10";
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    "Lead Found": "text-slate-400 bg-slate-400/10",
    "LinkedIn Request Sent": "text-blue-400 bg-blue-400/10",
    "Connected": "text-sky-400 bg-sky-400/10",
    "Website Researched": "text-indigo-400 bg-indigo-400/10",
    "Socials Found": "text-violet-400 bg-violet-400/10",
    "Email Found": "text-purple-400 bg-purple-400/10",
    "Cold Email Sent": "text-fuchsia-400 bg-fuchsia-400/10",
    "Instagram DM Sent": "text-pink-400 bg-pink-400/10",
    "Waiting": "text-amber-400 bg-amber-400/10",
    "Follow-up 1": "text-orange-400 bg-orange-400/10",
    "Follow-up 2": "text-orange-500 bg-orange-500/10",
    "Discovery Call": "text-emerald-400 bg-emerald-400/10",
    "Proposal Sent": "text-teal-400 bg-teal-400/10",
    "Client Won": "text-green-400 bg-green-400/10",
    "Client Lost": "text-red-400 bg-red-400/10",
  };
  return colors[stage] || "text-slate-400 bg-slate-400/10";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
