import { db } from "@/app/db";
import { properties, branches } from "@/app/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "TOWNHOUSE"
  | "SHOPHOUSE"
  | "LAND"
  | "COMMERCIAL"
  | "OFFICETEL";

export type TransactionType = "RENT" | "SELL" | "BOTH";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "RESERVED"
  | "RENTED"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

export type PropertyData = {
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  priceUsd: string;
  priceVnd: bigint;
  area: number;
  bedrooms: number;
  bathrooms: number;
  legalStatus: string;
  legalStatusVi: string;
  address: string;
  addressVi: string;
  province: string;
  district: string;
  ward: string;
  rentPriceUsd?: string | null;
  rentPriceVnd?: bigint | null;
  floor?: number | null;
  direction?: string | null;
  furnished?: string | null;
  images: string[];
  installmentAvail: boolean;
  branchId?: string | null;
};

export const PropertyService = {
  async getAll(filters?: {
    search?: string;
    propertyType?: string;
    transactionType?: string;
    province?: string;
  }) {
    const conditions = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(properties.title, `%${filters.search}%`),
          ilike(properties.address, `%${filters.search}%`),
        ),
      );
    }
    if (filters?.propertyType) {
      conditions.push(
        eq(properties.propertyType, filters.propertyType as PropertyType),
      );
    }
    if (filters?.transactionType) {
      conditions.push(
        eq(
          properties.transactionType,
          filters.transactionType as TransactionType,
        ),
      );
    }
    if (filters?.province) {
      conditions.push(ilike(properties.province, `%${filters.province}%`));
    }

    return db.query.properties.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: {
        owner: {
          columns: { fullName: true, email: true, phone: true, avatar: true },
        },
        branch: { columns: { id: true, name: true, nameVi: true } },
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });
  },

  async getById(id: string) {
    return db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        owner: {
          columns: { fullName: true, email: true, phone: true, avatar: true },
        },
        branch: { columns: { id: true, name: true, nameVi: true } },
      },
    });
  },

  async findOwned(id: string, ownerId: string) {
    return db.query.properties.findFirst({
      where: and(eq(properties.id, id), eq(properties.ownerId, ownerId)),
    });
  },

  async getBranchesForSelect() {
    return db
      .select({ id: branches.id, name: branches.name })
      .from(branches)
      .where(eq(branches.isActive, true))
      .orderBy(branches.name);
  },

  async create(data: PropertyData, ownerId: string) {
    await db.insert(properties).values({
      ...data,
      ownerId,
      status: "DRAFT",
    });
  },

  async update(id: string, data: PropertyData) {
    await db.update(properties).set(data).where(eq(properties.id, id));
  },

  async setStatus(id: string, status: ListingStatus) {
    await db.update(properties).set({ status }).where(eq(properties.id, id));
  },

  async setBranch(id: string, branchId: string | null) {
    await db.update(properties).set({ branchId }).where(eq(properties.id, id));
  },

  async delete(id: string) {
    await db.delete(properties).where(eq(properties.id, id));
  },
};
