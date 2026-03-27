import Link from "next/link";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <UserX className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Account not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This account doesn&apos;t exist or may have been deleted.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/accounts">Back to Accounts</Link>
      </Button>
    </div>
  );
}
