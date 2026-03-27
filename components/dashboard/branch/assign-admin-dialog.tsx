"use client";

import { useTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { assignOfficeAdmin } from "@/app/(dashboard)/branch/actions";

interface Admin {
  id: string;
  fullName: string;
  email: string;
  branchId: string | null;
}

interface AssignAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  currentAdminId?: string;
  admins: Admin[];
}

export function AssignAdminDialog({
  open,
  onOpenChange,
  branchId,
  branchName,
  currentAdminId,
  admins,
}: AssignAdminDialogProps) {
  const [selectedId, setSelectedId] = useState(currentAdminId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!selectedId) return;
    const admin = admins.find((a) => a.id === selectedId);
    startTransition(async () => {
      const result = await assignOfficeAdmin(branchId, selectedId);
      if (result.success) {
        toast.success(`${admin?.fullName ?? "Admin"} assigned to ${branchName}.`);
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Failed to assign admin.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Office Admin</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Assign an Office Admin to <span className="font-medium">{branchName}</span>.
        </p>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an admin…" />
          </SelectTrigger>
          <SelectContent>
            {admins.map((admin) => (
              <SelectItem key={admin.id} value={admin.id}>
                <span className="font-medium">{admin.fullName}</span>
                <span className="text-muted-foreground ml-1.5 text-xs">
                  {admin.email}
                  {admin.branchId && admin.branchId !== branchId
                    ? " · assigned elsewhere"
                    : ""}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || !selectedId}>
            {isPending ? "Saving…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
