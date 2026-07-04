import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { leads, leadNotes, leadAttachments, outreachActivities, activityLog } from "../../db/schema.js";
import { eq, like, and, or, desc, gte, lte, count } from "drizzle-orm";

const listInput = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  leadSource: z.string().optional(),
  pipelineStage: z.string().optional(),
  priority: z.string().optional(),
  needsVideoEditing: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(50),
  sortBy: z.string().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const leadRouter = createRouter({
  list: publicQuery
    .input(listInput)
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.search) {
        conditions.push(
          or(
            like(leads.fullName, `%${input.search}%`),
            like(leads.company, `%${input.search}%`),
            like(leads.email, `%${input.search}%`),
            like(leads.country, `%${input.search}%`)
          )
        );
      }
      if (input.country) conditions.push(eq(leads.country, input.country));
      if (input.industry) conditions.push(eq(leads.industry, input.industry));
      if (input.leadSource) conditions.push(eq(leads.leadSource, input.leadSource as "LinkedIn" | "Instagram" | "Referral" | "Website" | "Google" | "Cold Email" | "Other"));
      if (input.pipelineStage) conditions.push(eq(leads.pipelineStage, input.pipelineStage as "Lead Found" | "LinkedIn Request Sent" | "Connected" | "Website Researched" | "Socials Found" | "Email Found" | "Cold Email Sent" | "Instagram DM Sent" | "Waiting" | "Follow-up 1" | "Follow-up 2" | "Discovery Call" | "Proposal Sent" | "Client Won" | "Client Lost"));
      if (input.needsVideoEditing) conditions.push(eq(leads.needsVideoEditing, input.needsVideoEditing as "Yes" | "Maybe" | "No"));
      if (input.priority) {
        const score = parseInt(input.priority);
        if (score >= 80) conditions.push(gte(leads.priorityScore, 80));
        else if (score >= 50) conditions.push(and(gte(leads.priorityScore, 50), lte(leads.priorityScore, 79)));
        else conditions.push(lte(leads.priorityScore, 49));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.select().from(leads).where(whereClause).orderBy(desc(leads.createdAt)).limit(input.pageSize).offset((input.page - 1) * input.pageSize),
        db.select({ count: count() }).from(leads).where(whereClause),
      ]);

      return {
        items,
        total: totalResult[0]?.count ?? 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [lead] = await db.select().from(leads).where(eq(leads.id, input.id));
      if (!lead) throw new Error("Lead not found");

      const [notes, attachments, outreach] = await Promise.all([
        db.select().from(leadNotes).where(eq(leadNotes.leadId, input.id)).orderBy(desc(leadNotes.createdAt)),
        db.select().from(leadAttachments).where(eq(leadAttachments.leadId, input.id)).orderBy(desc(leadAttachments.createdAt)),
        db.select().from(outreachActivities).where(eq(outreachActivities.leadId, input.id)).orderBy(desc(outreachActivities.date)),
      ]);

      return { ...lead, notes, attachments, outreach };
    }),

  create: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        company: z.string().min(1),
        role: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        timeZone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        x: z.string().optional(),
        youtube: z.string().optional(),
        industry: z.string().optional(),
        services: z.string().optional(),
        followers: z.string().optional(),
        postingFrequency: z.string().optional(),
        videoQualityRating: z.number().min(0).max(10).optional(),
        brandingRating: z.number().min(0).max(10).optional(),
        needsVideoEditing: z.enum(["Yes", "Maybe", "No"]).optional(),
        estimatedBudget: z.string().optional(),
        priorityScore: z.number().min(0).max(100).optional(),
        leadSource: z.enum(["LinkedIn", "Instagram", "Referral", "Website", "Google", "Cold Email", "Other"]).optional(),
        pipelineStage: z.enum([
          "Lead Found", "LinkedIn Request Sent", "Connected", "Website Researched",
          "Socials Found", "Email Found", "Cold Email Sent", "Instagram DM Sent",
          "Waiting", "Follow-up 1", "Follow-up 2", "Discovery Call",
          "Proposal Sent", "Client Won", "Client Lost",
        ]).optional(),
        nextFollowUp: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { notes: noteContent, ...leadData } = input;

      const [lead] = await db.insert(leads).values({
        ...leadData,
        nextFollowUp: leadData.nextFollowUp ? new Date(leadData.nextFollowUp) : undefined,
      });

      if (noteContent && lead.insertId) {
        await db.insert(leadNotes).values({
          leadId: Number(lead.insertId),
          content: noteContent,
        });
      }

      if (lead.insertId) {
        await db.insert(activityLog).values({
          leadId: Number(lead.insertId),
          action: "Lead Created",
          description: `Lead ${input.fullName} from ${input.company} was added`,
        });
      }

      return { id: Number(lead.insertId), ...leadData };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          fullName: z.string().min(1).optional(),
          company: z.string().min(1).optional(),
          role: z.string().optional(),
          country: z.string().optional(),
          city: z.string().optional(),
          timeZone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          phone: z.string().optional(),
          website: z.string().optional(),
          linkedin: z.string().optional(),
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          x: z.string().optional(),
          youtube: z.string().optional(),
          industry: z.string().optional(),
          services: z.string().optional(),
          followers: z.string().optional(),
          postingFrequency: z.string().optional(),
          videoQualityRating: z.number().min(0).max(10).optional(),
          brandingRating: z.number().min(0).max(10).optional(),
          needsVideoEditing: z.enum(["Yes", "Maybe", "No"]).optional(),
          estimatedBudget: z.string().optional(),
          priorityScore: z.number().min(0).max(100).optional(),
          leadSource: z.enum(["LinkedIn", "Instagram", "Referral", "Website", "Google", "Cold Email", "Other"]).optional(),
          pipelineStage: z.enum([
            "Lead Found", "LinkedIn Request Sent", "Connected", "Website Researched",
            "Socials Found", "Email Found", "Cold Email Sent", "Instagram DM Sent",
            "Waiting", "Follow-up 1", "Follow-up 2", "Discovery Call",
            "Proposal Sent", "Client Won", "Client Lost",
          ]).optional(),
          lastContactDate: z.string().optional(),
          nextFollowUp: z.string().optional(),
          status: z.enum(["active", "archived", "lost"]).optional(),
          isClient: z.enum(["Yes", "No"]).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          if ((key === "lastContactDate" || key === "nextFollowUp") && value) {
            updateData[key] = new Date(value as string);
          } else {
            updateData[key] = value;
          }
        }
      }

      await db.update(leads).set(updateData).where(eq(leads.id, id));

      await db.insert(activityLog).values({
        leadId: id,
        action: "Lead Updated",
        description: `Lead information was updated`,
      });

      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(leads).where(eq(leads.id, input.id));
      return { success: true };
    }),

  addNote: publicQuery
    .input(z.object({ leadId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [note] = await db.insert(leadNotes).values(input);
      await db.insert(activityLog).values({
        leadId: input.leadId,
        action: "Note Added",
        description: "A new note was added to the lead",
      });
      return { id: Number(note.insertId), ...input };
    }),

  addAttachment: publicQuery
    .input(z.object({
      leadId: z.number(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.string().optional(),
      fileSize: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [att] = await db.insert(leadAttachments).values(input);
      return { id: Number(att.insertId), ...input };
    }),

  addOutreach: publicQuery
    .input(z.object({
      leadId: z.number(),
      platform: z.enum(["LinkedIn", "Instagram", "Email", "Phone", "WhatsApp"]),
      messageType: z.string(),
      status: z.enum(["Sent", "Delivered", "Read", "Replied", "No Reply", "Failed"]).optional(),
      message: z.string().optional(),
      followUpRequired: z.enum(["Yes", "No"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [activity] = await db.insert(outreachActivities).values(input);

      await db.update(leads)
        .set({ lastContactDate: new Date() })
        .where(eq(leads.id, input.leadId));

      await db.insert(activityLog).values({
        leadId: input.leadId,
        action: `Outreach via ${input.platform}`,
        description: `${input.messageType} sent via ${input.platform}`,
      });

      return { id: Number(activity.insertId), ...input };
    }),

  updateStage: publicQuery
    .input(z.object({
      id: z.number(),
      stage: z.enum([
        "Lead Found", "LinkedIn Request Sent", "Connected", "Website Researched",
        "Socials Found", "Email Found", "Cold Email Sent", "Instagram DM Sent",
        "Waiting", "Follow-up 1", "Follow-up 2", "Discovery Call",
        "Proposal Sent", "Client Won", "Client Lost",
      ]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(leads)
        .set({ pipelineStage: input.stage })
        .where(eq(leads.id, input.id));

      await db.insert(activityLog).values({
        leadId: input.id,
        action: "Stage Changed",
        description: `Pipeline stage updated to ${input.stage}`,
      });

      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();

    const [totalLeads] = await db.select({ count: count() }).from(leads).where(eq(leads.status, "active"));
    const [newLeads] = await db.select({ count: count() }).from(leads)
      .where(and(eq(leads.status, "active"), gte(leads.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))));
    const [emailsSent] = await db.select({ count: count() }).from(outreachActivities).where(eq(outreachActivities.platform, "Email"));
    const [linkedinSent] = await db.select({ count: count() }).from(outreachActivities).where(eq(outreachActivities.platform, "LinkedIn"));
    const [instagramSent] = await db.select({ count: count() }).from(outreachActivities).where(eq(outreachActivities.platform, "Instagram"));
    const [repliesReceived] = await db.select({ count: count() }).from(outreachActivities).where(eq(outreachActivities.status, "Replied"));
    const [discoveryCalls] = await db.select({ count: count() }).from(leads).where(eq(leads.pipelineStage, "Discovery Call"));
    const [clientsClosed] = await db.select({ count: count() }).from(leads).where(eq(leads.pipelineStage, "Client Won"));
    const [followUpsDue] = await db.select({ count: count() }).from(leads)
      .where(and(lte(leads.nextFollowUp, new Date()), eq(leads.status, "active")));

    const winRate = totalLeads.count > 0
      ? Math.round((clientsClosed.count / totalLeads.count) * 100)
      : 0;

    return {
      totalLeads: totalLeads.count,
      newLeads: newLeads.count,
      emailsSent: emailsSent.count,
      linkedinSent: linkedinSent.count,
      instagramSent: instagramSent.count,
      repliesReceived: repliesReceived.count,
      discoveryCalls: discoveryCalls.count,
      clientsClosed: clientsClosed.count,
      winRate,
      followUpsDue: followUpsDue.count,
    };
  }),

  pipelineDistribution: publicQuery.query(async () => {
    const db = getDb();
    const stageValues = [
      "Lead Found", "LinkedIn Request Sent", "Connected", "Website Researched",
      "Socials Found", "Email Found", "Cold Email Sent", "Instagram DM Sent",
      "Waiting", "Follow-up 1", "Follow-up 2", "Discovery Call",
      "Proposal Sent", "Client Won", "Client Lost",
    ] as const;

    const result = [];
    for (const stage of stageValues) {
      const [countResult] = await db.select({ count: count() }).from(leads).where(eq(leads.pipelineStage, stage));
      result.push({ stage, count: countResult.count });
    }
    return result;
  }),

  countryDistribution: publicQuery.query(async () => {
    const db = getDb();
    const results = await db
      .select({ country: leads.country, count: count() })
      .from(leads)
      .groupBy(leads.country)
      .orderBy(desc(count()));
    return results;
  }),

  recentActivity: publicQuery.query(async () => {
    const db = getDb();
    const activities = await db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(20);
    return activities;
  }),
});
