import { prisma } from '@/lib/db/prisma';
import AdvertisementForm from '@/components/admin/AdvertisementForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Advertisement | Admin Dashboard',
};

export default async function EditAdvertisementPage({ params }: { params: { id: string } }) {
  const ad = await prisma.advertisement.findUnique({
    where: { id: params.id, deletedAt: null },
    include: { media: true, placements: true }
  });

  if (!ad) {
    notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/advertisements" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Advertisements
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--mv-text)', margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>
          Edit Advertisement
        </h1>
        <p style={{ color: 'var(--mv-text-secondary)', margin: 0 }}>Update details for {ad.title}.</p>
      </div>

      <AdvertisementForm initialData={ad} />
    </div>
  );
}
