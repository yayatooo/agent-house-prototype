"use server";

import { revalidatePath } from "next/cache";
import {
  requireRoles,
  requireAuth,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/auth-guard";
import { z } from "zod";
import { AccountService } from "./services/account.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ROLES = ["ADMINISTRATOR", "OFFICE_ADMIN", "PROPERTY_OWNER", "SALES"] as const;

const createAccountSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  fullNameVi: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(ROLES),
  branchId: z.string().optional(),
});

const updateAccountSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  fullNameVi: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(ROLES),
  branchId: z.string().optional(),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  fullNameVi: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
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

export async function getAccounts(filters?: { search?: string; role?: string }) {
  await requireRoles(["ADMINISTRATOR"]);
  return AccountService.getAll(filters);
}

export async function getAccount(id: string) {
  await requireRoles(["ADMINISTRATOR"]);
  return AccountService.getById(id);
}

export async function getBranchesForSelect() {
  await requireRoles(["ADMINISTRATOR"]);
  return AccountService.getBranchesForSelect();
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createAccount(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);

    const parsed = createAccountSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
      fullNameVi: formData.get("fullNameVi") || undefined,
      phone: formData.get("phone") || undefined,
      role: formData.get("role"),
      branchId: formData.get("branchId") || undefined,
    });

    const emailTaken = await AccountService.emailExists(parsed.email);
    if (emailTaken) return { success: false, error: "Email is already in use." };

    await AccountService.create(parsed);
    revalidatePath("/accounts");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateAccount(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);

    const parsed = updateAccountSchema.parse({
      fullName: formData.get("fullName"),
      fullNameVi: formData.get("fullNameVi") || undefined,
      phone: formData.get("phone") || undefined,
      role: formData.get("role"),
      branchId: formData.get("branchId") || undefined,
    });

    await AccountService.update(id, {
      ...parsed,
      branchId: parsed.branchId ?? null,
    });
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${id}/edit`);
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function toggleAccountActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR"]);
    await AccountService.setActive(id, isActive);
    revalidatePath("/accounts");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteAccount(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRoles(["ADMINISTRATOR"]);
    if (session.user.id === id)
      return { success: false, error: "You cannot delete your own account." };

    await AccountService.delete(id);
    revalidatePath("/accounts");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateProfile(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const parsed = updateProfileSchema.parse({
      fullName: formData.get("fullName"),
      fullNameVi: formData.get("fullNameVi") || undefined,
      phone: formData.get("phone") || undefined,
      avatar: formData.get("avatar") || undefined,
    });

    await AccountService.updateProfile(session.user.id, {
      ...parsed,
      avatar: parsed.avatar || undefined,
    });
    revalidatePath("/accounts/profile");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}
