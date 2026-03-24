import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";
import { branches } from "./branches";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  fullNameVi: varchar("full_name_vi", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  avatar: varchar("avatar", { length: 512 }),
  branchId: uuid("branch_id").references(() => branches.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
