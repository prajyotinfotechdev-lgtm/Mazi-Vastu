'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import PropertyGate from './PropertyGate';

interface UnlockButtonProps {
  propertyId: string;
  label?: string;
}

export default function UnlockButton({ propertyId, label = 'View Details' }: UnlockButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="mv-btn mv-btn-sm mv-btn-accent-outline"
        style={{ marginLeft: '0.5rem' }}
      >
        <Eye size={14} /> {label}
      </button>

      <PropertyGate 
        propertyId={propertyId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
