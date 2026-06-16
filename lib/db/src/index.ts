import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

export const isDbConfigured = !!connectionString;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString) {
  _pool = new Pool({
    connectionString,
    ssl: connectionString.includes("neon") ? { rejectUnauthorized: false } : false,
  });
  _db = drizzle(_pool, { schema });
}

function requireDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    throw new Error(
      "DATABASE_URL is not configured. " +
        "Please ensure the Replit PostgreSQL database is provisioned."
    );
  }
  return _db;
}

export const pool = _pool;

export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_target, prop) {
    return (requireDb() as any)[prop];
  },
});

export * from "./schema";
