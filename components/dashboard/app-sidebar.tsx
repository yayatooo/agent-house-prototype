import * as React from "react";
import { auth } from "@/lib/auth";
import { AccountService } from "@/app/(dashboard)/accounts/services/account.service";
import { AppSidebarClient } from "./app-sidebar-client";
import { Sidebar } from "@/components/ui/sidebar";

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = await auth();
  const dbUser = session?.user?.id
    ? await AccountService.getById(session.user.id)
    : null;

  const user = {
    name: dbUser?.fullName ?? session?.user?.name ?? "Unknown",
    email: dbUser?.email ?? session?.user?.email ?? "",
    avatar: dbUser?.avatar ?? "",
  };

  return <AppSidebarClient user={user} {...props} />;
}
