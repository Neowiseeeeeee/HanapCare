import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const vitalSignsTable = pgTable("vital_signs", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  recordedBy: text("recorded_by"),
  recordedAt: text("recorded_at").notNull(),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("respiratory_rate"),
  oxygenSaturation: numeric("oxygen_saturation", { precision: 5, scale: 2 }),
  temperature: numeric("temperature", { precision: 5, scale: 2 }),
  weight: numeric("weight", { precision: 6, scale: 2 }),
  height: numeric("height", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVitalSignSchema = createInsertSchema(vitalSignsTable).omit({ id: true, createdAt: true });
export type InsertVitalSign = z.infer<typeof insertVitalSignSchema>;
export type VitalSign = typeof vitalSignsTable.$inferSelect;
