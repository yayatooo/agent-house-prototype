import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMINISTRATOR",
  "OFFICE_ADMIN",
  "PROPERTY_OWNER",
  "SALES",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "APARTMENT",
  "HOUSE",
  "TOWNHOUSE",
  "SHOPHOUSE",
  "LAND",
  "COMMERCIAL",
  "OFFICETEL",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "RENT",
  "SELL",
  "BOTH",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "ACTIVE",
  "RESERVED",
  "RENTED",
  "SOLD",
  "ARCHIVED",
  "REJECTED",
]);

export const currencyEnum = pgEnum("currency", ["USD", "VND"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "OVERDUE",
  "DEFERRED",
  "CANCELLED",
]);

export const installmentPlanTypeEnum = pgEnum("installment_plan_type", [
  "STANDARD_PURCHASE",
  "LEASE_PURCHASE",
  "BANK_FINANCED",
]);

// Derived TypeScript types from enums
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type PropertyType = (typeof propertyTypeEnum.enumValues)[number];
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
export type ListingStatus = (typeof listingStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type InstallmentPlanType =
  (typeof installmentPlanTypeEnum.enumValues)[number];
