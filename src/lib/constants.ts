// ─── Pipeline Stages ────────────────────────────────────

export const PIPELINE_STAGES = [
  { value: "LEAD_FOUND", label: "Lead Found", color: "#8a9b92" },
  { value: "LINKEDIN_REQUEST_SENT", label: "LinkedIn Request Sent", color: "#5b9e8a" },
  { value: "CONNECTED", label: "Connected", color: "#5b9e8a" },
  { value: "WEBSITE_RESEARCHED", label: "Website Researched", color: "#7ec4a8" },
  { value: "SOCIALS_FOUND", label: "Socials Found", color: "#7ec4a8" },
  { value: "EMAIL_FOUND", label: "Email Found", color: "#8dd4b0" },
  { value: "COLD_EMAIL_SENT", label: "Cold Email Sent", color: "#8dd4b0" },
  { value: "INSTAGRAM_DM_SENT", label: "Instagram DM Sent", color: "#b0d9c8" },
  { value: "WAITING", label: "Waiting", color: "#8a9b92" },
  { value: "FOLLOW_UP_1", label: "Follow-up 1", color: "#e8a87c" },
  { value: "FOLLOW_UP_2", label: "Follow-up 2", color: "#e8a87c" },
  { value: "DISCOVERY_CALL", label: "Discovery Call", color: "#fef3e2" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent", color: "#fef3e2" },
  { value: "CLIENT_WON", label: "Client Won", color: "#4ade80" },
  { value: "CLIENT_LOST", label: "Client Lost", color: "#f87171" },
] as const;

export const PIPELINE_STAGE_MAP = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.value, s])
);

// ─── Lead Sources ───────────────────────────────────────

export const LEAD_SOURCES = [
  { value: "LINKEDIN", label: "LinkedIn", icon: "linkedin" },
  { value: "INSTAGRAM", label: "Instagram", icon: "instagram" },
  { value: "REFERRAL", label: "Referral", icon: "users" },
  { value: "WEBSITE", label: "Website", icon: "globe" },
  { value: "GOOGLE", label: "Google", icon: "search" },
  { value: "COLD_EMAIL", label: "Cold Email", icon: "mail" },
  { value: "OTHER", label: "Other", icon: "more-horizontal" },
] as const;

// ─── Platforms Config ───────────────────────────────────

