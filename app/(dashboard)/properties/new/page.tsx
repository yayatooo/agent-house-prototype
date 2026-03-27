import { redirect } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property/property-form";
import { createProperty, getBranchesForSelect } from "../actions";
import { requireRoles, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

export default async function NewPropertyPage() {
  try {
    await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN", "PROPERTY_OWNER"]);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  const branches = await getBranchesForSelect();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New Property</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add a new property listing to the platform.
        </p>
      </div>
      <PropertyForm
        action={createProperty}
        title="Property Details"
        branches={branches}
      />
    </div>
  );
}
