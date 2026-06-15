import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const roleCodesTable = pgTable("role_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  assignedRole: text("assigned_role").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => usersTable.id),
  usedById: integer("used_by_id").references(() => usersTable.id),
  usedAt: timestamp("used_at"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type RoleCode = typeof roleCodesTable.$inferSelect;
