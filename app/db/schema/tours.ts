import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { properties } from "./properties";

export const tourSchedules = pgTable("tour_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 20 }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  salesId: uuid("sales_id"),
  status: varchar("status", { length: 20 }).default("SCHEDULED").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
