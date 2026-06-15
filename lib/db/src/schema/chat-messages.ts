import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { chatSessionsTable } from "./chat-sessions";
import { usersTable } from "./users";

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessionsTable.id),
  senderId: integer("sender_id").references(() => usersTable.id),
  content: text("content").notNull(),
  isBot: boolean("is_bot").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ChatMessage = typeof chatMessagesTable.$inferSelect;
