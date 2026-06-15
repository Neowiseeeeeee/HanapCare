import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const billingsTable = pgTable("billings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  consultationFee: numeric("consultation_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  medicineFee: numeric("medicine_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  labFee: numeric("lab_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  roomFee: numeric("room_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  otherFees: numeric("other_fees", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  philhealthDeduction: numeric("philhealth_deduction", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("Unpaid"),
  issuedAt: text("issued_at").notNull(),
  dueDate: text("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBillingSchema = createInsertSchema(billingsTable).omit({ id: true, invoiceNumber: true, paidAmount: true, status: true, createdAt: true });
export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billingsTable.$inferSelect;
