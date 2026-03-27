"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updatePropertyStatus } from "@/app/(dashboard)/properties/actions";

type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "RESERVED"
  | "RENTED"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

const TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["ACTIVE"],
  ACTIVE: ["RESERVED", "ARCHIVED"],
  RESERVED: ["ACTIVE", "RENTED", "SOLD"],
  RENTED: ["ARCHIVED"],
  SOLD: ["ARCHIVED"],
  REJECTED: ["DRAFT"],
  ARCHIVED: [],
};

const STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  ACTIVE: "Active",
  RESERVED: "Reserved",
  RENTED: "Rented",
  SOLD: "Sold",
  ARCHIVED: "Archived",
  REJECTED: "Rejected",
};

interface StatusDialogProps {
  propertyId: string;
  currentStatus: ListingStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatusDialog({
  propertyId,
  currentStatus,
  open,
  onOpenChange,
}: StatusDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatuses = TRANSITIONS[currentStatus] ?? [];
  const [selected, setSelected] = useState<ListingStatus>(
    nextStatuses[0] ?? currentStatus,
  );

  function handleSubmit() {
    startTransition(async () => {
      const result = await updatePropertyStatus(propertyId, selected);
      if (result.success) {
        toast.success(`Status updated to "${STATUS_LABELS[selected]}".`);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update status.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription>
            Current status:{" "}
            <span className="font-medium">
              {STATUS_LABELS[currentStatus]}
            </span>
          </DialogDescription>
        </DialogHeader>

        {nextStatuses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No transitions available from this status.
          </p>
        ) : (
          <div className="flex flex-col gap-2 py-2">
            <Label>Select new status</Label>
            <div className="flex flex-col gap-2">
              {nextStatuses.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={selected === s}
                    onChange={() => setSelected(s)}
                    className="accent-primary"
                  />
                  {STATUS_LABELS[s]}
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || nextStatuses.length === 0}
          >
            {isPending ? "Updating…" : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
