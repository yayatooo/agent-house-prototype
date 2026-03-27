"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "./status-badge";
import { StatusDialog } from "./status-dialog";
import { archiveProperty, deleteProperty } from "@/app/(dashboard)/properties/actions";
import { formatVND } from "@/lib/format";

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

interface Property {
  id: string;
  title: string;
  titleVi: string;
  propertyType: string;
  transactionType: string;
  status: ListingStatus;
  priceVnd: bigint;
  owner: { fullName: string; email: string } | null;
  branch: { id: string; name: string; nameVi: string } | null;
}

interface PropertyTableProps {
  properties: Property[];
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  TOWNHOUSE: "Townhouse",
  SHOPHOUSE: "Shophouse",
  LAND: "Land",
  COMMERCIAL: "Commercial",
  OFFICETEL: "Officetel",
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  RENT: "Rent",
  SELL: "Sell",
  BOTH: "Both",
};

export function PropertyTable({ properties }: PropertyTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [statusTarget, setStatusTarget] = useState<Property | null>(null);

  function handleArchive(p: Property) {
    startTransition(async () => {
      const result = await archiveProperty(p.id);
      if (result.success) {
        toast.success(`"${p.title}" archived.`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to archive property.");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteProperty(deleteTarget.id);
      if (result.success) {
        toast.success(`"${deleteTarget.title}" deleted.`);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete property.");
      }
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price (VND)</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No properties found.
              </TableCell>
            </TableRow>
          )}
          {properties.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <p className="font-medium line-clamp-1">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {p.titleVi}
                </p>
              </TableCell>
              <TableCell className="text-sm">
                {PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType}
              </TableCell>
              <TableCell className="text-sm">
                {TRANSACTION_TYPE_LABELS[p.transactionType] ?? p.transactionType}
              </TableCell>
              <TableCell>
                <StatusBadge status={p.status} />
              </TableCell>
              <TableCell className="text-sm tabular-nums">
                {formatVND(Number(p.priceVnd))} ₫
              </TableCell>
              <TableCell className="text-sm">
                {p.branch ? (
                  <span>{p.branch.name}</span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    —
                  </span>
                )}
              </TableCell>
              <TableCell>
                {p.owner ? (
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {p.owner.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.owner.email}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">—</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/properties/${p.id}`}>
                        <Eye className="size-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/properties/${p.id}/edit`}>
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusTarget(p)}>
                      <RefreshCw className="size-4" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleArchive(p)}>
                      <Archive className="size-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(p)}
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
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.title}</span>? This
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

      {/* Status Dialog */}
      {statusTarget && (
        <StatusDialog
          open={!!statusTarget}
          onOpenChange={(open) => !open && setStatusTarget(null)}
          propertyId={statusTarget.id}
          currentStatus={statusTarget.status}
        />
      )}
    </>
  );
}
