"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./image-uploader";

interface PropertyFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: {
    title?: string;
    titleVi?: string;
    description?: string;
    descriptionVi?: string;
    propertyType?: string;
    transactionType?: string;
    priceUsd?: string;
    priceVnd?: string;
    rentPriceUsd?: string | null;
    rentPriceVnd?: string | null;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    floor?: number | null;
    direction?: string | null;
    furnished?: string | null;
    installmentAvail?: boolean;
    address?: string;
    addressVi?: string;
    province?: string;
    district?: string;
    ward?: string;
    legalStatus?: string;
    legalStatusVi?: string;
    branchId?: string | null;
    images?: string[];
  };
  title: string;
  branches: { id: string; name: string }[];
}

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment / Condo" },
  { value: "HOUSE", label: "House / Villa" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "SHOPHOUSE", label: "Shophouse" },
  { value: "LAND", label: "Land Plot" },
  { value: "COMMERCIAL", label: "Commercial Space" },
  { value: "OFFICETEL", label: "Officetel" },
];

const TRANSACTION_TYPES = [
  { value: "RENT", label: "Rent (Cho thuê)" },
  { value: "SELL", label: "Sell (Bán)" },
  { value: "BOTH", label: "Both (Thuê & Bán)" },
];

const DIRECTIONS = [
  { value: "N", label: "North" },
  { value: "S", label: "South" },
  { value: "E", label: "East" },
  { value: "W", label: "West" },
  { value: "NE", label: "Northeast" },
  { value: "NW", label: "Northwest" },
  { value: "SE", label: "Southeast" },
  { value: "SW", label: "Southwest" },
];

const FURNISHED_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "PARTLY", label: "Partly Furnished" },
  { value: "FULLY", label: "Fully Furnished" },
];

export function PropertyForm({
  action,
  defaultValues,
  title,
  branches,
}: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? []);
  const [transactionType, setTransactionType] = useState<string>(
    defaultValues?.transactionType ?? "SELL",
  );

  const showRentPrices = transactionType === "RENT" || transactionType === "BOTH";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Ensure images are included from state
    formData.set("images", JSON.stringify(images));
    formData.set("transactionType", transactionType);

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        toast.success("Property saved successfully.");
        router.push("/properties");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl">
      {/* ── Section 1: Basic Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Title (EN)</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={defaultValues?.title}
                placeholder="Modern 2BR Apartment in District 2"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="titleVi">Title (VI)</Label>
              <Input
                id="titleVi"
                name="titleVi"
                required
                defaultValue={defaultValues?.titleVi}
                placeholder="Căn hộ 2 phòng ngủ Quận 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description (EN)</Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={defaultValues?.description}
                placeholder="Describe the property in English…"
                rows={4}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="descriptionVi">Description (VI)</Label>
              <Textarea
                id="descriptionVi"
                name="descriptionVi"
                required
                defaultValue={defaultValues?.descriptionVi}
                placeholder="Mô tả bất động sản bằng tiếng Việt…"
                rows={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Property Type</Label>
              <Select
                name="propertyType"
                defaultValue={defaultValues?.propertyType ?? "APARTMENT"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Transaction Type</Label>
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
                name="transactionType"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Details & Pricing ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="area">Area (m²)</Label>
              <Input
                id="area"
                name="area"
                type="number"
                step="0.01"
                min="1"
                required
                defaultValue={defaultValues?.area}
                placeholder="65.5"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                required
                defaultValue={defaultValues?.bedrooms ?? 1}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                required
                defaultValue={defaultValues?.bathrooms ?? 1}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="floor">Floor (optional)</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                min="0"
                defaultValue={defaultValues?.floor ?? ""}
                placeholder="5"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Direction (optional)</Label>
              <Select
                name="direction"
                defaultValue={defaultValues?.direction ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Furnished Status</Label>
              <Select
                name="furnished"
                defaultValue={defaultValues?.furnished ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furnished status" />
                </SelectTrigger>
                <SelectContent>
                  {FURNISHED_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="priceUsd">Sale Price (USD)</Label>
              <Input
                id="priceUsd"
                name="priceUsd"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={defaultValues?.priceUsd}
                placeholder="120000"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceVnd">Sale Price (VND)</Label>
              <Input
                id="priceVnd"
                name="priceVnd"
                type="number"
                min="0"
                required
                defaultValue={defaultValues?.priceVnd}
                placeholder="3000000000"
              />
            </div>
          </div>

          {showRentPrices && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="rentPriceUsd">Monthly Rent (USD)</Label>
                <Input
                  id="rentPriceUsd"
                  name="rentPriceUsd"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={defaultValues?.rentPriceUsd ?? ""}
                  placeholder="600"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rentPriceVnd">Monthly Rent (VND)</Label>
                <Input
                  id="rentPriceVnd"
                  name="rentPriceVnd"
                  type="number"
                  min="0"
                  defaultValue={defaultValues?.rentPriceVnd ?? ""}
                  placeholder="15000000"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="installmentAvail"
              name="installmentAvail"
              type="checkbox"
              value="true"
              defaultChecked={defaultValues?.installmentAvail ?? false}
              className="size-4 rounded"
            />
            <Label htmlFor="installmentAvail" className="cursor-pointer">
              Installment plan available (hỗ trợ trả góp)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Location ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
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

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="province">Province / City</Label>
              <Input
                id="province"
                name="province"
                required
                defaultValue={defaultValues?.province}
                placeholder="Ho Chi Minh City"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                required
                defaultValue={defaultValues?.district}
                placeholder="District 1"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ward">Ward</Label>
              <Input
                id="ward"
                name="ward"
                required
                defaultValue={defaultValues?.ward}
                placeholder="Ben Nghe"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Media & Assignment ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Media & Assignment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-1.5">
            <Label>Property Images</Label>
            <ImageUploader value={images} onChange={setImages} maxFiles={8} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Branch (optional)</Label>
              <Select
                name="branchId"
                defaultValue={defaultValues?.branchId ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No branch assigned" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="legalStatus">Legal Status (EN)</Label>
              <Input
                id="legalStatus"
                name="legalStatus"
                required
                defaultValue={defaultValues?.legalStatus}
                placeholder="Pink Book (Sổ hồng)"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="legalStatusVi">Legal Status (VI)</Label>
              <Input
                id="legalStatusVi"
                name="legalStatusVi"
                required
                defaultValue={defaultValues?.legalStatusVi}
                placeholder="Sổ hồng"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save Property"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/properties")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
