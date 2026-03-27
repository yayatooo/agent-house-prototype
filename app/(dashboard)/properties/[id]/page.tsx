import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Home,
  Pencil,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Building2,
  User,
  Tag,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/property/status-badge";
import { getProperty } from "../actions";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";
import { formatVND } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House / Villa",
  TOWNHOUSE: "Townhouse",
  SHOPHOUSE: "Shophouse",
  LAND: "Land Plot",
  COMMERCIAL: "Commercial Space",
  OFFICETEL: "Officetel",
};

const TRANSACTION_LABELS: Record<string, string> = {
  RENT: "For Rent",
  SELL: "For Sale",
  BOTH: "For Rent & Sale",
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  let property: Awaited<ReturnType<typeof getProperty>>;
  try {
    property = await getProperty(id);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  if (!property) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="text-sm text-muted-foreground">{property.titleVi}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/properties/${id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Image Gallery */}
      {property.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
          {property.images.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`Property image ${i + 1}`}
              className="aspect-video w-full object-cover rounded-md border"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Home className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium">Type:</span>
              <span>{PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium">Transaction:</span>
              <span>{TRANSACTION_LABELS[property.transactionType] ?? property.transactionType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium">Area:</span>
              <span>{property.area} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium">Bedrooms:</span>
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium">Bathrooms:</span>
              <span>{property.bathrooms}</span>
            </div>
            {property.floor != null && (
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium">Floor:</span>
                <span>{property.floor}</span>
              </div>
            )}
            {property.furnished && (
              <div className="flex items-center gap-2">
                <Home className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium">Furnished:</span>
                <span>{property.furnished}</span>
              </div>
            )}
            {property.installmentAvail && (
              <div>
                <Badge variant="outline" className="text-xs">
                  Installment Available
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Sale Price</p>
              <p className="font-semibold text-base">
                {formatVND(Number(property.priceVnd))} ₫
              </p>
              <p className="text-xs text-muted-foreground">
                ${Number(property.priceUsd).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            {property.rentPriceVnd && (
              <div>
                <p className="text-muted-foreground text-xs">Monthly Rent</p>
                <p className="font-semibold text-base">
                  {formatVND(Number(property.rentPriceVnd))} ₫ / mo
                </p>
                {property.rentPriceUsd && (
                  <p className="text-xs text-muted-foreground">
                    ${Number(property.rentPriceUsd).toLocaleString("en-US", { minimumFractionDigits: 2 })} / mo
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Legal Status</p>
              <p>{property.legalStatus}</p>
              <p className="text-xs text-muted-foreground">{property.legalStatusVi}</p>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p>{property.address}</p>
                <p className="text-muted-foreground">{property.addressVi}</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              {property.ward}, {property.district}, {property.province}
            </p>
          </CardContent>
        </Card>

        {/* People Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Owner & Branch
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {property.owner && (
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{property.owner.fullName}</p>
                  <p className="text-xs text-muted-foreground">{property.owner.email}</p>
                </div>
              </div>
            )}
            {property.branch ? (
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{property.branch.name}</p>
                  <p className="text-xs text-muted-foreground">{property.branch.nameVi}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic text-xs">No branch assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description (EN)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{property.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mô tả (VI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{property.descriptionVi}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
