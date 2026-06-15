import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { medicinesTable } from "./medicines";
import { prescriptionsTable } from "./prescriptions";

export const dispensingRecordsTable = pgTable("dispensing_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  medicineId: integer("medicine_id").notNull().references(() => medicinesTable.id),
  prescriptionId: integer("prescription_id").references(() => prescriptionsTable.id),
  quantityDispensed: integer("quantity_dispensed").notNull(),
  dispensedAt: text("dispensed_at").notNull(),
  dispensedBy: text("dispensed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDispensingRecordSchema = createInsertSchema(dispensingRecordsTable).omit({ id: true, createdAt: true });
export type InsertDispensingRecord = z.infer<typeof insertDispensingRecordSchema>;
export type DispensingRecord = typeof dispensingRecordsTable.$inferSelect;
