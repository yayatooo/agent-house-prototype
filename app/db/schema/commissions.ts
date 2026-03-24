import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
  amountVnd: bigint("amount_vnd", { mode: "bigint" }).notNull(),
  percentage: doublePrecision("percentage").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
