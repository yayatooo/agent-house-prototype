"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BranchFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: {
    name?: string;
    nameVi?: string;
    address?: string;
    addressVi?: string;
    city?: string;
    phone?: string | null;
  };
  title: string;
  successMessage?: string;
}

export function BranchForm({
  action,
  defaultValues,
  title,
  successMessage = "Branch saved successfully.",
}: BranchFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        toast.success(successMessage);
        router.push("/branch");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Branch Name (EN)</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={defaultValues?.name}
                placeholder="Ho Chi Minh City Branch"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nameVi">Branch Name (VI)</Label>
              <Input
                id="nameVi"
                name="nameVi"
                required
                defaultValue={defaultValues?.nameVi}
                placeholder="Chi Nhánh TP. Hồ Chí Minh"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="address">Address (EN)</Label>
              <Input
                id="address"
                name="address"
                required
                defaultValue={defaultValues?.address}
                placeholder="123 Nguyen Hue, District 1"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addressVi">Address (VI)</Label>
              <Input
                id="addressVi"
                name="addressVi"
                required
                defaultValue={defaultValues?.addressVi}
                placeholder="123 Nguyễn Huệ, Quận 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                required
                defaultValue={defaultValues?.city}
                placeholder="Ho Chi Minh City"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaultValues?.phone ?? ""}
                placeholder="+84 28 1234 5678"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Branch"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/branch")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
