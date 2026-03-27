import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyTable } from "@/components/dashboard/property/property-table";
import { getProperties } from "./actions";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

export default async function PropertiesPage() {
  let properties: Awaited<ReturnType<typeof getProperties>>;

  try {
    properties = await getProperties();
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse, create and manage property listings.
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="size-4" />
            New Property
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <PropertyTable properties={properties} />
      </div>
    </div>
  );
}
