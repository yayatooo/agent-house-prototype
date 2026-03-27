"use server";

import { revalidatePath } from "next/cache";
import {
  requireRoles,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/auth-guard";
import { z } from "zod";
import { PropertyService } from "./services/property.service";
import type { ListingStatus } from "./services/property.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const propertySchema = z.object({
  title: z.string().min(1, "Title (EN) is required"),
  titleVi: z.string().min(1, "Title (VI) is required"),
  description: z.string().min(1, "Description (EN) is required"),
  descriptionVi: z.string().min(1, "Description (VI) is required"),
  propertyType: z.enum([
    "APARTMENT",
    "HOUSE",
    "TOWNHOUSE",
    "SHOPHOUSE",
    "LAND",
    "COMMERCIAL",
    "OFFICETEL",
  ]),
  transactionType: z.enum(["RENT", "SELL", "BOTH"]),
  priceUsd: z.string().min(1, "Price (USD) is required"),
  priceVnd: z.string().min(1, "Price (VND) is required"),
  area: z.number().positive("Area must be positive"),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().int().min(0, "Bathrooms must be 0 or more"),
  legalStatus: z.string().min(1, "Legal status (EN) is required"),
  legalStatusVi: z.string().min(1, "Legal status (VI) is required"),
  address: z.string().min(1, "Address (EN) is required"),
  addressVi: z.string().min(1, "Address (VI) is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward is required"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toActionError(err: unknown): { success: false; error: string } {
  if (err instanceof UnauthorizedError)
    return {
      success: false,
      error: "You must be logged in to perform this action.",
    };
  if (err instanceof ForbiddenError)
    return {
      success: false,
      error: "You don't have permission to perform this action.",
    };
  if (err instanceof z.ZodError)
    return {
      success: false,
      error: err.issues.map((i) => i.message).join(", "),
    };
  return { success: false, error: "An unexpected error occurred." };
}

function parsePropertyFormData(formData: FormData) {
  const rawImages = formData.get("images") as string;
  const images: string[] = rawImages ? JSON.parse(rawImages) : [];

  const rawFloor = formData.get("floor") as string;
  const rawRentUsd = formData.get("rentPriceUsd") as string;
  const rawRentVnd = formData.get("rentPriceVnd") as string;
  const rawBranchId = formData.get("branchId") as string;
  const rawDirection = formData.get("direction") as string;
  const rawFurnished = formData.get("furnished") as string;

  const validated = propertySchema.parse({
    title: formData.get("title"),
    titleVi: formData.get("titleVi"),
    description: formData.get("description"),
    descriptionVi: formData.get("descriptionVi"),
    propertyType: formData.get("propertyType"),
    transactionType: formData.get("transactionType"),
    priceUsd: formData.get("priceUsd"),
    priceVnd: formData.get("priceVnd"),
    area: parseFloat(formData.get("area") as string),
    bedrooms: parseInt(formData.get("bedrooms") as string, 10),
    bathrooms: parseInt(formData.get("bathrooms") as string, 10),
    legalStatus: formData.get("legalStatus"),
    legalStatusVi: formData.get("legalStatusVi"),
    address: formData.get("address"),
    addressVi: formData.get("addressVi"),
    province: formData.get("province"),
    district: formData.get("district"),
    ward: formData.get("ward"),
  });

  return {
    ...validated,
    priceVnd: BigInt(validated.priceVnd),
    rentPriceUsd: rawRentUsd || null,
    rentPriceVnd: rawRentVnd ? BigInt(rawRentVnd) : null,
    floor: rawFloor ? parseInt(rawFloor, 10) : null,
    direction: rawDirection || null,
    furnished: rawFurnished || null,
    images,
    installmentAvail: formData.get("installmentAvail") === "true",
    branchId: rawBranchId || null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProperties(filters?: {
  search?: string;
  propertyType?: string;
  transactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  province?: string;
}) {
  await requireRoles([
    "ADMINISTRATOR",
    "OFFICE_ADMIN",
    "PROPERTY_OWNER",
    "SALES",
  ]);
  return PropertyService.getAll(filters);
}

export async function getProperty(id: string) {
  await requireRoles([
    "ADMINISTRATOR",
    "OFFICE_ADMIN",
    "PROPERTY_OWNER",
    "SALES",
  ]);
  return PropertyService.getById(id);
}

export async function getBranchesForSelect() {
  return PropertyService.getBranchesForSelect();
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createProperty(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRoles([
      "ADMINISTRATOR",
      "OFFICE_ADMIN",
      "PROPERTY_OWNER",
    ]);

    const data = parsePropertyFormData(formData);
    await PropertyService.create(data, session.user.id);

    revalidatePath("/properties");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateProperty(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRoles([
      "ADMINISTRATOR",
      "OFFICE_ADMIN",
      "PROPERTY_OWNER",
    ]);

    if (session.user.role === "PROPERTY_OWNER") {
      const existing = await PropertyService.findOwned(id, session.user.id);
      if (!existing) throw new ForbiddenError("You can only edit your own listings.");
    }

    const data = parsePropertyFormData(formData);
    await PropertyService.update(id, data);

    revalidatePath(`/properties/${id}`);
    revalidatePath("/properties");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updatePropertyStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);
    await PropertyService.setStatus(id, status as ListingStatus);

    revalidatePath(`/properties/${id}`);
    revalidatePath("/properties");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function assignPropertyBranch(
  id: string,
  branchId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);
    await PropertyService.setBranch(id, branchId);

    revalidatePath(`/properties/${id}`);
    revalidatePath("/properties");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteProperty(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRoles(["ADMINISTRATOR", "PROPERTY_OWNER"]);

    if (session.user.role === "PROPERTY_OWNER") {
      const existing = await PropertyService.findOwned(id, session.user.id);
      if (!existing) throw new ForbiddenError("You can only delete your own listings.");
    }

    await PropertyService.delete(id);
    revalidatePath("/properties");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}

export async function archiveProperty(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);
    await PropertyService.setStatus(id, "ARCHIVED");

    revalidatePath(`/properties/${id}`);
    revalidatePath("/properties");
    return { success: true };
  } catch (err) {
    return toActionError(err);
  }
}
