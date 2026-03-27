import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Home className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Property not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This property doesn&apos;t exist or may have been deleted.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/properties">Back to Properties</Link>
      </Button>
    </div>
  );
}
