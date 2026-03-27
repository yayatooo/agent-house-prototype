"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAccount,
  toggleAccountActive,
} from "@/app/(dashboard)/accounts/actions";

type UserRole = "ADMINISTRATOR" | "OFFICE_ADMIN" | "PROPERTY_OWNER" | "SALES";

interface Account {
  id: string;
  email: string;
  fullName: string;
  fullNameVi: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  branch: { id: string; name: string } | null;
}

interface AccountTableProps {
  accounts: Account[];
  currentUserId: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRATOR: "Administrator",
  OFFICE_ADMIN: "Office Admin",
  PROPERTY_OWNER: "Property Owner",
  SALES: "Sales",
};

const ROLE_VARIANTS: Record<UserRole, "default" | "secondary" | "outline"> = {
  ADMINISTRATOR: "default",
  OFFICE_ADMIN: "secondary",
  PROPERTY_OWNER: "outline",
  SALES: "outline",
};

export function AccountTable({ accounts, currentUserId }: AccountTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteAccount(deleteTarget.id);
      if (result.success) {
        toast.success(`"${deleteTarget.fullName}" deleted.`);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete account.");
      }
    });
  }

  function handleToggle(account: Account) {
    startTransition(async () => {
      const result = await toggleAccountActive(account.id, !account.isActive);
      if (result.success) {
        toast.success(
          `"${account.fullName}" ${account.isActive ? "deactivated" : "activated"}.`,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update account.");
      }
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No accounts found.
              </TableCell>
            </TableRow>
          )}
          {accounts.map((account) => (
            <TableRow
              key={account.id}
              className={!account.isActive ? "opacity-60" : ""}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={account.avatar ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {account.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{account.fullName}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={ROLE_VARIANTS[account.role]}>
                  {ROLE_LABELS[account.role]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {account.branch?.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {account.phone ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={account.isActive ? "default" : "secondary"}>
                  {account.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" disabled={isPending}>
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/accounts/${account.id}/edit`)}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleToggle(account)}>
                      <Power className="size-4" />
                      {account.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    {account.id !== currentUserId && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(account)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.fullName}</span>? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
