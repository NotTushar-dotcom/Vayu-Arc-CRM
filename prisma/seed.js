const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
require("dotenv").config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // Delete all existing records
  await prisma.activityLog.deleteMany({});
  await prisma.outreachHistory.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      id: "1",
      name: "Admin User",
      email: "admin@vayuarc.com",
      role: "admin",
    },
  });

  // Create leads
  const sarah = await prisma.lead.create({
    data: {
      id: "1",
      fullName: "Sarah Jenkins",
      company: "Prestige Realty",
      role: "Lead Broker",
      email: "sarah@prestigerealty.com",
      phone: "+1 (555) 123-4567",
      website: "prestigerealty.com",
      linkedin: "sarahjenkins",
      instagram: "@sarah.realty",
      country: "United States",
      city: "Los Angeles",
      pipelineStage: "CONNECTED",
      priorityScore: 85,
      videoQuality: 8,
      brandingRating: 7,
      estimatedBudget: 5000,
      needsEditing: "YES",
      userId: admin.id,
      lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  const michael = await prisma.lead.create({
    data: {
      id: "2",
      fullName: "Michael Chen",
      company: "Chen Properties",
      email: "michael.c@gmail.com",
      country: "Canada",
      pipelineStage: "COLD_EMAIL_SENT",
      priorityScore: 62,
      userId: admin.id,
      lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  });

  const emma = await prisma.lead.create({
    data: {
      id: "3",
      fullName: "Emma Watson",
      company: "Luxury Estates London",
      email: "emma@luxuryestates.co.uk",
      country: "United Kingdom",
      pipelineStage: "CONNECTED",
      priorityScore: 92,
      userId: admin.id,
      lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  });

  const david = await prisma.lead.create({
    data: {
      id: "4",
      fullName: "David Rossi",
      company: "Rossi Group",
      email: "david@rossigroup.com",
      country: "United States",
      pipelineStage: "PROPOSAL_SENT",
      priorityScore: 75,
      userId: admin.id,
      lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  });

  const jessica = await prisma.lead.create({
    data: {
      id: "5",
      fullName: "Jessica Thompson",
      company: "Urban Living Homes",
      email: "jessica.t@urbanliving.com",
      country: "Australia",
      pipelineStage: "CLIENT_WON",
      priorityScore: 88,
      userId: admin.id,
      lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  // Create outreach timeline for Sarah
  await prisma.outreachHistory.createMany({
    data: [
      {
        leadId: sarah.id,
        platform: "LINKEDIN",
        messageType: "CONNECTION_REQUEST",
        status: "REPLIED",
        message: "Hey Sarah, love your real estate videos! I noticed some areas we could improve. Let's connect.",
        reply: "Hi! Thanks. What improvements do you suggest?",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
      {
        leadId: sarah.id,
        platform: "EMAIL",
        messageType: "DIRECT_MESSAGE",
        status: "SENT",
        message: "Hi Sarah, following up on our LinkedIn conversation with the proposal details.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      }
    ],
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Follow up with Sarah on proposal",
        description: "Check if she read the email and is interested in a discovery call",
        priority: "HIGH",
        completed: false,
        leadId: sarah.id,
        userId: admin.id,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
      },
      {
        title: "Research Michael's website structure",
        description: "Find service gaps and write cold email copy",
        priority: "MEDIUM",
        completed: false,
        leadId: michael.id,
        userId: admin.id,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
      {
        title: "Send proposal to Emma Watson",
        description: "Draft contract and scope of work",
        priority: "HIGH",
        completed: true,
        completedAt: new Date(),
        leadId: emma.id,
        userId: admin.id,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
      }
    ]
  });

  console.log("Seeding finished successfully.");
  await pool.end();
}

main().catch(err => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
