import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { billingsTable } from "./billings";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  billingId: integer("billing_id").notNull().references(() => billingsTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  referenceNumber: text("reference_number"),
  paidAt: text("paid_at").notNull(),
  receivedBy: text("received_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
