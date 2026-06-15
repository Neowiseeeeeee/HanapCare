import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.NEON_DATABASE_URL;

export const isDbConfigured = !!connectionString;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString) {
  _pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  _db = drizzle(_pool, { schema });
}

function requireDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    throw new Error(
      "NEON_DATABASE_URL is not configured. " +
        "Please add your Neon PostgreSQL connection string as a secret named NEON_DATABASE_URL in the Replit Secrets panel."
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
