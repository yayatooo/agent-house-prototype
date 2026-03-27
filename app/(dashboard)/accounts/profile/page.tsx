import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/account/profile-form";
import { AccountService } from "../services/account.service";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guard";

export default async function ProfilePage() {
  let userId: string;
  try {
    const session = await requireAuth();
    userId = session.user.id;
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    throw err;
  }

  const user = await AccountService.getById(userId);
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal information.
        </p>
      </div>
      <ProfileForm
        defaultValues={{
          fullName: user.fullName,
          fullNameVi: user.fullNameVi,
          phone: user.phone,
          avatar: user.avatar,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  );
}
