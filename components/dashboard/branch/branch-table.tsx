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
import { MoreHorizontal, Pencil, Trash2, UserPlus, Power } from "lucide-react";
import { toast } from "sonner";
import { deleteBranch, toggleBranchActive } from "@/app/(dashboard)/branch/actions";
import { AssignAdminDialog } from "./assign-admin-dialog";

interface Branch {
  id: string;
  name: string;
  nameVi: string;
  address: string;
  city: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  admin: { id: string; fullName: string; email: string } | null;
}

interface Admin {
  id: string;
  fullName: string;
  email: string;
  branchId: string | null;
}

interface BranchTableProps {
  branches: Branch[];
  admins: Admin[];
}

export function BranchTable({ branches, admins }: BranchTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [assignTarget, setAssignTarget] = useState<Branch | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteBranch(deleteTarget.id);
      if (result.success) {
        toast.success(`"${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete branch.");
      }
    });
  }

  function handleToggle(branch: Branch) {
    startTransition(async () => {
      const result = await toggleBranchActive(branch.id, !branch.isActive);
      if (result.success) {
        toast.success(
          `"${branch.name}" ${branch.isActive ? "deactivated" : "activated"}.`,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update branch status.");
      }
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Office Admin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No branches found.
              </TableCell>
            </TableRow>
          )}
          {branches.map((branch) => (
            <TableRow key={branch.id} className={!branch.isActive ? "opacity-60" : ""}>
              <TableCell>
                <p className="font-medium">{branch.name}</p>
                <p className="text-xs text-muted-foreground">{branch.nameVi}</p>
              </TableCell>
              <TableCell>{branch.city}</TableCell>
              <TableCell className="text-muted-foreground">
                {branch.phone ?? "—"}
              </TableCell>
              <TableCell>
                {branch.admin ? (
                  <div>
                    <p className="text-sm font-medium">{branch.admin.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {branch.admin.email}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Unassigned
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={branch.isActive ? "default" : "secondary"}>
                  {branch.isActive ? "Active" : "Inactive"}
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
                      onClick={() =>
                        router.push(`/branch/${branch.id}/edit`)
                      }
                    >
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAssignTarget(branch)}
                    >
                      <UserPlus className="size-4" />
                      Assign Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleToggle(branch)}>
                      <Power className="size-4" />
                      {branch.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(branch)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>? All
              assigned users will be unlinked. This cannot be undone.
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

      {/* Assign Admin Dialog */}
      {assignTarget && (
        <AssignAdminDialog
          open={!!assignTarget}
          onOpenChange={(open) => !open && setAssignTarget(null)}
          branchId={assignTarget.id}
          branchName={assignTarget.name}
          currentAdminId={assignTarget.admin?.id}
          admins={admins}
        />
      )}
    </>
  );
}
