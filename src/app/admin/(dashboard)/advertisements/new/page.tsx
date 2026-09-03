import AdvertisementForm from '@/components/admin/AdvertisementForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Advertisement | Admin Dashboard',
};

export default function NewAdvertisementPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/advertisements" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Advertisements
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--mv-text)', margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>
          Create Advertisement
        </h1>
        <p style={{ color: 'var(--mv-text-secondary)', margin: 0 }}>Set up a new banner or marketing campaign.</p>
      </div>

      <AdvertisementForm />
    </div>
  );
}
