import { z } from "zod";

// ─── Lead Schemas ───────────────────────────────────────

export const leadCreateSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  company: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  country: z.string().max(50).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  timeZone: z.string().max(50).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  linkedin: z.string().max(200).optional().nullable(),
  instagram: z.string().max(100).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  twitter: z.string().max(200).optional().nullable(),
  youtube: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  services: z.string().max(500).optional().nullable(),
  followers: z.coerce.number().int().min(0).optional().nullable(),
  postingFrequency: z.string().max(50).optional().nullable(),
  videoQuality: z.coerce.number().int().min(0).max(10).optional().nullable(),
  brandingRating: z.coerce.number().int().min(0).max(10).optional().nullable(),
  needsEditing: z.enum(["YES", "MAYBE", "NO"]).optional().default("MAYBE"),
  estimatedBudget: z.coerce.number().min(0).optional().nullable(),
  source: z.enum([
    "LINKEDIN", "INSTAGRAM", "REFERRAL", "WEBSITE", "GOOGLE", "COLD_EMAIL", "OTHER"
  ]).optional().default("OTHER"),
  pipelineStage: z.enum([
    "LEAD_FOUND", "LINKEDIN_REQUEST_SENT", "CONNECTED", "WEBSITE_RESEARCHED",
    "SOCIALS_FOUND", "EMAIL_FOUND", "COLD_EMAIL_SENT", "INSTAGRAM_DM_SENT",
    "WAITING", "FOLLOW_UP_1", "FOLLOW_UP_2", "DISCOVERY_CALL",
    "PROPOSAL_SENT", "CLIENT_WON", "CLIENT_LOST"
  ]).optional().default("LEAD_FOUND"),
  nextFollowUp: z.string().optional().nullable(),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export type LeadCreateInput = z.input<typeof leadCreateSchema>;
export type LeadUpdateInput = z.input<typeof leadUpdateSchema>;

// ─── Quick Add Lead ─────────────────────────────────────

export const quickAddLeadSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().optional(),
  source: z.enum([
    "LINKEDIN", "INSTAGRAM", "REFERRAL", "WEBSITE", "GOOGLE", "COLD_EMAIL", "OTHER"
  ]).optional().default("OTHER"),
  pipelineStage: z.enum([
    "LEAD_FOUND", "LINKEDIN_REQUEST_SENT", "CONNECTED", "WEBSITE_RESEARCHED",
    "SOCIALS_FOUND", "EMAIL_FOUND", "COLD_EMAIL_SENT", "INSTAGRAM_DM_SENT",
    "WAITING", "FOLLOW_UP_1", "FOLLOW_UP_2", "DISCOVERY_CALL",
    "PROPOSAL_SENT", "CLIENT_WON", "CLIENT_LOST"
  ]).optional().default("LEAD_FOUND"),
});

export type QuickAddLeadInput = z.input<typeof quickAddLeadSchema>;

// ─── Outreach Schema ────────────────────────────────────

export const outreachCreateSchema = z.object({
  leadId: z.string().min(1),
  platform: z.enum(["LINKEDIN", "INSTAGRAM", "EMAIL", "PHONE", "WHATSAPP", "MEETING", "OTHER"]),
  messageType: z.enum([
    "CONNECTION_REQUEST", "DIRECT_MESSAGE", "COLD_EMAIL", "FOLLOW_UP", "CALL", 
    "MEETING", "PROPOSAL", "OTHER", "GENERAL_EMAIL", "VOICEMAIL", 
    "DISCOVERY_CALL", "DEMO", "CONSULTATION", "CLOSING_CALL", "NOTE", 
    "CUSTOM_INTERACTION", "MESSAGE"
  ]),
  status: z.enum([
    "SENT", "DELIVERED", "OPENED", "REPLIED", "NO_REPLY", "BOUNCED", 
    "DRAFT", "QUEUED", "CLICKED", "INTERESTED", "NOT_INTERESTED", 
    "MEETING_BOOKED", "PENDING", "ACCEPTED", "IGNORED", "SEEN", "READ", 
    "SCHEDULED", "COMPLETED", "MISSED", "VOICEMAIL_LEFT", "CANCELLED", "RESCHEDULED"
  ]).optional().default("SENT"),
  message: z.string().optional().nullable(),
  reply: z.string().optional().nullable(),
  followUpRequired: z.boolean().optional().default(false),
  date: z.string().optional(),
});

export type OutreachCreateInput = z.infer<typeof outreachCreateSchema>;

// ─── Task Schema ────────────────────────────────────────

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  reminder: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  completed: z.boolean().optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

// ─── Note Schema ────────────────────────────────────────

export const noteCreateSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  leadId: z.string().min(1),
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;

// ─── Settings Schema ────────────────────────────────────

export const settingsUpdateSchema = z.object({
  agencyName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

// ─── Search Schema ──────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
});

// ─── Filter Schema ──────────────────────────────────────

export const leadFilterSchema = z.object({
  country: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  pipelineStage: z.string().optional(),
  priority: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  needsEditing: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type LeadFilterInput = z.infer<typeof leadFilterSchema>;
