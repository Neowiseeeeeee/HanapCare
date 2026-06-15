import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicinesTable = pgTable("medicines", {
  id: serial("id").primaryKey(),
  drugName: text("drug_name").notNull(),
  genericName: text("generic_name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  batchNumber: text("batch_number"),
  expirationDate: text("expiration_date"),
  supplier: text("supplier"),
  reorderLevel: integer("reorder_level").notNull().default(10),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMedicineSchema = createInsertSchema(medicinesTable).omit({ id: true, createdAt: true });
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicinesTable.$inferSelect;
