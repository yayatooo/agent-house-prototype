import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { hashPassword } from "@/lib/crypto";
import type { RegisterInput } from "../validations/auth";

export type AuthServiceError =
  | "EMAIL_TAKEN"
  | "USER_NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED";

export class AuthServiceException extends Error {
  constructor(public code: AuthServiceError, message: string) {
    super(message);
    this.name = "AuthServiceException";
  }
}

export async function createUser(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true },
  });

  if (existing) {
    throw new AuthServiceException(
      "EMAIL_TAKEN",
      `Email ${input.email} is already registered`
    );
  }

  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      fullNameVi: input.fullNameVi,
      phone: input.phone,
      role: input.role,
      isActive: true,
    })
    .returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
    });

  return user;
}

export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      branchId: true,
    },
  });

  return user ?? null;
}

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      email: true,
      fullName: true,
      fullNameVi: true,
      role: true,
      phone: true,
      avatar: true,
      isActive: true,
      branchId: true,
    },
  });

  return user ?? null;
}
