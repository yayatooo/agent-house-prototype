import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountTable } from "@/components/dashboard/account/account-table";
import { AccountSearch } from "@/components/dashboard/account/account-search";
import { getAccounts } from "./actions";
import { requireRoles, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string }>;
}

async function AccountList({
  search,
  role,
  currentUserId,
}: {
  search?: string;
  role?: string;
  currentUserId: string;
}) {
  const accounts = await getAccounts({ search, role });
  return <AccountTable accounts={accounts} currentUserId={currentUserId} />;
}

export default async function AccountsPage({ searchParams }: PageProps) {
  let session: Awaited<ReturnType<typeof requireRoles>>;
  try {
    session = await requireRoles(["ADMINISTRATOR"]);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage user accounts across all roles.
          </p>
        </div>
        <Button asChild>
          <Link href="/accounts/new">
            <Plus className="size-4" />
            New Account
          </Link>
        </Button>
      </div>

      <Suspense>
        <AccountSearch />
      </Suspense>

      <div className="rounded-lg border bg-white">
        <Suspense
          fallback={
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          }
        >
          <AccountList
            search={params.search}
            role={params.role}
            currentUserId={session.user.id}
          />
        </Suspense>
      </div>
    </div>
  );
}
