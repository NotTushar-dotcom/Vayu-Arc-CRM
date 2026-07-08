"use server";

import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { outreachCreateSchema, leadCreateSchema, leadUpdateSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: No active session");
  }
  return session.user.id;
}

async function logActivity(action: string, description: string, entityType: string, entityId?: string, leadId?: string) {
  try {
    const userId = await getUserId();
    await prisma.activityLog.create({
      data: {
        action,
        description,
        entityType,
        entityId,
        leadId,
        userId,
      }
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// ─── LEADS ──────────────────────────────────────────────────────────

export async function getLeads(filters?: {
  search?: string;
  stage?: string;
  source?: string;
  country?: string;
  needsEditing?: string;
}) {
  const userId = await getUserId();
  
  const where: Prisma.LeadWhereInput = {
    userId,
    archivedAt: null,
  };

  if (filters?.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.stage && filters.stage !== "ALL") {
    where.pipelineStage = filters.stage as Prisma.EnumPipelineStageFilter;
  }

  if (filters?.source) {
    where.source = filters.source as Prisma.EnumLeadSourceFilter;
  }

  if (filters?.country) {
    where.country = { contains: filters.country, mode: "insensitive" };
  }

  if (filters?.needsEditing) {
    where.needsEditing = filters.needsEditing as Prisma.EnumNeedsEditingFilter;
  }

  return await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeadById(id: string) {
  const userId = await getUserId();
  return await prisma.lead.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        orderBy: { dueDate: "asc" },
      },
      outreach: {
        orderBy: { date: "desc" },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createLead(data: unknown) {
  const userId = await getUserId();
  const validated = leadCreateSchema.parse(data);
  
  const newLead = await prisma.lead.create({
    data: {
      ...validated,
      userId,
      nextFollowUp: validated.nextFollowUp ? new Date(validated.nextFollowUp) : null,
      priorityScore: 50,
      videoQuality: validated.videoQuality ?? 0,
      brandingRating: validated.brandingRating ?? 0,
      followers: validated.followers ?? 0,
      estimatedBudget: validated.estimatedBudget ?? 0,
    },
  });

  await logActivity("LEAD_ADDED", `New Lead Added: ${newLead.fullName}`, "lead", newLead.id, newLead.id);

  revalidatePath("/leads");
  revalidatePath("/");
  return newLead;
}

export async function updateLead(id: string, data: unknown) {
  const userId = await getUserId();
  const validated = leadUpdateSchema.parse(data);
  
  const oldLead = await prisma.lead.findUnique({
    where: { id, userId },
    select: { pipelineStage: true, fullName: true },
  });

  const updateData: Record<string, unknown> = { ...validated };
  if (validated.nextFollowUp !== undefined) {
    updateData.nextFollowUp = validated.nextFollowUp ? new Date(validated.nextFollowUp) : null;
  }

  const updatedLead = await prisma.lead.update({
    where: { id, userId },
    data: updateData,
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        orderBy: { dueDate: "asc" },
      },
      outreach: {
        orderBy: { date: "desc" },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (oldLead) {
    if (validated.pipelineStage && oldLead.pipelineStage !== validated.pipelineStage) {
      await logActivity("STAGE_CHANGED", `Changed stage to ${validated.pipelineStage}`, "lead", id, id);
    } else {
      await logActivity("LEAD_UPDATED", `Updated lead details`, "lead", id, id);
    }
  }

  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/");
  return updatedLead;
}

export async function deleteLead(id: string) {
  const userId = await getUserId();
  
  // Soft delete by setting archivedAt
  await prisma.lead.update({
    where: { id, userId },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/leads");
  revalidatePath("/");
}

// ─── TASKS ──────────────────────────────────────────────────────────

export async function getTasks() {
  const userId = await getUserId();
  return await prisma.task.findMany({
    where: { userId },
    include: { lead: true },
    orderBy: [
      { completed: "asc" },
      { dueDate: "asc" },
    ],
  });
}

import { Priority } from "@prisma/client";

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | Date | null;
  leadId?: string | null;
}) {
  const userId = await getUserId();
  const newTask = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      leadId: data.leadId || null,
      userId,
    },
  });

  await logActivity("TASK_CREATED", `Task Created: ${newTask.title}`, "task", newTask.id, newTask.leadId || undefined);

  revalidatePath("/tasks");
  if (data.leadId) {
    revalidatePath(`/leads/${data.leadId}`);
  }
  return newTask;
}

export async function toggleTaskCompleted(id: string, completed: boolean) {
  const userId = await getUserId();
  const updatedTask = await prisma.task.update({
    where: { id, userId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  await logActivity(
    completed ? "TASK_COMPLETED" : "TASK_UNCOMPLETED",
    `Task "${updatedTask.title}" marked as ${completed ? "completed" : "pending"}`,
    "task",
    updatedTask.id,
    updatedTask.leadId || undefined
  );

  revalidatePath("/tasks");
  if (updatedTask.leadId) {
    revalidatePath(`/leads/${updatedTask.leadId}`);
  }
  return updatedTask;
}

// ─── NOTES ──────────────────────────────────────────────────────────

export async function addLeadNote(leadId: string, content: string) {
  const userId = await getUserId();
  const note = await prisma.note.create({
    data: {
      content,
      leadId,
      userId,
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return note;
}

// ─── OUTREACH ───────────────────────────────────────────────────────

export async function addOutreach(leadId: string, data: unknown) {
  const validated = outreachCreateSchema.parse({
    leadId,
    ...(data as Record<string, unknown>),
  });

  const outreach = await prisma.outreachHistory.create({
    data: {
      leadId: validated.leadId,
      platform: validated.platform as any,
      messageType: validated.messageType as any,
      status: (validated.status || "SENT") as any,
      message: validated.message || "",
      reply: validated.reply || "",
      followUpRequired: validated.followUpRequired || false,
      date: validated.date ? new Date(validated.date) : new Date(),
    },
  });

  const platformLabel = validated.platform.toLowerCase();
  await logActivity(
    `${validated.platform}_SENT`,
    `Outreach logged: ${validated.messageType.replace(/_/g, ' ')} via ${platformLabel}`,
    "outreach",
    outreach.id,
    leadId
  );

  // Update lead's last contact date
  const userId = await getUserId();
  await prisma.lead.update({
    where: { id: leadId, userId },
    data: { lastContactDate: new Date() },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  return outreach;
}

// ─── DASHBOARD STATS ────────────────────────────────────────────────

export async function getDashboardStats() {
  const userId = await getUserId();

  const totalLeads = await prisma.lead.count({
    where: { userId, archivedAt: null },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newLeads = await prisma.lead.count({
    where: { userId, archivedAt: null, addedDate: { gte: thirtyDaysAgo } },
  });

  const stagesCount = await prisma.lead.groupBy({
    by: ["pipelineStage"],
    where: { userId, archivedAt: null },
    _count: true,
  });

  // Convert pipelineStage counts to helper structure
  const stageStats: Record<string, number> = {};
  stagesCount.forEach((item) => {
    stageStats[item.pipelineStage] = item._count;
  });

  const contacted = await prisma.outreachHistory.groupBy({
    by: ["leadId"],
    where: { lead: { userId } },
  }).then((res) => res.length);

  const responses = await prisma.outreachHistory.count({
    where: { status: "REPLIED", lead: { userId } },
  });

  const won = stageStats["CLIENT_WON"] || 0;

  // Outreach platform breakdown
  const platformStats = await prisma.outreachHistory.groupBy({
    by: ["platform"],
    where: { lead: { userId } },
    _count: true,
  });

  const outreachPlatforms: Record<string, number> = {
    EMAIL: 0,
    LINKEDIN: 0,
    INSTAGRAM: 0,
    PHONE: 0,
    WHATSAPP: 0,
  };
  platformStats.forEach((item) => {
    outreachPlatforms[item.platform] = item._count;
  });

  // Follow-ups due (pending tasks with due dates in the past/today, or leads with nextFollowUp past/today)
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const followUpsDue = await prisma.task.count({
    where: {
      userId,
      completed: false,
      dueDate: { lte: todayEnd },
    },
  });

  // 1. Recent Activities from ActivityLog table
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  try {
    await prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: twentyFourHoursAgo },
      },
    });
  } catch (err) {
    console.error("Failed to auto-delete old activity logs:", err);
  }

  const dbActivities = await prisma.activityLog.findMany({
    where: { 
      userId,
      createdAt: { gte: twentyFourHoursAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { lead: { select: { fullName: true } } },
  });

  const recentActivities = dbActivities.map((act) => ({
    id: act.id,
    type: act.action,
    title: act.description,
    description: act.lead ? `For lead ${act.lead.fullName}` : act.description,
    time: act.createdAt,
  }));

  // 2. Upcoming Follow-ups (pending tasks)
  const dbTasks = await prisma.task.findMany({
    where: { userId, completed: false },
    orderBy: { dueDate: "asc" },
    take: 5,
    include: { lead: { select: { id: true, fullName: true, company: true } } },
  });

  const upcomingFollowUps = dbTasks.map((t) => ({
    id: t.id,
    leadId: t.lead?.id || "",
    name: t.lead?.fullName || "General Task",
    company: t.lead?.company || "N/A",
    dueDate: t.dueDate || new Date(),
    stage: t.priority,
    type: t.title,
  }));

  // 3. Sales Funnel Data
  const funnelData = [
    { stage: "Lead Found", count: totalLeads },
    { stage: "Contacted", count: contacted },
    { stage: "Replied", count: responses },
    { stage: "Meeting", count: stageStats["DISCOVERY_CALL"] || 0 },
    { stage: "Proposal", count: stageStats["PROPOSAL_SENT"] || 0 },
    { stage: "Won", count: won },
  ];

  // 4. Country Distribution
  const countryGroups = await prisma.lead.groupBy({
    by: ["country"],
    where: { userId, archivedAt: null, country: { not: null, notIn: ["", "Unknown"] } },
    _count: true,
  });

  let countryData = countryGroups.map((c) => ({
    name: c.country || "Other",
    value: c._count,
  }));

  if (countryData.length === 0) {
    countryData = [{ name: "No Data", value: 1 }];
  } else {
    // Sort and calculate percentages
    countryData.sort((a, b) => b.value - a.value);
    const totalCount = countryData.reduce((sum, item) => sum + item.value, 0);
    countryData = countryData.map(c => ({
      name: c.name,
      value: Math.round((c.value / totalCount) * 100),
    }));
  }

  // 5. Monthly Performance Data (leads and clients added per month for last 6 months)
  const performanceData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = d.toLocaleString("default", { month: "short" });

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const monthlyLeads = await prisma.lead.count({
      where: {
        userId,
        archivedAt: null,
        addedDate: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const monthlyClients = await prisma.client.count({
      where: {
        lead: { userId },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    performanceData.push({
      name: monthName,
      leads: monthlyLeads,
      clients: monthlyClients,
    });
  }

  return {
    totalLeads,
    newLeads,
    won,
    discoveryCalls: stageStats["DISCOVERY_CALL"] || 0,
    followUpsDue,
    funnel: {
      leadsFound: totalLeads,
      contacted,
      responses,
      won,
    },
    outreachPlatforms,
    recentActivities,
    upcomingFollowUps,
    funnelData,
    countryData,
    performanceData,
  };
}

// ─── ATTACHMENTS ───────────────────────────────────────────────────

export async function addAttachment(leadId: string, data: { fileName: string, fileUrl: string, fileSize: number, mimeType?: string }) {
  const attachment = await prisma.attachment.create({
    data: {
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      fileType: data.mimeType || "application/octet-stream",
      leadId,
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return attachment;
}

export async function deleteAttachment(id: string, leadId: string) {
  const userId = await getUserId();
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
  });

  if (!lead) throw new Error("Unauthorized");

  await prisma.attachment.delete({
    where: { id },
  });

  revalidatePath(`/leads/${leadId}`);
}

// ─── CLIENTS ───────────────────────────────────────────────────────

export async function getClients() {
  const userId = await getUserId();
  return await prisma.client.findMany({
    where: {
      lead: {
        userId,
        archivedAt: null,
      },
    },
    include: {
      lead: true,
      projects: true,
      invoices: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClient(data: {
  fullName: string;
  company?: string;
  email?: string;
  country?: string;
  retainerAmount: number;
  status: string;
}) {
  const userId = await getUserId();

  // Create the Lead first with CLIENT_WON stage
  const lead = await prisma.lead.create({
    data: {
      fullName: data.fullName,
      company: data.company || "",
      email: data.email || "",
      country: data.country || "United States",
      pipelineStage: "CLIENT_WON",
      userId,
    },
  });

  // Create the Client record — only use fields that exist in schema
  const client = await prisma.client.create({
    data: {
      monthlyRetainer: Number(data.retainerAmount) || 0,
      status: (data.status || "active").toLowerCase(),
      leadId: lead.id,
    },
  });

  await logActivity("CLIENT_WON", `New Client: ${lead.company} signed contract`, "client", client.id, lead.id);

  revalidatePath("/clients");
  revalidatePath("/leads");
  revalidatePath("/");
  return client;
}

export async function getFollowUps() {
  const userId = await getUserId();
  
  const tasks = await prisma.task.findMany({
    where: { userId, completed: false, dueDate: { not: null } },
    include: { lead: true },
    orderBy: { dueDate: "asc" },
  });

  return tasks.map(task => ({
    id: task.id,
    leadId: task.lead?.id || null,
    leadName: task.lead?.fullName || "General Task",
    company: task.lead?.company || "N/A",
    dueDate: task.dueDate!,
    type: task.priority === "HIGH" || task.priority === "URGENT" ? "PHONE" : "EMAIL", // mock mapping to icons
    notes: task.description || task.title,
    status: "PENDING",
  }));
}

export async function getAnalyticsData() {
  const userId = await getUserId();

  const totalLeads = await prisma.lead.count({
    where: { userId, archivedAt: null },
  });

  const wonLeadsCount = await prisma.lead.count({
    where: { userId, pipelineStage: "CLIENT_WON", archivedAt: null },
  });

  const conversionRate = totalLeads > 0 ? Number(((wonLeadsCount / totalLeads) * 100).toFixed(1)) : 0;

  const mrrAgg = await prisma.client.aggregate({
    where: { status: "active", lead: { userId } },
    _sum: { monthlyRetainer: true },
  });
  const mrr = mrrAgg._sum.monthlyRetainer || 0;

  const wonLeadsWithDates = await prisma.lead.findMany({
    where: { userId, pipelineStage: "CLIENT_WON", clientSince: { not: null }, archivedAt: null },
    select: { addedDate: true, clientSince: true },
  });

  let avgDaysToClose = 14;
  if (wonLeadsWithDates.length > 0) {
    const totalDays = wonLeadsWithDates.reduce((sum, lead) => {
      const diff = lead.clientSince!.getTime() - lead.addedDate.getTime();
      return sum + (diff / (1000 * 60 * 60 * 24));
    }, 0);
    avgDaysToClose = Math.round(totalDays / wonLeadsWithDates.length);
  }

  const activeClients = await prisma.client.count({
    where: { status: "active", lead: { userId } },
  });

  // Leads by Source
  const sourceGroups = await prisma.lead.groupBy({
    by: ["source"],
    where: { userId, archivedAt: null },
    _count: true,
  });

  const sourceData = sourceGroups.map(g => ({
    name: g.source,
    leads: g._count,
  }));

  // Monthly breakdown for past 6 months
  const conversionData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = d.toLocaleString("default", { month: "short" });

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const monthlyLeads = await prisma.lead.count({
      where: {
        userId,
        archivedAt: null,
        addedDate: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const monthlyContacted = await prisma.outreachHistory.groupBy({
      by: ["leadId"],
      where: { lead: { userId, addedDate: { gte: startOfMonth, lte: endOfMonth } } },
    }).then(res => res.length);

    const monthlyResponses = await prisma.outreachHistory.count({
      where: {
        status: "REPLIED",
        lead: { userId, addedDate: { gte: startOfMonth, lte: endOfMonth } },
      },
    });

    const monthlyClients = await prisma.client.count({
      where: {
        lead: { userId, addedDate: { gte: startOfMonth, lte: endOfMonth } },
      },
    });

    conversionData.push({
      name: monthName,
      leads: monthlyLeads,
      contacted: monthlyContacted,
      meetings: Math.round(monthlyContacted * 0.3), // realistic mock conversion ratio
      clients: monthlyClients,
    });
  }

  return {
    conversionRate,
    mrr,
    avgDaysToClose,
    activeClients,
    sourceData,
    conversionData,
  };
}

export async function getAgencySettings() {
  await getUserId();
  let settings = await prisma.agencySettings.findFirst();
  if (!settings) {
    settings = await prisma.agencySettings.create({
      data: {
        agencyName: "Vayu Arc",
        email: "admin@vayuarc.com",
        primaryColor: "#5b9e8a",
        secondaryColor: "#7ec4a8",
      },
    });
  }
  return settings;
}

export async function updateAgencySettings(data: {
  agencyName: string;
  email?: string;
  logoUrl?: string;
}) {
  await getUserId();
  const settings = await prisma.agencySettings.findFirst();
  if (!settings) {
    return await prisma.agencySettings.create({
      data: {
        agencyName: data.agencyName,
        email: data.email || "",
        logoUrl: data.logoUrl || "",
      },
    });
  }
  return await prisma.agencySettings.update({
    where: { id: settings.id },
    data: {
      agencyName: data.agencyName,
      email: data.email !== undefined ? data.email : undefined,
      logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
    },
  });
}
