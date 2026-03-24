import { auth } from "@/lib/auth";
import type { UserRole } from "@/app/db/schema";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden: insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Asserts the request is authenticated.
 * Throws UnauthorizedError if no session exists.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session;
}

/**
 * Asserts the request is authenticated AND the user has one of the allowed roles.
 * Throws UnauthorizedError if not authenticated.
 * Throws ForbiddenError if authenticated but role is not in the allowed list.
 */
export async function requireRoles(roles: UserRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(
      `Role '${session.user.role}' is not allowed. Required: ${roles.join(", ")}`,
    );
  }
  return session;
}

/**
 * Returns the session or null — never throws.
 * Use this for optional auth checks.
 */
export async function getOptionalSession() {
  return auth();
}
