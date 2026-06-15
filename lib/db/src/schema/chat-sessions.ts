import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const chatSessionsTable = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => usersTable.id),
  assignedToId: integer("assigned_to_id").references(() => usersTable.id),
  status: text("status").notNull().default("open"),
  subject: text("subject"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ChatSession = typeof chatSessionsTable.$inferSelect;
