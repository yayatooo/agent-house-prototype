import { notFound, redirect } from "next/navigation";
import { BranchForm } from "@/components/dashboard/branch/branch-form";
import { getBranch, updateBranch } from "../../actions";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBranchPage({ params }: PageProps) {
  const { id } = await params;

  let branch: Awaited<ReturnType<typeof getBranch>>;
  try {
    branch = await getBranch(id);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err; // let error.tsx handle it
    throw err;
  }

  if (!branch) notFound();

  const action = async (formData: FormData) => {
    "use server";
    return updateBranch(id, formData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Branch</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update details for <span className="font-medium">{branch.name}</span>.
        </p>
      </div>
      <BranchForm
        action={action}
        title="Branch Details"
        defaultValues={{
          name: branch.name,
          nameVi: branch.nameVi,
          address: branch.address,
          addressVi: branch.addressVi,
          city: branch.city,
          phone: branch.phone,
        }}
      />
    </div>
  );
}
