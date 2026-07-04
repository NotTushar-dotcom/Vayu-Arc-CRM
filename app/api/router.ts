import { authRouter } from "./auth-router.js";
import { leadRouter } from "./routers/lead-router.js";
import { taskRouter } from "./routers/task-router.js";
import { clientManager } from "./routers/client-router.js";
import { analyticsRouter } from "./routers/analytics-router.js";
import { settingsRouter } from "./routers/settings-router.js";
import { createRouter, publicQuery } from "./middleware.js";

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
