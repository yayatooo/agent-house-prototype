import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  ACTIVE: {
    label: "Active",
    variant: "default",
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  RESERVED: {
    label: "Reserved",
    variant: "default",
    className: "bg-yellow-500 text-white hover:bg-yellow-600",
  },
  RENTED: {
    label: "Rented",
    variant: "default",
    className: "bg-blue-600 text-white hover:bg-blue-700",
  },
  SOLD: {
    label: "Sold",
    variant: "default",
    className: "bg-purple-600 text-white hover:bg-purple-700",
  },
  ARCHIVED: { label: "Archived", variant: "secondary" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
