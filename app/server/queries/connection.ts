import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const pool = mysql.createPool(env.databaseUrl);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pool as any).on("error", (err: Error) => {
      console.error("MySQL Pool Error:", err);
    });

    // @ts-expect-error - Type mismatch between drizzle-orm and mysql2 versions
    instance = drizzle(pool.promise(), {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
