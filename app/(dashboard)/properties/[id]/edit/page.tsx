import { notFound, redirect } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property/property-form";
import { getProperty, updateProperty, getBranchesForSelect } from "../../actions";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;

  let property: Awaited<ReturnType<typeof getProperty>>;
  let branches: Awaited<ReturnType<typeof getBranchesForSelect>>;

  try {
    [property, branches] = await Promise.all([
      getProperty(id),
      getBranchesForSelect(),
    ]);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/login");
    if (err instanceof ForbiddenError) throw err;
    throw err;
  }

  if (!property) notFound();

  const action = async (formData: FormData) => {
    "use server";
    return updateProperty(id, formData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Property</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update details for{" "}
          <span className="font-medium">{property.title}</span>.
        </p>
      </div>
      <PropertyForm
        action={action}
        title="Property Details"
        branches={branches}
        defaultValues={{
          title: property.title,
          titleVi: property.titleVi,
          description: property.description,
          descriptionVi: property.descriptionVi,
          propertyType: property.propertyType,
          transactionType: property.transactionType,
          priceUsd: property.priceUsd,
          priceVnd: String(property.priceVnd),
          rentPriceUsd: property.rentPriceUsd ?? null,
          rentPriceVnd: property.rentPriceVnd ? String(property.rentPriceVnd) : null,
          area: property.area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          floor: property.floor,
          direction: property.direction,
          furnished: property.furnished,
          installmentAvail: property.installmentAvail,
          address: property.address,
          addressVi: property.addressVi,
          province: property.province,
          district: property.district,
          ward: property.ward,
          legalStatus: property.legalStatus,
          legalStatusVi: property.legalStatusVi,
          branchId: property.branchId ?? null,
          images: property.images,
        }}
      />
    </div>
  );
}
