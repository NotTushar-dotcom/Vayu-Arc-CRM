import { authRouter } from "./auth-router";
import { leadRouter } from "./routers/lead-router";
import { taskRouter } from "./routers/task-router";
import { clientManager } from "./routers/client-router";
import { analyticsRouter } from "./routers/analytics-router";
import { settingsRouter } from "./routers/settings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lead: leadRouter,
  task: taskRouter,
  clientManager: clientManager,
  analytics: analyticsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
