import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { agencySettings } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const [settings] = await db.select().from(agencySettings).orderBy(desc(agencySettings.createdAt)).limit(1);

    if (!settings) {
      const [defaultSettings] = await db.insert(agencySettings).values({
        agencyName: "Vayu Arc",
        email: "hello@vayuarc.com",
        primaryColor: "#A8B98B",
        secondaryColor: "#6F9270",
        accentColor: "#2C5C4B",
        darkColor: "#25343D",
      });

      return {
        id: Number(defaultSettings.insertId),
        agencyName: "Vayu Arc",
        email: "hello@vayuarc.com",
        logoUrl: null,
        primaryColor: "#A8B98B",
        secondaryColor: "#6F9270",
        accentColor: "#2C5C4B",
        darkColor: "#25343D",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return settings;
  }),

  update: publicQuery
    .input(
      z.object({
        agencyName: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        logoUrl: z.string().optional().or(z.literal("")),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        darkColor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [existing] = await db.select().from(agencySettings).orderBy(desc(agencySettings.createdAt)).limit(1);

      if (!existing) {
        const [settings] = await db.insert(agencySettings).values(input);
        return { id: Number(settings.insertId) };
      }

      await db.update(agencySettings).set(input).where(eq(agencySettings.id, existing.id));
      return { id: existing.id };
    }),
});
