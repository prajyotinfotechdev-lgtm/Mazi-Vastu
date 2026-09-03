import ServiceForm from '@/components/admin/ServiceForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Add Concierge Service | Admin Dashboard',
};

export default function NewServicePage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Services
        </Link>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Add Concierge Service</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Create a new service offering for your public website.</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <ServiceForm />
      </div>
    </div>
  );
}
