import { redirect } from "next/navigation";
import { AccountForm } from "@/components/dashboard/account/account-form";
import { createAccount, getBranchesForSelect } from "../actions";
import { requireRoles, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

export default async function NewAccountPage() {
  try {
    await requireRoles(["ADMINISTRATOR"]);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  const branches = await getBranchesForSelect();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New Account</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create a new user account on the platform.
        </p>
      </div>
      <AccountForm
        action={createAccount}
        branches={branches}
        successMessage="Account created successfully."
      />
    </div>
  );
}
