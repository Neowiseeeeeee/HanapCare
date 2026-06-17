import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const nursingNotesTable = pgTable("nursing_notes", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  authorId: integer("author_id"),
  authorName: text("author_name").notNull(),
  noteType: text("note_type").notNull().default("General"),
  content: text("content").notNull(),
  shift: text("shift"),
  isHandover: integer("is_handover").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNursingNoteSchema = createInsertSchema(nursingNotesTable).omit({ id: true, createdAt: true });
export type InsertNursingNote = z.infer<typeof insertNursingNoteSchema>;
export type NursingNote = typeof nursingNotesTable.$inferSelect;
