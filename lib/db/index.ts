import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const DEFAULT_DATABASE_ERROR =
  "DATABASE_URL is missing. Set it in your environment before running SpendWise, for example in .env.local or your Vercel environment.";

export function getDb() {
  const connectionString = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");

  if (!connectionString) {
    throw new Error(DEFAULT_DATABASE_ERROR);
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}
