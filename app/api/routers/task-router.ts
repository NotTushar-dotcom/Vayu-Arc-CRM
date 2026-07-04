import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { tasks, leads } from "@db/schema";
import { eq, and, desc, count, gte, lte } from "drizzle-orm";

const listInput = z.object({
  completed: z.enum(["Yes", "No"]).optional(),
  priority: z.string().optional(),
  leadId: z.number().optional(),
  dueToday: z.boolean().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(50),
});

export const taskRouter = createRouter({
  list: publicQuery
    .input(listInput)
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.completed) conditions.push(eq(tasks.completed, input.completed));
      if (input.priority) conditions.push(eq(tasks.priority, input.priority as "low" | "medium" | "high" | "urgent"));
      if (input.leadId) conditions.push(eq(tasks.leadId, input.leadId));
      if (input.dueToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        conditions.push(and(gte(tasks.dueDate, today), lte(tasks.dueDate, tomorrow)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          leadId: tasks.leadId,
          dueDate: tasks.dueDate,
          priority: tasks.priority,
          completed: tasks.completed,
          reminder: tasks.reminder,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          leadName: leads.fullName,
          leadCompany: leads.company,
        })
        .from(tasks)
        .leftJoin(leads, eq(tasks.leadId, leads.id))
        .where(whereClause)
        .orderBy(desc(tasks.createdAt))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      const [totalResult] = await db.select({ count: count() }).from(tasks).where(whereClause);

      return {
        items,
        total: totalResult?.count ?? 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [task] = await db.select().from(tasks).where(eq(tasks.id, input.id));
      return task ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        leadId: z.number().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        reminder: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [task] = await db.insert(tasks).values({
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        reminder: input.reminder ? new Date(input.reminder) : undefined,
      });
      return { id: Number(task.insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          leadId: z.number().optional(),
          dueDate: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          completed: z.enum(["Yes", "No"]).optional(),
          reminder: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          if ((key === "dueDate" || key === "reminder") && value) {
            updateData[key] = new Date(value as string);
          } else {
            updateData[key] = value;
          }
        }
      }

      await db.update(tasks).set(updateData).where(eq(tasks.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),

  toggleComplete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [task] = await db.select().from(tasks).where(eq(tasks.id, input.id));
      if (!task) throw new Error("Task not found");

      const newCompleted = task.completed === "Yes" ? "No" : "Yes";
      await db.update(tasks).set({ completed: newCompleted }).where(eq(tasks.id, input.id));
      return { completed: newCompleted };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();

    const [total] = await db.select({ count: count() }).from(tasks);
    const [pending] = await db.select({ count: count() }).from(tasks).where(eq(tasks.completed, "No"));
    const [completed] = await db.select({ count: count() }).from(tasks).where(eq(tasks.completed, "Yes"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [dueToday] = await db.select({ count: count() }).from(tasks)
      .where(and(eq(tasks.completed, "No"), gte(tasks.dueDate, today), lte(tasks.dueDate, tomorrow)));

    const [overdue] = await db.select({ count: count() }).from(tasks)
      .where(and(eq(tasks.completed, "No"), lte(tasks.dueDate, today)));

    return { total: total.count, pending: pending.count, completed: completed.count, dueToday: dueToday.count, overdue: overdue.count };
  }),
});