export const OUTREACH_CONFIG = {
  EMAIL: {
    label: "Email",
    icon: "mail",
    brandColor: {
      bg: "bg-red-500/10 hover:bg-red-500/15 border-red-500/20 data-[active=true]:border-red-500 data-[active=true]:bg-red-500/20 data-[active=true]:text-red-500",
      iconColor: "text-red-500",
      glow: "shadow-[0_0_15px_-3px_rgba(239,68,68,0.25)]",
    },
    actions: [
      { value: "COLD_EMAIL", label: "Cold Email" },
      { value: "FOLLOW_UP", label: "Follow Up" },
      { value: "PROPOSAL", label: "Proposal" },
      { value: "GENERAL_EMAIL", label: "General Email" },
    ],
    statuses: [
      { value: "DRAFT", label: "Draft", color: "#6b7280" },
      { value: "QUEUED", label: "Queued", color: "#3b82f6" },
      { value: "SENT", label: "Sent", color: "#10b981" },
      { value: "DELIVERED", label: "Delivered", color: "#059669" },
      { value: "OPENED", label: "Opened", color: "#6366f1" },
      { value: "CLICKED", label: "Clicked", color: "#8b5cf6" },
      { value: "REPLIED", label: "Replied", color: "#ec4899" },
      { value: "BOUNCED", label: "Bounced", color: "#ef4444" },
      { value: "INTERESTED", label: "Interested", color: "#22c55e" },
      { value: "NOT_INTERESTED", label: "Not Interested", color: "#f43f5e" },
      { value: "MEETING_BOOKED", label: "Meeting Booked", color: "#10b981" },
    ],
  },
  LINKEDIN: {
    label: "LinkedIn",
    icon: "linkedin",
    brandColor: {
      bg: "bg-blue-600/10 hover:bg-blue-600/15 border-blue-600/20 data-[active=true]:border-blue-600 data-[active=true]:bg-blue-600/20 data-[active=true]:text-blue-600",
      iconColor: "text-blue-600",
      glow: "shadow-[0_0_15px_-3px_rgba(37,99,235,0.25)]",
    },
    actions: [
      { value: "CONNECTION_REQUEST", label: "Connection Request" },
      { value: "MESSAGE", label: "Message" },
      { value: "FOLLOW_UP", label: "Follow Up" },
    ],
    statuses: [
      { value: "PENDING", label: "Pending", color: "#f59e0b" },
      { value: "ACCEPTED", label: "Accepted", color: "#10b981" },
      { value: "IGNORED", label: "Ignored", color: "#6b7280" },
      { value: "REPLIED", label: "Replied", color: "#ec4899" },
      { value: "INTERESTED", label: "Interested", color: "#22c55e" },
    ],
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: "instagram",
    brandColor: {
      bg: "bg-pink-500/10 hover:bg-pink-500/15 border-pink-500/20 data-[active=true]:border-pink-500 data-[active=true]:bg-pink-500/20 data-[active=true]:text-pink-500",
      iconColor: "text-pink-500",
      glow: "shadow-[0_0_15px_-3px_rgba(236,72,153,0.25)]",
    },
    actions: [
      { value: "DIRECT_MESSAGE", label: "Direct Message" },
      { value: "FOLLOW_UP", label: "Follow Up" },
    ],
    statuses: [
      { value: "SENT", label: "Sent", color: "#10b981" },
      { value: "SEEN", label: "Seen", color: "#6366f1" },
      { value: "REPLIED", label: "Replied", color: "#ec4899" },
      { value: "INTERESTED", label: "Interested", color: "#22c55e" },
    ],
  },
  WHATSAPP: {
    label: "WhatsApp",
    icon: "message-circle",
    brandColor: {
      bg: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-500",
      iconColor: "text-emerald-500",
      glow: "shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]",
    },
    actions: [
      { value: "MESSAGE", label: "Message" },
      { value: "FOLLOW_UP", label: "Follow Up" },
      { value: "PROPOSAL", label: "Proposal" },
    ],
    statuses: [
      { value: "SENT", label: "Sent", color: "#10b981" },
      { value: "DELIVERED", label: "Delivered", color: "#059669" },
      { value: "READ", label: "Read", color: "#3b82f6" },
      { value: "REPLIED", label: "Replied", color: "#ec4899" },
      { value: "INTERESTED", label: "Interested", color: "#22c55e" },
    ],
  },
  PHONE: {
    label: "Phone",
    icon: "phone",
    brandColor: {
      bg: "bg-cyan-500/10 hover:bg-cyan-500/15 border-cyan-500/20 data-[active=true]:border-cyan-500 data-[active=true]:bg-cyan-500/20 data-[active=true]:text-cyan-500",
      iconColor: "text-cyan-500",
      glow: "shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]",
    },
    actions: [
      { value: "CALL", label: "Call" },
      { value: "FOLLOW_UP", label: "Follow Up" },
      { value: "VOICEMAIL", label: "Voicemail" },
    ],
    statuses: [
      { value: "SCHEDULED", label: "Scheduled", color: "#f59e0b" },
      { value: "COMPLETED", label: "Completed", color: "#10b981" },
      { value: "MISSED", label: "Missed", color: "#ef4444" },
      { value: "VOICEMAIL_LEFT", label: "Voicemail Left", color: "#6b7280" },
      { value: "INTERESTED", label: "Interested", color: "#22c55e" },
    ],
  },
  MEETING: {
    label: "Meeting",
    icon: "calendar",
    brandColor: {
      bg: "bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20 data-[active=true]:border-indigo-500 data-[active=true]:bg-indigo-500/20 data-[active=true]:text-indigo-500",
      iconColor: "text-indigo-500",
      glow: "shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]",
    },
    actions: [
      { value: "DISCOVERY_CALL", label: "Discovery Call" },
      { value: "DEMO", label: "Demo" },
      { value: "CONSULTATION", label: "Consultation" },
      { value: "CLOSING_CALL", label: "Closing Call" },
    ],
    statuses: [
      { value: "SCHEDULED", label: "Scheduled", color: "#f59e0b" },
      { value: "COMPLETED", label: "Completed", color: "#10b981" },
      { value: "CANCELLED", label: "Cancelled", color: "#ef4444" },
      { value: "RESCHEDULED", label: "Rescheduled", color: "#3b82f6" },
    ],
  },
  OTHER: {
    label: "Other",
    icon: "more-horizontal",
    brandColor: {
      bg: "bg-slate-500/10 hover:bg-slate-500/15 border-slate-500/20 data-[active=true]:border-slate-500 data-[active=true]:bg-slate-500/20 data-[active=true]:text-slate-500",
      iconColor: "text-slate-500",
      glow: "shadow-[0_0_15px_-3px_rgba(107,114,128,0.25)]",
    },
    actions: [
      { value: "NOTE", label: "Note" },
      { value: "CUSTOM_INTERACTION", label: "Custom Interaction" },
    ],
    statuses: [
      { value: "COMPLETED", label: "Completed", color: "#10b981" },
    ],
  },
} as const;

export const PLATFORMS = [
  { value: "LINKEDIN", label: "LinkedIn", icon: "linkedin" },
  { value: "INSTAGRAM", label: "Instagram", icon: "instagram" },
  { value: "EMAIL", label: "Email", icon: "mail" },
  { value: "PHONE", label: "Phone", icon: "phone" },
  { value: "WHATSAPP", label: "WhatsApp", icon: "message-circle" },
  { value: "MEETING", label: "Meeting", icon: "calendar" },
  { value: "OTHER", label: "Other", icon: "more-horizontal" },
] as const;

