"use server";

import { revalidatePath } from "next/cache";
import { requireRoles, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";
import { z } from "zod";
import { BranchService } from "./services/branch.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameVi: z.string().min(1, "Vietnamese name is required"),
  address: z.string().min(1, "Address is required"),
  addressVi: z.string().min(1, "Vietnamese address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toActionError(err: unknown): { success: false; error: string } {
  if (err instanceof UnauthorizedError)
    return { success: false, error: "You must be logged in to perform this action." };
  if (err instanceof ForbiddenError)
    return { success: false, error: "You don't have permission to perform this action." };
  if (err instanceof z.ZodError)
    return { success: false, error: err.issues.map((i) => i.message).join(", ") };
  return { success: false, error: "An unexpected error occurred." };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getBranches(search?: string, activeOnly?: boolean) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);
  return BranchService.getAll(search, activeOnly);
}

export async function getBranch(id: string) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);
  return BranchService.getById(id);
}

export async function getOfficeAdmins() {
  await requireRoles(["ADMINISTRATOR"]);
  return BranchService.getOfficeAdmins();
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createBranch(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);

    const parsed = branchSchema.parse({
      name: formData.get("name"),
      nameVi: formData.get("nameVi"),
      address: formData.get("address"),
      addressVi: formData.get("addressVi"),
      city: formData.get("city"),
      phone: formData.get("phone") || undefined,
    });

    await BranchService.create(parsed);
    revalidatePath("/branch");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateBranch(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);

    const parsed = branchSchema.parse({
      name: formData.get("name"),
      nameVi: formData.get("nameVi"),
      address: formData.get("address"),
      addressVi: formData.get("addressVi"),
      city: formData.get("city"),
      phone: formData.get("phone") || undefined,
    });

    await BranchService.update(id, parsed);
    revalidatePath("/branch");
    revalidatePath(`/branch/${id}/edit`);
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function toggleBranchActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);
    await BranchService.setActive(id, isActive);
    revalidatePath("/branch");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteBranch(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);
    await BranchService.delete(id);
    revalidatePath("/branch");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function assignOfficeAdmin(
  branchId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);
    await BranchService.assignOfficeAdmin(branchId, userId);
    revalidatePath("/branch");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}
