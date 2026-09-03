import { prisma } from '@/lib/db/prisma';
import PropertyTypeForm from '@/components/admin/PropertyTypeForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Property Type | Admin Dashboard',
};

export default async function EditPropertyTypePage({ params }: { params: { id: string } }) {
  const propertyType = await prisma.propertyType.findUnique({
    where: { id: params.id, deletedAt: null }
  });

  if (!propertyType) {
    notFound();
  }

  const rootTypes = await prisma.propertyType.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/property-types" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Property Types
        </Link>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Edit Property Type</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Update details for {propertyType.name}.</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <PropertyTypeForm rootTypes={rootTypes} initialData={propertyType} />
      </div>
    </div>
  );
}
