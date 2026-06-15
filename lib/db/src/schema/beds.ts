import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { wardsTable } from "./wards";
import { patientsTable } from "./patients";

export const bedsTable = pgTable("beds", {
  id: serial("id").primaryKey(),
  wardId: integer("ward_id").notNull().references(() => wardsTable.id),
  bedNumber: text("bed_number").notNull(),
  status: text("status").notNull().default("Available"),
  patientId: integer("patient_id").references(() => patientsTable.id),
  admittedAt: text("admitted_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBedSchema = createInsertSchema(bedsTable).omit({ id: true, status: true, patientId: true, admittedAt: true, createdAt: true });
export type InsertBed = z.infer<typeof insertBedSchema>;
export type Bed = typeof bedsTable.$inferSelect;
