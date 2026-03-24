import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { properties } from "./properties";

export const purchaseAgreements = pgTable("purchase_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  buyerName: varchar("buyer_name", { length: 255 }).notNull(),
  buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
  buyerPhone: varchar("buyer_phone", { length: 20 }).notNull(),
  buyerIdNumber: varchar("buyer_id_number", { length: 50 }).notNull(),
  totalPriceUsd: numeric("total_price_usd", {
    precision: 15,
    scale: 2,
  }).notNull(),
  totalPriceVnd: bigint("total_price_vnd", { mode: "bigint" }).notNull(),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull(), // FULL_PAYMENT | INSTALLMENT | BANK_FINANCED
  bankGuarantee: boolean("bank_guarantee").default(true).notNull(),
  contractUrl: varchar("contract_url", { length: 512 }),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
