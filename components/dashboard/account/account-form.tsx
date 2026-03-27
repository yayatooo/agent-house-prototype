"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Branch {
  id: string;
  name: string;
}

interface AccountFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: {
    email?: string;
    fullName?: string;
    fullNameVi?: string;
    phone?: string;
    role?: string;
    branchId?: string | null;
  };
  branches: Branch[];
  isEdit?: boolean;
  successMessage?: string;
}

const ROLE_OPTIONS = [
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "OFFICE_ADMIN", label: "Office Admin" },
  { value: "PROPERTY_OWNER", label: "Property Owner" },
  { value: "SALES", label: "Sales" },
];

export function AccountForm({
  action,
  defaultValues,
  branches,
  isEdit = false,
  successMessage = "Account saved successfully.",
}: AccountFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Treat the sentinel "none" as no branch selected
    if (formData.get("branchId") === "none") formData.set("branchId", "");
    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        toast.success(successMessage);
        router.push("/accounts");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          {/* Email — readonly on edit */}
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required={!isEdit}
              readOnly={isEdit}
              defaultValue={defaultValues?.email}
              placeholder="user@example.com"
              className={isEdit ? "bg-muted cursor-not-allowed" : ""}
            />
          </div>

          {/* Password — only on create */}
          {!isEdit && (
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Full Name (EN)</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                defaultValue={defaultValues?.fullName}
                placeholder="Nguyen Van A"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fullNameVi">Full Name (VI)</Label>
              <Input
                id="fullNameVi"
                name="fullNameVi"
                defaultValue={defaultValues?.fullNameVi}
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaultValues?.phone ?? ""}
                placeholder="+84 90 123 4567"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={defaultValues?.role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role…" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="branchId">Branch (optional)</Label>
            <Select
              name="branchId"
              defaultValue={defaultValues?.branchId ?? "none"}
            >
              <SelectTrigger id="branchId">
                <SelectValue placeholder="No branch assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No branch</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/accounts")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
