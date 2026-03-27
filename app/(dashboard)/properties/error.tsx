"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertiesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isForbidden =
    error.name === "ForbiddenError" ||
    error.message.toLowerCase().includes("forbidden") ||
    error.message.toLowerCase().includes("permission");

  const isUnauthorized =
    error.name === "UnauthorizedError" ||
    error.message.toLowerCase().includes("unauthorized");

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShieldX className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Not signed in</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You need to be signed in to access this page.
          </p>
        </div>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShieldX className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Access denied</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You don&apos;t have permission to view this page.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/mainpage">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <TriangleAlert className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/properties">Back to Properties</Link>
        </Button>
      </div>
    </div>
  );
}
