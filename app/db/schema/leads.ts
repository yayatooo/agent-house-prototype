import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesId: uuid("sales_id")
    .references(() => users.id)
    .notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }),
  clientPhone: varchar("client_phone", { length: 20 }).notNull(),
  interest: varchar("interest", { length: 10 }).notNull(), // RENT | BUY | BOTH
  budget: varchar("budget", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("NEW").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
