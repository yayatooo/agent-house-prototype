import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  doublePrecision,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { installmentPlanTypeEnum, paymentStatusEnum } from "./enums";
import { properties } from "./properties";
import { purchaseAgreements } from "./purchases";

export const installmentPlans = pgTable("installment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  purchaseAgreementId: uuid("purchase_agreement_id")
    .references(() => purchaseAgreements.id)
    .unique(),
  planType: installmentPlanTypeEnum("plan_type").notNull(),
  totalAmountVnd: bigint("total_amount_vnd", { mode: "bigint" }).notNull(),
  totalAmountUsd: numeric("total_amount_usd", {
    precision: 15,
    scale: 2,
  }).notNull(),
  depositPercent: doublePrecision("deposit_percent").default(5.0).notNull(),
  firstInstallPercent: doublePrecision("first_install_percent")
    .default(30.0)
    .notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const installmentMilestones = pgTable("installment_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .references(() => installmentPlans.id)
    .notNull(),
  milestoneOrder: integer("milestone_order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleVi: varchar("title_vi", { length: 255 }).notNull(),
  percentage: doublePrecision("percentage").notNull(),
  amountVnd: bigint("amount_vnd", { mode: "bigint" }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
