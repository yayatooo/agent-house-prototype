import { redirect } from "next/navigation";
import { BranchForm } from "@/components/dashboard/branch/branch-form";
import { createBranch } from "../actions";
import { requireRoles, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

export default async function NewBranchPage() {
  try {
    await requireRoles(["ADMINISTRATOR"]);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err; // let error.tsx handle it
    throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New Branch</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add a new office branch to the platform.
        </p>
      </div>
      <BranchForm action={createBranch} title="Branch Details" />
    </div>
  );
}
