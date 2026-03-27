import { notFound, redirect } from "next/navigation";
import { AccountForm } from "@/components/dashboard/account/account-form";
import { getAccount, updateAccount, getBranchesForSelect } from "../../actions";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAccountPage({ params }: PageProps) {
  const { id } = await params;

  let account: Awaited<ReturnType<typeof getAccount>>;
  let branches: Awaited<ReturnType<typeof getBranchesForSelect>>;

  try {
    [account, branches] = await Promise.all([
      getAccount(id),
      getBranchesForSelect(),
    ]);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  if (!account) notFound();

  const action = async (formData: FormData) => {
    "use server";
    return updateAccount(id, formData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Account</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update details for{" "}
          <span className="font-medium">{account.fullName}</span>.
        </p>
      </div>
      <AccountForm
        action={action}
        branches={branches}
        isEdit
        defaultValues={{
          email: account.email,
          fullName: account.fullName,
          fullNameVi: account.fullNameVi ?? undefined,
          phone: account.phone ?? undefined,
          role: account.role,
          branchId: account.branch?.id ?? null,
        }}
        successMessage="Account updated successfully."
      />
    </div>
  );
}
