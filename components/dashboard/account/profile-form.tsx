"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/app/(dashboard)/accounts/actions";

type UserRole = "ADMINISTRATOR" | "OFFICE_ADMIN" | "PROPERTY_OWNER" | "SALES";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRATOR: "Administrator",
  OFFICE_ADMIN: "Office Admin",
  PROPERTY_OWNER: "Property Owner",
  SALES: "Sales",
};

interface ProfileFormProps {
  defaultValues: {
    fullName: string;
    fullNameVi?: string | null;
    phone?: string | null;
    avatar?: string | null;
    email: string;
    role: UserRole;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile updated successfully.");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="grid gap-6 max-w-2xl">
      {/* Identity card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={defaultValues.avatar ?? undefined} />
            <AvatarFallback className="text-lg">
              {defaultValues.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{defaultValues.fullName}</p>
            <p className="text-sm text-muted-foreground">{defaultValues.email}</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[defaultValues.role]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="fullName">Full Name (EN)</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  defaultValue={defaultValues.fullName}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="fullNameVi">Full Name (VI)</Label>
                <Input
                  id="fullNameVi"
                  name="fullNameVi"
                  defaultValue={defaultValues.fullNameVi ?? ""}
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaultValues.phone ?? ""}
                placeholder="+84 90 123 4567"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input
                id="avatar"
                name="avatar"
                type="url"
                defaultValue={defaultValues.avatar ?? ""}
                placeholder="https://…"
              />
            </div>

            <div className="pt-1">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
