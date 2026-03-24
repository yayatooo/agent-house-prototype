"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "../validations/auth";
import { createUser, AuthServiceException } from "../service/auth.service";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export async function login(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: "VALIDATION_ERROR",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
          };
        default:
          return {
            success: false,
            error: "Authentication failed. Please try again.",
            code: "AUTH_ERROR",
          };
      }
    }
    throw err;
  }
}

export async function register(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    fullNameVi: formData.get("fullNameVi") || undefined,
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: "VALIDATION_ERROR",
    };
  }

  try {
    await createUser(parsed.data);

    // Sign in immediately after registration
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AuthServiceException) {
      return { success: false, error: err.message, code: err.code };
    }
    throw err;
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
}
