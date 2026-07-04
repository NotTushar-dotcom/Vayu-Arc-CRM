import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { clients, leads, projects, invoices } from "../../db/schema.js";
import { eq, desc, count } from "drizzle-orm";

const listInput = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(50),
});

export const clientManager = createRouter({
  list: publicQuery
    .input(listInput)
    .query(async ({ input }) => {
      const db = getDb();

      const allClients = await db
        .select({
          id: clients.id,
          leadId: clients.leadId,
          monthlyRetainer: clients.monthlyRetainer,
          contractStart: clients.contractStart,
          contractEnd: clients.contractEnd,
          totalRevenue: clients.totalRevenue,
          activeProjects: clients.activeProjects,
          status: clients.status,
          createdAt: clients.createdAt,
          fullName: leads.fullName,
          company: leads.company,
          email: leads.email,
          phone: leads.phone,
          country: leads.country,
          city: leads.city,
          industry: leads.industry,
        })
        .from(clients)
        .leftJoin(leads, eq(clients.leadId, leads.id))
        .orderBy(desc(clients.createdAt));

      let filtered = allClients;
      if (input.status) {
        filtered = filtered.filter((c) => c.status === input.status);
      }
      if (input.search) {
        const s = input.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.fullName?.toLowerCase().includes(s) ||
            c.company?.toLowerCase().includes(s) ||
            c.email?.toLowerCase().includes(s)
        );
      }

      const total = filtered.length;
      const pageSize = input.pageSize;
      const page = input.page;
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      return { items: paginated, total, page, pageSize };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [client] = await db.select().from(clients).where(eq(clients.id, input.id));
      if (!client) throw new Error("Client not found");

      const [lead] = await db.select().from(leads).where(eq(leads.id, client.leadId));
      const clientProjects = await db.select().from(projects).where(eq(projects.clientId, input.id)).orderBy(desc(projects.createdAt));
      const clientInvoices = await db.select().from(invoices).where(eq(invoices.clientId, input.id)).orderBy(desc(invoices.createdAt));

      return { ...client, lead, projects: clientProjects, invoices: clientInvoices };
    }),

  create: publicQuery
    .input(
      z.object({
        leadId: z.number(),
        monthlyRetainer: z.string().optional(),
        contractStart: z.string().optional(),
        contractEnd: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [client] = await db.insert(clients).values({
        leadId: input.leadId,
        monthlyRetainer: input.monthlyRetainer,
        contractStart: input.contractStart ? new Date(input.contractStart) : undefined,
        contractEnd: input.contractEnd ? new Date(input.contractEnd) : undefined,
      });

      await db.update(leads)
        .set({ isClient: "Yes", pipelineStage: "Client Won", clientSince: new Date() })
        .where(eq(leads.id, input.leadId));

      return { id: Number(client.insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          monthlyRetainer: z.string().optional(),
          contractStart: z.string().optional(),
          contractEnd: z.string().optional(),
          status: z.enum(["active", "paused", "churned"]).optional(),
          totalRevenue: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          if ((key === "contractStart" || key === "contractEnd") && value) {
            updateData[key] = new Date(value as string);
          } else {
            updateData[key] = value;
          }
        }
      }

      await db.update(clients).set(updateData).where(eq(clients.id, id));
      return { success: true };
    }),

  addProject: publicQuery
    .input(
      z.object({
        clientId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["planning", "in_progress", "review", "completed", "cancelled"]).default("planning"),
        startDate: z.string().optional(),
        dueDate: z.string().optional(),
        budget: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [project] = await db.insert(projects).values({
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });
      return { id: Number(project.insertId), ...input };
    }),

  addInvoice: publicQuery
    .input(
      z.object({
        clientId: z.number(),
        projectId: z.number().optional(),
        invoiceNumber: z.string(),
        amount: z.string(),
        dueDate: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [invoice] = await db.insert(invoices).values({
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        status: "draft",
      });
      return { id: Number(invoice.insertId), ...input };
    }),

  updateInvoiceStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === "paid") {
        updateData.paidDate = new Date();
      }
      await db.update(invoices).set(updateData).where(eq(invoices.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [total] = await db.select({ count: count() }).from(clients);
    const [active] = await db.select({ count: count() }).from(clients).where(eq(clients.status, "active"));
    const [paused] = await db.select({ count: count() }).from(clients).where(eq(clients.status, "paused"));
    const [churned] = await db.select({ count: count() }).from(clients).where(eq(clients.status, "churned"));

    const revenueResult = await db.select({ total: clients.totalRevenue }).from(clients);
    const totalRevenue = revenueResult.reduce((sum, r) => sum + Number(r.total ?? 0), 0);

    const [activeProjects] = await db.select({ count: count() }).from(projects)
      .where(eq(projects.status, "in_progress"));

    return {
      total: total.count,
      active: active.count,
      paused: paused.count,
      churned: churned.count,
      totalRevenue,
      activeProjects: activeProjects.count,
    };
  }),
});