export const MESSAGE_TYPES = [
  { value: "CONNECTION_REQUEST", label: "Connection Request" },
  { value: "DIRECT_MESSAGE", label: "Direct Message" },
  { value: "COLD_EMAIL", label: "Cold Email" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "OTHER", label: "Other" },
  { value: "GENERAL_EMAIL", label: "General Email" },
  { value: "VOICEMAIL", label: "Voicemail" },
  { value: "DISCOVERY_CALL", label: "Discovery Call" },
  { value: "DEMO", label: "Demo" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "CLOSING_CALL", label: "Closing Call" },
  { value: "NOTE", label: "Note" },
  { value: "CUSTOM_INTERACTION", label: "Custom Interaction" },
  { value: "MESSAGE", label: "Message" },
] as const;

export const MESSAGE_STATUSES = [
  { value: "SENT", label: "Sent", color: "#10b981" },
  { value: "DELIVERED", label: "Delivered", color: "#059669" },
  { value: "OPENED", label: "Opened", color: "#6366f1" },
  { value: "REPLIED", label: "Replied", color: "#ec4899" },
  { value: "NO_REPLY", label: "No Reply", color: "#f87171" },
  { value: "BOUNCED", label: "Bounced", color: "#ef4444" },
  { value: "DRAFT", label: "Draft", color: "#6b7280" },
  { value: "QUEUED", label: "Queued", color: "#3b82f6" },
  { value: "CLICKED", label: "Clicked", color: "#8b5cf6" },
  { value: "INTERESTED", label: "Interested", color: "#22c55e" },
  { value: "NOT_INTERESTED", label: "Not Interested", color: "#f43f5e" },
  { value: "MEETING_BOOKED", label: "Meeting Booked", color: "#10b981" },
  { value: "PENDING", label: "Pending", color: "#f59e0b" },
  { value: "ACCEPTED", label: "Accepted", color: "#10b981" },
  { value: "IGNORED", label: "Ignored", color: "#6b7280" },
  { value: "SEEN", label: "Seen", color: "#6366f1" },
  { value: "READ", label: "Read", color: "#3b82f6" },
  { value: "SCHEDULED", label: "Scheduled", color: "#f59e0b" },
  { value: "COMPLETED", label: "Completed", color: "#10b981" },
  { value: "CANCELLED", label: "Cancelled", color: "#ef4444" },
  { value: "RESCHEDULED", label: "Rescheduled", color: "#3b82f6" },
  { value: "VOICEMAIL_LEFT", label: "Voicemail Left", color: "#6b7280" },
] as const;

// ─── Priorities ─────────────────────────────────────────

export const PRIORITIES = [
  { value: "LOW", label: "Low", color: "#8a9b92" },
  { value: "MEDIUM", label: "Medium", color: "#5b9e8a" },
  { value: "HIGH", label: "High", color: "#e8a87c" },
  { value: "URGENT", label: "Urgent", color: "#f87171" },
] as const;

// ─── Countries ──────────────────────────────────────────

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "UAE",
  "Singapore",
  "Other",
] as const;

// ─── Needs Editing ──────────────────────────────────────

export const NEEDS_EDITING_OPTIONS = [
  { value: "YES", label: "Yes", color: "#4ade80" },
  { value: "MAYBE", label: "Maybe", color: "#e8a87c" },
  { value: "NO", label: "No", color: "#f87171" },
] as const;

// ─── Keyboard Shortcuts ─────────────────────────────────

export const KEYBOARD_SHORTCUTS = {
  COMMAND_PALETTE: { key: "k", meta: true, label: "⌘K" },
  NEW_LEAD: { key: "n", label: "N" },
  SEARCH: { key: "/", meta: true, label: "⌘/" },
  ESCAPE: { key: "Escape", label: "Esc" },
  DASHBOARD: { key: "1", meta: true, label: "⌘1" },
  LEADS: { key: "2", meta: true, label: "⌘2" },
  CLIENTS: { key: "3", meta: true, label: "⌘3" },
  TASKS: { key: "4", meta: true, label: "⌘4" },
} as const;

// ─── Navigation ─────────────────────────────────────────

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard", shortcut: "⌘1" },
  { href: "/leads", label: "Leads", icon: "users", shortcut: "⌘2" },
  { href: "/clients", label: "Clients", icon: "building-2", shortcut: "⌘3" },
  { href: "/tasks", label: "Tasks", icon: "check-square", shortcut: "⌘4" },
  { href: "/follow-ups", label: "Follow-ups", icon: "clock", shortcut: "" },
  { href: "/analytics", label: "Analytics", icon: "bar-chart-3", shortcut: "" },
  { href: "/settings", label: "Settings", icon: "settings", shortcut: "" },
] as const;

// ─── Lead Scoring Weights ───────────────────────────────

export const LEAD_SCORING = {
  VIDEO_QUALITY_WEIGHT: 2,
  BRANDING_WEIGHT: 1.5,
  BUDGET_WEIGHT: 3,
  NEEDS_EDITING_YES: 25,
  NEEDS_EDITING_MAYBE: 10,
  NEEDS_EDITING_NO: 0,
  FOLLOWER_TIERS: [
    { min: 0, max: 1000, score: 5 },
    { min: 1001, max: 10000, score: 10 },
    { min: 10001, max: 50000, score: 15 },
    { min: 50001, max: 100000, score: 20 },
    { min: 100001, max: Infinity, score: 25 },
  ],
} as const;
