import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { properties } from "./properties";

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleVi: varchar("title_vi", { length: 255 }),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).default("MEDIUM").notNull(),
  status: varchar("status", { length: 20 }).default("OPEN").notNull(),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
