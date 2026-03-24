import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { paymentStatusEnum } from "./enums";
import { properties } from "./properties";

export const rentalAgreements = pgTable("rental_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  tenantName: varchar("tenant_name", { length: 255 }).notNull(),
  tenantEmail: varchar("tenant_email", { length: 255 }).notNull(),
  tenantPhone: varchar("tenant_phone", { length: 20 }).notNull(),
  tenantIdNumber: varchar("tenant_id_number", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRentUsd: numeric("monthly_rent_usd", {
    precision: 12,
    scale: 2,
  }).notNull(),
  monthlyRentVnd: bigint("monthly_rent_vnd", { mode: "bigint" }).notNull(),
  depositUsd: numeric("deposit_usd", { precision: 12, scale: 2 }).notNull(),
  depositVnd: bigint("deposit_vnd", { mode: "bigint" }).notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  contractUrl: varchar("contract_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const rentalPayments = pgTable("rental_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  agreementId: uuid("agreement_id")
    .references(() => rentalAgreements.id)
    .notNull(),
  dueDate: timestamp("due_date").notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
  amountVnd: bigint("amount_vnd", { mode: "bigint" }).notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
