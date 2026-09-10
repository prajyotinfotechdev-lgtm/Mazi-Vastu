'use client';

import { Flame, Key, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  location: string;
}

export default function LocationCategoryPicker({ location }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--mv-bg)', paddingBottom: '4rem' }}>
      <style>{`
        .lcp-wrapper {
          max-width: 680px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .lcp-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--mv-text-secondary);
          font-size: 0.875rem;
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 0.2s;
          font-family: Outfit, sans-serif;
        }
        .lcp-back:hover { color: var(--mv-accent); }

        .lcp-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .lcp-location-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 197, 24, 0.12);
          border: 1px solid rgba(245, 197, 24, 0.3);
          border-radius: 50px;
          padding: 6px 16px;
          color: var(--mv-accent);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: Outfit, sans-serif;
          margin-bottom: 1rem;
        }
        .lcp-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--mv-text);
          font-family: Outfit, sans-serif;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }
        .lcp-subtitle {
          color: var(--mv-text-secondary);
          font-size: 0.9375rem;
          margin: 0;
        }

        .lcp-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
        @media (max-width: 480px) {
          .lcp-cards { grid-template-columns: 1fr; gap: 0.875rem; }
          .lcp-title { font-size: 1.375rem; }
        }

        .lcp-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2.5rem 1.5rem;
          border-radius: 20px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      box-shadow 0.3s ease;
          cursor: pointer;
          text-align: center;
        }
        .lcp-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .lcp-card:hover {
          transform: translateY(-6px) scale(1.02);
        }
        .lcp-card:hover::before { opacity: 1; }

        .lcp-card-urgent {
          background: linear-gradient(145deg, rgba(25, 15, 5, 0.97), rgba(15, 8, 2, 0.97));
          border: 1px solid rgba(251, 146, 60, 0.25);
          box-shadow: 0 8px 32px rgba(251, 146, 60, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .lcp-card-urgent::before {
          background: radial-gradient(circle at center, rgba(251, 146, 60, 0.12) 0%, transparent 70%);
        }
        .lcp-card-urgent:hover {
          border-color: rgba(251, 146, 60, 0.5);
          box-shadow: 0 20px 48px rgba(251, 146, 60, 0.18), 0 0 24px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .lcp-card-rent {
          background: linear-gradient(145deg, rgba(5, 15, 30, 0.97), rgba(2, 8, 20, 0.97));
          border: 1px solid rgba(99, 179, 237, 0.2);
          box-shadow: 0 8px 32px rgba(99, 179, 237, 0.06), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .lcp-card-rent::before {
          background: radial-gradient(circle at center, rgba(99, 179, 237, 0.1) 0%, transparent 70%);
        }
        .lcp-card-rent:hover {
          border-color: rgba(99, 179, 237, 0.45);
          box-shadow: 0 20px 48px rgba(99, 179, 237, 0.15), 0 0 24px rgba(99, 179, 237, 0.08), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .lcp-card-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .lcp-card:hover .lcp-card-icon { transform: scale(1.12); }

        .lcp-card-icon-urgent {
          background: radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.05) 100%);
          border: 1px solid rgba(251, 146, 60, 0.3);
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.15);
        }
        .lcp-card-icon-rent {
          background: radial-gradient(circle, rgba(99, 179, 237, 0.2) 0%, rgba(99, 179, 237, 0.05) 100%);
          border: 1px solid rgba(99, 179, 237, 0.3);
          box-shadow: 0 0 20px rgba(99, 179, 237, 0.12);
        }

        .lcp-card-label {
          font-size: 1.25rem;
          font-weight: 800;
          font-family: Outfit, sans-serif;
          position: relative;
          z-index: 1;
          line-height: 1.2;
        }
        .lcp-card-label-urgent { color: #fb923c; }
        .lcp-card-label-rent   { color: #63b3ed; }

        .lcp-card-desc {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: var(--mv-text-secondary);
          position: relative;
          z-index: 1;
          max-width: 180px;
          margin: 0;
        }

        .lcp-card-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          margin-top: 0.25rem;
          transition: transform 0.2s ease;
        }
        .lcp-card:hover .lcp-card-arrow { transform: translateX(4px); }
        .lcp-card-arrow-urgent { background: rgba(251, 146, 60, 0.1); color: #fb923c; }
        .lcp-card-arrow-rent   { background: rgba(99, 179, 237, 0.1); color: #63b3ed; }
      `}</style>

      <div className="mv-inner-header-bg">
        <div className="lcp-wrapper" style={{ paddingTop: 0 }}>
          <Link href="/properties" className="lcp-back">
            <ArrowLeft size={15} />
            Back to all properties
          </Link>

          <div className="lcp-header">
            <div className="lcp-location-badge">
              <MapPin size={13} />
              {location}
            </div>
            <h1 className="lcp-title">What are you looking for?</h1>
            <p className="lcp-subtitle">Choose a category to view available properties</p>
          </div>
        </div>
      </div>

      <div className="lcp-wrapper" style={{ marginTop: '1.5rem' }}>
        <div className="lcp-cards">

          {/* Urgent Property */}
          <Link
            href={`/properties?location=${encodeURIComponent(location)}&category=urgent`}
            className="lcp-card lcp-card-urgent"
          >
            <div className="lcp-card-icon lcp-card-icon-urgent">
              <Flame size={32} color="#fb923c" />
            </div>
            <div className="lcp-card-label lcp-card-label-urgent">Urgent Property</div>
            <p className="lcp-card-desc">
              Properties that need to be sold urgently at competitive prices
            </p>
            <div className="lcp-card-arrow lcp-card-arrow-urgent">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

          {/* Rent Property */}
          <Link
            href={`/properties?location=${encodeURIComponent(location)}&category=rent`}
            className="lcp-card lcp-card-rent"
          >
            <div className="lcp-card-icon lcp-card-icon-rent">
              <Key size={32} color="#63b3ed" />
            </div>
            <div className="lcp-card-label lcp-card-label-rent">Rent Property</div>
            <p className="lcp-card-desc">
              Properties available for monthly rental in this location
            </p>
            <div className="lcp-card-arrow lcp-card-arrow-rent">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#63b3ed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
