'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigate = (pageNumber: number) => {
    router.push(createPageURL(pageNumber));
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--mv-border)', background: 'var(--mv-bg-surface)' }}>
      <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
        Showing page <span style={{ fontWeight: 600, color: 'var(--mv-text)' }}>{currentPage}</span> of <span style={{ fontWeight: 600, color: 'var(--mv-text)' }}>{totalPages}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => handleNavigate(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            border: '1px solid var(--mv-border)',
            background: currentPage <= 1 ? 'var(--mv-bg)' : 'var(--mv-bg-elevated)',
            color: currentPage <= 1 ? 'var(--mv-text-muted)' : 'var(--mv-text)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => handleNavigate(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            border: '1px solid var(--mv-border)',
            background: currentPage >= totalPages ? 'var(--mv-bg)' : 'var(--mv-bg-elevated)',
            color: currentPage >= totalPages ? 'var(--mv-text-muted)' : 'var(--mv-text)',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
