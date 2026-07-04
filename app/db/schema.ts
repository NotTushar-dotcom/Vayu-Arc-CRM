import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users (Auth) ───────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id"),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Leads ──────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: serial("id"),

  // Personal Info
  fullName: varchar("full_name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  timeZone: varchar("time_zone", { length: 100 }),

  // Contact
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  website: text("website"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  x: text("x"),
  youtube: text("youtube"),

  // Research
  industry: varchar("industry", { length: 100 }),
  services: text("services"),
  followers: varchar("followers", { length: 50 }),
  postingFrequency: varchar("posting_frequency", { length: 50 }),
  videoQualityRating: int("video_quality_rating").default(0),
  brandingRating: int("branding_rating").default(0),
  needsVideoEditing: mysqlEnum("needs_video_editing", ["Yes", "Maybe", "No"]).default("Maybe"),
  estimatedBudget: varchar("estimated_budget", { length: 50 }),
  priorityScore: int("priority_score").default(50),

  // Lead Source
  leadSource: mysqlEnum("lead_source", [
    "LinkedIn",
    "Instagram",
    "Referral",
    "Website",
    "Google",
    "Cold Email",
    "Other",
  ]).default("Other"),

  // Pipeline
  pipelineStage: mysqlEnum("pipeline_stage", [
    "Lead Found",
    "LinkedIn Request Sent",
    "Connected",
    "Website Researched",
    "Socials Found",
    "Email Found",
    "Cold Email Sent",
    "Instagram DM Sent",
    "Waiting",
    "Follow-up 1",
    "Follow-up 2",
    "Discovery Call",
    "Proposal Sent",
    "Client Won",
    "Client Lost",
  ]).default("Lead Found"),

  // Dates
  addedDate: timestamp("added_date").defaultNow().notNull(),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUp: timestamp("next_follow_up"),
  clientSince: timestamp("client_since"),

  // Status
  isClient: mysqlEnum("is_client", ["Yes", "No"]).default("No"),
  status: mysqlEnum("status", ["active", "archived", "lost"]).default("active"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Lead Notes ─────────────────────────────────────────────
export const leadNotes = mysqlTable("lead_notes", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = typeof leadNotes.$inferInsert;

// ─── Lead Attachments ───────────────────────────────────────
export const leadAttachments = mysqlTable("lead_attachments", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: varchar("file_size", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LeadAttachment = typeof leadAttachments.$inferSelect;
export type InsertLeadAttachment = typeof leadAttachments.$inferInsert;

// ─── Outreach Activities ────────────────────────────────────
export const outreachActivities = mysqlTable("outreach_activities", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  platform: mysqlEnum("platform", [
    "LinkedIn",
    "Instagram",
    "Email",
    "Phone",
    "WhatsApp",
  ]).notNull(),
  messageType: varchar("message_type", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["Sent", "Delivered", "Read", "Replied", "No Reply", "Failed"]).default("Sent"),
  message: text("message"),
  reply: text("reply"),
  followUpRequired: mysqlEnum("follow_up_required", ["Yes", "No"]).default("No"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OutreachActivity = typeof outreachActivities.$inferSelect;
export type InsertOutreachActivity = typeof outreachActivities.$inferInsert;

// ─── Tasks ──────────────────────────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: serial("id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }),
  dueDate: timestamp("due_date"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  completed: mysqlEnum("completed", ["Yes", "No"]).default("No"),
  reminder: timestamp("reminder"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── Clients ────────────────────────────────────────────────
export const clients = mysqlTable("clients", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }).notNull(),
  monthlyRetainer: decimal("monthly_retainer", { precision: 10, scale: 2 }),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  contractUrl: text("contract_url"),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  activeProjects: int("active_projects").default(0),
  status: mysqlEnum("status", ["active", "paused", "churned"]).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── Projects ───────────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: serial("id"),
  clientId: bigint("client_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["planning", "in_progress", "review", "completed", "cancelled"]).default("planning"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Invoices ───────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: serial("id"),
  clientId: bigint("client_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  issuedDate: timestamp("issued_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ─── Agency Settings ────────────────────────────────────────
export const agencySettings = mysqlTable("agency_settings", {
  id: serial("id"),
  agencyName: varchar("agency_name", { length: 255 }).default("Vayu Arc"),
  email: varchar("email", { length: 320 }),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#A8B98B"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#6F9270"),
  accentColor: varchar("accent_color", { length: 7 }).default("#2C5C4B"),
  darkColor: varchar("dark_color", { length: 7 }).default("#25343D"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type AgencySetting = typeof agencySettings.$inferSelect;
export type InsertAgencySetting = typeof agencySettings.$inferInsert;

// ─── Activity Log ───────────────────────────────────────────
export const activityLog = mysqlTable("activity_log", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 255 }).notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
