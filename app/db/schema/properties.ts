import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  bigint,
  doublePrecision,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import {
  propertyTypeEnum,
  transactionTypeEnum,
  listingStatusEnum,
} from "./enums";
import { users } from "./users";

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  titleVi: varchar("title_vi", { length: 500 }).notNull(),
  description: text("description").notNull(),
  descriptionVi: text("description_vi").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  priceUsd: numeric("price_usd", { precision: 15, scale: 2 }).notNull(),
  priceVnd: bigint("price_vnd", { mode: "bigint" }).notNull(),
  rentPriceUsd: numeric("rent_price_usd", { precision: 12, scale: 2 }),
  rentPriceVnd: bigint("rent_price_vnd", { mode: "bigint" }),
  area: doublePrecision("area").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  floor: integer("floor"),
  direction: varchar("direction", { length: 20 }),
  legalStatus: varchar("legal_status", { length: 255 }).notNull(),
  legalStatusVi: varchar("legal_status_vi", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  addressVi: varchar("address_vi", { length: 500 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  ward: varchar("ward", { length: 100 }).notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  images: text("images").array().notNull(),
  videoUrl: varchar("video_url", { length: 512 }),
  amenities: jsonb("amenities"), // { en: [...], vi: [...] }
  furnished: varchar("furnished", { length: 50 }),
  yearBuilt: integer("year_built"),
  installmentAvail: boolean("installment_avail").default(false).notNull(),
  status: listingStatusEnum("status").default("DRAFT").notNull(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  approvedById: uuid("approved_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
