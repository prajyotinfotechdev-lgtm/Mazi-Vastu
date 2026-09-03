import { prisma } from '@/lib/db/prisma';
import PropertyForm from '@/components/admin/PropertyForm';
import { notFound } from 'next/navigation';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      media: true
    }
  });

  if (!property) {
    notFound();
  }

  const propertyTypes = await prisma.propertyType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

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

  // Convert dates and handle metadata parsing if necessary before passing to client
  // Prisma JSON fields can sometimes come as objects, which is fine for our form state
  const initialData = {
    ...property,
    metadata: typeof property.metadata === 'string' ? JSON.parse(property.metadata) : property.metadata || {},
    media: property.media.map(m => ({
      publicId: m.publicId,
      publicUrl: m.publicUrl,
      mediaType: m.mediaType,
      mimeType: m.mimeType
    }))
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', color: 'var(--mv-text)', marginBottom: '2rem' }}>
        Edit Property
      </h1>
      
      <PropertyForm 
        propertyTypes={propertyTypes} 
        customFields={customFields} 
        initialData={initialData} 
        existingLocations={existingLocations}
      />
    </div>
  );
}
