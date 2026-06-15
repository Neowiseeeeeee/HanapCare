import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { doctorsTable } from "./doctors";

export const labRequestsTable = pgTable("lab_requests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorsTable.id),
  testType: text("test_type").notNull(),
  status: text("status").notNull().default("Pending"),
  requestedAt: text("requested_at").notNull(),
  completedAt: text("completed_at"),
  resultSummary: text("result_summary"),
  resultFileUrl: text("result_file_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLabRequestSchema = createInsertSchema(labRequestsTable).omit({ id: true, status: true, completedAt: true, resultSummary: true, resultFileUrl: true, createdAt: true });
export type InsertLabRequest = z.infer<typeof insertLabRequestSchema>;
export type LabRequest = typeof labRequestsTable.$inferSelect;
