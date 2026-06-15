import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wardsTable = pgTable("wards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  wardType: text("ward_type").notNull(),
  floor: text("floor"),
  totalBeds: integer("total_beds").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWardSchema = createInsertSchema(wardsTable).omit({ id: true, createdAt: true });
export type InsertWard = z.infer<typeof insertWardSchema>;
export type Ward = typeof wardsTable.$inferSelect;
