import { db } from "@/app/db";
import { branches, users } from "@/app/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";

export type BranchData = {
  name: string;
  nameVi: string;
  address: string;
  addressVi: string;
  city: string;
  phone?: string;
};

export const BranchService = {
  async getAll(search?: string, activeOnly?: boolean) {
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(branches.name, `%${search}%`),
          ilike(branches.city, `%${search}%`),
          ilike(branches.address, `%${search}%`),
        ),
      );
    }
    if (activeOnly) {
      conditions.push(eq(branches.isActive, true));
    }

    const rows = await db
      .select({
        id: branches.id,
        name: branches.name,
        nameVi: branches.nameVi,
        address: branches.address,
        city: branches.city,
        phone: branches.phone,
        isActive: branches.isActive,
        createdAt: branches.createdAt,
      })
      .from(branches)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(branches.createdAt);

    const admins = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        branchId: users.branchId,
      })
      .from(users)
      .where(eq(users.role, "OFFICE_ADMIN"));

    return rows.map((branch) => ({
      ...branch,
      admin: admins.find((a) => a.branchId === branch.id) ?? null,
    }));
  },

  async getById(id: string) {
    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, id));

    if (!branch) return null;

    const [admin] = await db
      .select({ id: users.id, fullName: users.fullName, email: users.email })
      .from(users)
      .where(and(eq(users.role, "OFFICE_ADMIN"), eq(users.branchId, id)));

    return { ...branch, admin: admin ?? null };
  },

  async getOfficeAdmins() {
    return db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        branchId: users.branchId,
      })
      .from(users)
      .where(and(eq(users.role, "OFFICE_ADMIN"), eq(users.isActive, true)));
  },

  async create(data: BranchData) {
    await db.insert(branches).values(data);
  },

  async update(id: string, data: BranchData) {
    await db.update(branches).set(data).where(eq(branches.id, id));
  },

  async setActive(id: string, isActive: boolean) {
    await db.update(branches).set({ isActive }).where(eq(branches.id, id));
  },

  async delete(id: string) {
    await db
      .update(users)
      .set({ branchId: null })
      .where(eq(users.branchId, id));

    await db.delete(branches).where(eq(branches.id, id));
  },

  async assignOfficeAdmin(branchId: string, userId: string) {
    // Unassign current admin from this branch
    await db
      .update(users)
      .set({ branchId: null })
      .where(and(eq(users.role, "OFFICE_ADMIN"), eq(users.branchId, branchId)));

    // Assign new admin
    await db.update(users).set({ branchId }).where(eq(users.id, userId));
  },
};
