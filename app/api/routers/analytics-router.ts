import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leads, outreachActivities, tasks, clients, invoices } from "@db/schema";
import { count, eq, and, gte, lte, sql } from "drizzle-orm";

export const analyticsRouter = createRouter({
  monthlyPerformance: publicQuery.query(async () => {
    const db = getDb();
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [leadsAdded] = await db.select({ count: count() }).from(leads)
        .where(and(gte(leads.createdAt, date), lte(leads.createdAt, endDate)));

      const [outreachSent] = await db.select({ count: count() }).from(outreachActivities)
        .where(and(gte(outreachActivities.createdAt, date), lte(outreachActivities.createdAt, endDate)));

      const [replies] = await db.select({ count: count() }).from(outreachActivities)
        .where(
          and(
            gte(outreachActivities.createdAt, date),
            lte(outreachActivities.createdAt, endDate),
            eq(outreachActivities.status, "Replied")
          )
        );

      const [clientsWon] = await db.select({ count: count() }).from(leads)
        .where(
          and(
            gte(leads.clientSince, date),
            lte(leads.clientSince, endDate),
            eq(leads.pipelineStage, "Client Won")
          )
        );

      months.push({
        month: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
        leadsAdded: leadsAdded.count,
        outreachSent: outreachSent.count,
        replies: replies.count,
        clientsWon: clientsWon.count,
      });
    }

    return months;
  }),

  leadSourceBreakdown: publicQuery.query(async () => {
    const db = getDb();
    const sourceValues = ["LinkedIn", "Instagram", "Referral", "Website", "Google", "Cold Email", "Other"] as const;
    const result = [];

    for (const source of sourceValues) {
      const [countResult] = await db.select({ count: count() }).from(leads).where(eq(leads.leadSource, source));
      result.push({ source, count: countResult.count });
    }

    return result;
  }),

  outreachPerformance: publicQuery.query(async () => {
    const db = getDb();
    const platformValues = ["LinkedIn", "Instagram", "Email", "Phone", "WhatsApp"] as const;
    const result = [];

    for (const platform of platformValues) {
      const [total] = await db.select({ count: count() }).from(outreachActivities).where(eq(outreachActivities.platform, platform));
      const [replied] = await db.select({ count: count() }).from(outreachActivities)
        .where(and(eq(outreachActivities.platform, platform), eq(outreachActivities.status, "Replied")));

      result.push({
        platform,
        total: total.count,
        replied: replied.count,
        rate: total.count > 0 ? Math.round((replied.count / total.count) * 100) : 0,
      });
    }

    return result;
  }),

  pipelineFunnel: publicQuery.query(async () => {
    const db = getDb();
    const stages = [
      { name: "Lead Found", stage: "Lead Found" },
      { name: "Request Sent", stage: "LinkedIn Request Sent" },
      { name: "Connected", stage: "Connected" },
      { name: "Researched", stage: "Website Researched" },
      { name: "Contacted", stage: "Cold Email Sent" },
      { name: "Discovery", stage: "Discovery Call" },
      { name: "Proposal", stage: "Proposal Sent" },
      { name: "Won", stage: "Client Won" },
    ] as const;

    const result = [];
    for (const { name, stage } of stages) {
      const [countResult] = await db.select({ count: count() }).from(leads).where(eq(leads.pipelineStage, stage));
      result.push({ name, count: countResult.count });
    }

    return result;
  }),

  priorityDistribution: publicQuery.query(async () => {
    const db = getDb();
    const [high] = await db.select({ count: count() }).from(leads).where(gte(leads.priorityScore, 80));
    const [medium] = await db.select({ count: count() }).from(leads)
      .where(and(gte(leads.priorityScore, 50), lte(leads.priorityScore, 79)));
    const [low] = await db.select({ count: count() }).from(leads).where(lte(leads.priorityScore, 49));

    return [
      { priority: "High (80-100)", count: high.count },
      { priority: "Medium (50-79)", count: medium.count },
      { priority: "Low (0-49)", count: low.count },
    ];
  }),

  revenueOverview: publicQuery.query(async () => {
    const db = getDb();

    const invoicesResult = await db
      .select({
        status: invoices.status,
        total: sql<string>`COALESCE(SUM(${invoices.amount}), 0)`,
      })
      .from(invoices)
      .groupBy(invoices.status);

    const paid = invoicesResult.find((r) => r.status === "paid")?.total ?? "0";
    const pending = invoicesResult.find((r) => r.status === "sent")?.total ?? "0";
    const overdue = invoicesResult.find((r) => r.status === "overdue")?.total ?? "0";

    return {
      paid: Number(paid),
      pending: Number(pending),
      overdue: Number(overdue),
    };
  }),

  kpiSummary: publicQuery.query(async () => {
    const db = getDb();

    const [totalLeads] = await db.select({ count: count() }).from(leads).where(eq(leads.status, "active"));
    const [totalClients] = await db.select({ count: count() }).from(clients).where(eq(clients.status, "active"));
    const [totalOutreach] = await db.select({ count: count() }).from(outreachActivities);
    const [pendingTasks] = await db.select({ count: count() }).from(tasks).where(eq(tasks.completed, "No"));

    const winRate = totalLeads.count > 0
      ? Math.round((totalClients.count / totalLeads.count) * 100)
      : 0;

    return {
      totalLeads: totalLeads.count,
      totalClients: totalClients.count,
      totalOutreach: totalOutreach.count,
      pendingTasks: pendingTasks.count,
      winRate,
    };
  }),
});
