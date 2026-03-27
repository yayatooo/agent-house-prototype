import { db } from "@/app/db";
import { users, branches } from "@/app/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { hashPassword } from "@/lib/crypto";
import type { UserRole } from "@/app/db/schema";

export type CreateAccountData = {
  email: string;
  password: string;
  fullName: string;
  fullNameVi?: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
};

export type UpdateAccountData = {
  fullName: string;
  fullNameVi?: string;
  phone?: string;
  role: UserRole;
  branchId?: string | null;
};

export type UpdateProfileData = {
  fullName: string;
  fullNameVi?: string;
  phone?: string;
  avatar?: string;
};

export const AccountService = {
  async getAll(filters?: { search?: string; role?: string }) {
    const conditions = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(users.fullName, `%${filters.search}%`),
          ilike(users.email, `%${filters.search}%`),
        ),
      );
    }
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as UserRole));
    }

    return db.query.users.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      columns: { passwordHash: false },
      with: {
        branch: { columns: { id: true, name: true } },
      },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
  },

  async getById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { passwordHash: false },
      with: {
        branch: { columns: { id: true, name: true } },
      },
    });
  },

  async emailExists(email: string, excludeId?: string) {
    const row = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });
    if (!row) return false;
    return row.id !== excludeId;
  },

  async getBranchesForSelect() {
    return db
      .select({ id: branches.id, name: branches.name })
      .from(branches)
      .where(eq(branches.isActive, true))
      .orderBy(branches.name);
  },

  async create(data: CreateAccountData) {
    const passwordHash = await hashPassword(data.password);
    const [created] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        fullNameVi: data.fullNameVi,
        phone: data.phone,
        role: data.role,
        branchId: data.branchId || null,
        isActive: true,
      })
      .returning({ id: users.id, email: users.email, fullName: users.fullName });
    return created;
  },

  async update(id: string, data: UpdateAccountData) {
    await db
      .update(users)
      .set({
        fullName: data.fullName,
        fullNameVi: data.fullNameVi,
        phone: data.phone,
        role: data.role,
        branchId: data.branchId ?? null,
      })
      .where(eq(users.id, id));
  },

  async updateProfile(id: string, data: UpdateProfileData) {
    await db
      .update(users)
      .set({
        fullName: data.fullName,
        fullNameVi: data.fullNameVi,
        phone: data.phone,
        avatar: data.avatar,
      })
      .where(eq(users.id, id));
  },

  async setActive(id: string, isActive: boolean) {
    await db.update(users).set({ isActive }).where(eq(users.id, id));
  },

  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id));
  },
};
