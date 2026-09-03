'use client';

import { useState } from 'react';
import ServiceRequestModal from '@/components/public/ServiceRequestModal';
import { ArrowUpRight, Wrench, Landmark, Paintbrush, Truck, Scale, Compass, Sparkles, Hammer, Briefcase } from 'lucide-react';

interface ServiceCardProps {
  service: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number | null;
    priceUnit: string | null;
    iconUrl: string | null;
    whatsappNumber: string;
    whatsappMessageTemplate: string;
    providerContacts?: { name: string; number: string }[] | null;
  };
  isRegistered: boolean;
  lang?: string;
}

const translations: Record<string, Record<string, string>> = {
  en: { estimated: 'Estimated', custom: 'Custom', getService: 'Get Service', defaultDescription: 'Professional service to assist you with your real estate journey.' },
  mr: { estimated: 'अंदाजित', custom: 'सानुकूल', getService: 'सेवा घ्या', defaultDescription: 'तुमच्या रिअल इस्टेट प्रवासात मदत करण्यासाठी व्यावसायिक सेवा.' },
};

const getServiceIcon = (name: string, size: number = 24) => {
  const lower = name.toLowerCase();
  if (lower.includes('loan') || lower.includes('finance')) return <Landmark size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('interior') || lower.includes('design')) return <Paintbrush size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('pack') || lower.includes('move')) return <Truck size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('legal') || lower.includes('law') || lower.includes('doc')) return <Scale size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('vastu')) return <Compass size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('clean')) return <Sparkles size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('construct') || lower.includes('renovat') || lower.includes('repair') || lower.includes('plumb')) return <Hammer size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  return <Briefcase size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
};

