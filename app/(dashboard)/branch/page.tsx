import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BranchTable } from "@/components/dashboard/branch/branch-table";
import { BranchSearch } from "@/components/dashboard/branch/branch-search";
import { getBranches, getOfficeAdmins } from "./actions";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

interface PageProps {
  searchParams: Promise<{ search?: string; activeOnly?: string }>;
}

async function BranchList({
  search,
  activeOnly,
}: {
  search?: string;
  activeOnly?: boolean;
}) {
  const [branchRows, admins] = await Promise.all([
    getBranches(search, activeOnly),
    getOfficeAdmins(),
  ]);

  return <BranchTable branches={branchRows} admins={admins} />;
}

export default async function BranchPage({ searchParams }: PageProps) {
  try {
    // Eager auth check — throws before rendering anything
    await getBranches(undefined, undefined);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err; // let error.tsx handle it
    throw err;
  }

  const params = await searchParams;
  const search = params.search;
  const activeOnly = params.activeOnly === "1";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branch Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, manage and assign admins to branches.
          </p>
        </div>
        <Button asChild>
          <Link href="/branch/new">
            <Plus className="size-4" />
            New Branch
          </Link>
        </Button>
      </div>

      {/* Search & Filter */}
      <Suspense>
        <BranchSearch />
      </Suspense>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Suspense
          fallback={
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          }
        >
          <BranchList search={search} activeOnly={activeOnly} />
        </Suspense>
      </div>
    </div>
  );
}
