import { relations } from "drizzle-orm";
import {
  leads,
  leadNotes,
  leadAttachments,
  outreachActivities,
  tasks,
  clients,
  projects,
  invoices,
  activityLog,
} from "./schema.js";

export const leadsRelations = relations(leads, ({ many, one }) => ({
  notes: many(leadNotes),
  attachments: many(leadAttachments),
  outreachActivities: many(outreachActivities),
  tasks: many(tasks),
  client: one(clients, {
    fields: [leads.id],
    references: [clients.leadId],
  }),
  activities: many(activityLog),
}));

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  lead: one(leads, {
    fields: [leadNotes.leadId],
    references: [leads.id],
  }),
}));

export const leadAttachmentsRelations = relations(leadAttachments, ({ one }) => ({
  lead: one(leads, {
    fields: [leadAttachments.leadId],
    references: [leads.id],
  }),
}));

export const outreachActivitiesRelations = relations(outreachActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [outreachActivities.leadId],
    references: [leads.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  lead: one(leads, {
    fields: [tasks.leadId],
    references: [leads.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  lead: one(leads, {
    fields: [clients.leadId],
    references: [leads.id],
  }),
  projects: many(projects),
  invoices: many(invoices),
  activities: many(activityLog),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  lead: one(leads, {
    fields: [activityLog.leadId],
    references: [leads.id],
  }),
  client: one(clients, {
    fields: [activityLog.clientId],
    references: [clients.id],
  }),
}));
