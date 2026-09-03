import { prisma } from '@/lib/db/prisma';
import PropertyForm from '@/components/admin/PropertyForm';

export default async function NewPropertyPage() {
  // Fetch active property types so the admin can select a category
  // We fetch them as a flat list with parent info to render nicely in the select dropdown
  const propertyTypes = await prisma.propertyType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  // Fetch active custom fields (amenities, features)
  const customFields = await prisma.propertyFieldDefinition.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  // Fetch existing locations for autocomplete
  const locationsQuery = await prisma.property.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { approximateLocation: true },
    distinct: ['approximateLocation']
  });
  const rawLocations = locationsQuery.map(l => l.approximateLocation?.trim()).filter(Boolean) as string[];
  const existingLocations = Array.from(new Set(rawLocations.map(loc => loc.toLowerCase()))).map(lowerLoc => rawLocations.find(loc => loc.toLowerCase() === lowerLoc) || '');

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', color: 'var(--mv-text)', marginBottom: '2rem' }}>
        Add New Property
      </h1>
      
      <PropertyForm propertyTypes={propertyTypes} customFields={customFields} existingLocations={existingLocations} />
    </div>
  );
}
