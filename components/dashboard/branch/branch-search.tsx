"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export function BranchSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const activeOnly = searchParams.get("activeOnly") === "1";

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search branches…"
          defaultValue={search}
          onChange={(e) => update("search", e.target.value)}
        />
        {search && (
          <button
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => update("search", null)}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button
        variant={activeOnly ? "default" : "outline"}
        size="sm"
        onClick={() => update("activeOnly", activeOnly ? null : "1")}
      >
        {activeOnly && <span className="mr-1.5 size-1.5 rounded-full bg-green-400 inline-block" />}
        Active only
      </Button>
    </div>
  );
}