export default function ServiceCard({ service, isRegistered, lang = 'en' }: ServiceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tr = translations[lang] || translations.en;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .mv-ultra-card {
          background: rgba(15, 15, 20, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 220px;
          height: 100%;
          cursor: pointer;
          transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          overflow: hidden;
          isolation: isolate;
        }

        /* Dynamic Glow Border Effect */
        .mv-ultra-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: conic-gradient(from 180deg at 50% 50%, rgba(245, 197, 24, 0) 0deg, rgba(245, 197, 24, 0.1) 144deg, rgba(245, 197, 24, 0.8) 180deg, rgba(245, 197, 24, 0.1) 216deg, rgba(245, 197, 24, 0) 360deg);
          z-index: -1;
          opacity: 0;
          transition: opacity 500ms ease;
          animation: spin 4s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .mv-ultra-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 23px;
          background: rgba(15, 15, 20, 0.85);
          backdrop-filter: blur(24px);
          z-index: -1;
        }

        .mv-ultra-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(245, 197, 24, 0.15), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        
        .mv-ultra-card:hover::before {
          opacity: 1;
        }

        /* --- RESPONSIVE LAYOUT (Mobile First 2-Col) --- */
        
        .svc-image-box {
          display: block;
          height: 110px;
          width: 100%;
          background: #0f0f13;
          position: relative;
          overflow: hidden;
          border-radius: 18px 18px 0 0;
        }
        
        .svc-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 15, 20, 1) 0%, rgba(15, 15, 20, 0) 60%);
          z-index: 2;
        }
        
        .svc-image-box img.svc-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 700ms cubic-bezier(0.25, 1, 0.5, 1), filter 700ms ease;
          filter: brightness(0.8) contrast(1.1);
          z-index: 1;
          position: relative;
        }
        
        .mv-ultra-card:hover .svc-image-box img.svc-cover {
          transform: scale(1.08) translateY(-5px);
          filter: brightness(1);
        }

        .svc-fallback-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(30,30,35,0.8), rgba(15,15,20,0.9));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 197, 24, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mv-accent);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);
          transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
        }
        
        .svc-fallback-icon svg {
          width: 20px;
          height: 20px;
        }
        
        .mv-ultra-card:hover .svc-fallback-icon {
          transform: translate(-50%, -50%) scale(1.15);
          box-shadow: 0 12px 40px rgba(245, 197, 24, 0.3), inset 0 2px 4px rgba(255,255,255,0.3);
          border-color: rgba(245, 197, 24, 0.8);
          color: #fff;
        }

        .svc-content-box {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          position: relative;
          z-index: 4;
          justify-content: flex-start;
          padding: 0 14px 14px 14px;
          margin-top: -16px;
        }

        .svc-title {
          color: #fff;
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: Outfit, sans-serif;
          line-height: 1.2;
          transition: color 300ms ease;
        }
        
        .mv-ultra-card:hover .svc-title {
          color: #f5c518;
          text-shadow: 0 0 20px rgba(245,197,24,0.3);
        }
        
        .svc-desc {
          color: #a1a1aa;
          font-size: 0.75rem;
          margin: 0;
          line-height: 1.4;
          flex-grow: 1;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .svc-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        
        .svc-price-val {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f5c518;
          font-family: Outfit, sans-serif;
        }
        .svc-price-unit {
          font-size: 0.65rem;
          font-weight: 600;
          color: #71717a;
          margin-left: 2px;
        }

        .svc-arrow {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        
        .svc-arrow svg {
          width: 14px;
          height: 14px;
        }
        
        .mv-ultra-card:hover .svc-arrow {
          background: #f5c518;
          color: #0f172a;
          border-color: #f5c518;
          transform: rotate(45deg) scale(1.1);
          box-shadow: 0 0 20px rgba(245, 197, 24, 0.4);
        }

        /* --- TABLET / DESKTOP UPGRADES --- */
        @media (min-width: 640px) {
          .mv-ultra-card {
            min-height: 380px;
            border-radius: 24px;
          }
          .svc-image-box {
            height: 200px;
            border-radius: 24px 24px 0 0;
          }
          .svc-fallback-icon {
            width: 70px;
            height: 70px;
          }
          .svc-fallback-icon svg {
            width: 24px;
            height: 24px;
          }
          .svc-content-box {
            padding: 0 24px 24px 24px;
            margin-top: -30px;
          }
          .svc-title {
            font-size: 1.35rem;
          }
          .svc-desc {
            font-size: 0.9rem;
            -webkit-line-clamp: 3;
          }
          .svc-price-val { font-size: 1.125rem; }
          .svc-price-unit { font-size: 0.75rem; margin-left: 4px; }
          .svc-arrow { width: 40px; height: 40px; }
          .svc-arrow svg { width: 18px; height: 18px; }
        }
        
        @media (min-width: 1024px) {
          .svc-image-box {
            height: 220px;
          }
          .svc-fallback-icon {
            width: 80px;
            height: 80px;
          }
          .svc-content-box {
            padding: 0 32px 32px 32px;
            margin-top: -40px;
          }
          .svc-title {
            font-size: 1.5rem;
          }
          .svc-price-val { font-size: 1.25rem; }
          .svc-arrow { 
            width: 44px; height: 44px; 
          }
        }
      `}} />

      <div
        className="mv-ultra-card"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Unified Image Box */}
        <div className="svc-image-box">
          <div className="svc-image-overlay" />
          {service.iconUrl ? (
            <img src={service.iconUrl} alt={service.name} className="svc-cover" />
          ) : (
            <div className="svc-fallback-icon">
              {getServiceIcon(service.name, 32)}
            </div>
          )}
        </div>

        {/* Unified Content Box */}
        <div className="svc-content-box">

          <h3 className="svc-title line-clamp-2">
            {service.name}
          </h3>

          <p className="svc-desc line-clamp-2">
            {service.description || tr.defaultDescription}
          </p>

          <div className="svc-bottom" style={{ justifyContent: 'flex-end' }}>
            <div className="svc-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ServiceRequestModal
          service={service}
          isRegistered={isRegistered}
          onClose={() => setIsModalOpen(false)}
          lang={lang as any}
        />
      )}
    </>
  );
}
