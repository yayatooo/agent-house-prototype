"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "OFFICE_ADMIN", label: "Office Admin" },
  { value: "PROPERTY_OWNER", label: "Property Owner" },
  { value: "SALES", label: "Sales" },
];

export function AccountSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";

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
          placeholder="Search by name or email…"
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

      <Select value={role} onValueChange={(v) => update("role", v === "ALL" ? null : v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All roles</SelectItem>
          {ROLE_OPTIONS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(search || role) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            update("search", null);
            update("role", null);
          }}
        >
          <X className="size-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
