import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("No DATABASE_URL");

const db = drizzle(connectionString);
const rows = await db.execute(sql`SELECT id, email, role, is_active, LEFT(password_hash, 7) as hash_prefix, LENGTH(password_hash) as hash_len FROM users ORDER BY id`);
rows.rows.forEach((r: any) => console.log(JSON.stringify(r)));
process.exit(0);
