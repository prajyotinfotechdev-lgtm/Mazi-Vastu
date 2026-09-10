'use client';

import { Flame, Key, MapPin, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  location: string;
}

export default function LocationCategoryPicker({ location }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--mv-bg)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)',
    }}>
      <style>{`
        /* ── Page shell ───────────────────────────────────── */
        .lcp-page {
          max-width: 560px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* ── Top bar ──────────────────────────────────────── */
        .lcp-topbar {
          display: flex;
          align-items: center;
          padding: 1rem 0 0.5rem;
        }
        .lcp-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--mv-text-secondary);
          font-size: 0.8125rem;
          text-decoration: none;
          font-family: Outfit, sans-serif;
          padding: 8px 0;           /* bigger tap target */
          transition: color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .lcp-back:active { color: var(--mv-accent); }

        /* ── Hero header ──────────────────────────────────── */
        .lcp-hero {
          text-align: center;
          padding: 1.5rem 0 1.75rem;
        }
        .lcp-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(245, 197, 24, 0.1);
          border: 1px solid rgba(245, 197, 24, 0.28);
          border-radius: 999px;
          padding: 5px 14px;
          color: var(--mv-accent);
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: Outfit, sans-serif;
          margin-bottom: 0.875rem;
          letter-spacing: 0.01em;
        }
        .lcp-title {
          font-size: clamp(1.25rem, 5vw, 1.75rem);
          font-weight: 800;
          color: var(--mv-text);
          font-family: Outfit, sans-serif;
          margin: 0 0 0.375rem;
          line-height: 1.15;
        }
        .lcp-subtitle {
          color: var(--mv-text-secondary);
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        /* ── Card grid: row on mobile, cols on desktop ────── */
        .lcp-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        @media (min-width: 560px) {
          .lcp-cards {
            flex-direction: row;
            gap: 1rem;
          }
        }

        /* ── Base card ────────────────────────────────────── */
        .lcp-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.125rem 1.25rem;
          border-radius: 18px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      box-shadow 0.25s ease,
                      border-color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          /* Full-width touch target */
          width: 100%;
          min-height: 84px;
        }

        /* Glow overlay */
        .lcp-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }

        /* Desktop hover */
        @media (hover: hover) {
          .lcp-card:hover {
            transform: translateY(-4px);
          }
          .lcp-card:hover::before { opacity: 1; }
          .lcp-card:hover .lcp-chevron { transform: translateX(3px); }
        }

        /* Mobile active/pressed state */
        .lcp-card:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        /* ── Urgent card ──────────────────────────────────── */
        .lcp-card-urgent {
          background: linear-gradient(135deg, rgba(30, 15, 5, 0.98), rgba(20, 10, 3, 0.98));
          border: 1px solid rgba(251, 146, 60, 0.22);
          box-shadow: 0 4px 24px rgba(251, 146, 60, 0.06), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .lcp-card-urgent::before {
          background: radial-gradient(ellipse at 20% 50%, rgba(251, 146, 60, 0.1) 0%, transparent 60%);
        }
        @media (hover: hover) {
          .lcp-card-urgent:hover {
            border-color: rgba(251, 146, 60, 0.45);
            box-shadow: 0 12px 40px rgba(251, 146, 60, 0.14), inset 0 1px 0 rgba(255,255,255,0.06);
          }
        }

        /* ── Rent card ────────────────────────────────────── */
        .lcp-card-rent {
          background: linear-gradient(135deg, rgba(5, 15, 32, 0.98), rgba(3, 10, 22, 0.98));
          border: 1px solid rgba(99, 179, 237, 0.18);
          box-shadow: 0 4px 24px rgba(99, 179, 237, 0.05), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .lcp-card-rent::before {
          background: radial-gradient(ellipse at 20% 50%, rgba(99, 179, 237, 0.09) 0%, transparent 60%);
        }
        @media (hover: hover) {
          .lcp-card-rent:hover {
            border-color: rgba(99, 179, 237, 0.4);
            box-shadow: 0 12px 40px rgba(99, 179, 237, 0.12), inset 0 1px 0 rgba(255,255,255,0.06);
          }
        }

        /* ── Icon bubble ──────────────────────────────────── */
        .lcp-icon {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: transform 0.25s ease;
        }
        @media (hover: hover) {
          .lcp-card:hover .lcp-icon { transform: scale(1.08); }
        }
        .lcp-icon-urgent {
          background: rgba(251, 146, 60, 0.12);
          border: 1px solid rgba(251, 146, 60, 0.25);
        }
        .lcp-icon-rent {
          background: rgba(99, 179, 237, 0.12);
          border: 1px solid rgba(99, 179, 237, 0.22);
        }

        /* ── Text block ───────────────────────────────────── */
        .lcp-text {
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }
        .lcp-card-label {
          font-size: 1rem;
          font-weight: 800;
          font-family: Outfit, sans-serif;
          line-height: 1.2;
          margin: 0 0 3px;
        }
        .lcp-card-label-urgent { color: #fb923c; }
        .lcp-card-label-rent   { color: #63b3ed; }

        .lcp-card-desc {
          font-size: 0.75rem;
          line-height: 1.4;
          color: var(--mv-text-secondary);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Chevron ──────────────────────────────────────── */
        .lcp-chevron {
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: transform 0.2s ease;
        }

        /* ── Divider between cards (mobile only) ──────────── */
        @media (max-width: 559px) {
          .lcp-divider {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--mv-text-secondary);
            font-size: 0.6875rem;
            font-family: Outfit, sans-serif;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .lcp-divider::before,
          .lcp-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255,255,255,0.07);
          }
        }
        @media (min-width: 560px) {
          .lcp-divider { display: none; }
          /* On desktop, make cards equal height */
          .lcp-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 1.75rem 1.5rem;
            flex: 1;
          }
          .lcp-icon {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            margin-bottom: 0.25rem;
          }
          .lcp-card-label { font-size: 1.125rem; margin-bottom: 6px; }
          .lcp-card-desc { -webkit-line-clamp: 3; font-size: 0.8125rem; }
          .lcp-chevron { margin-top: 0.75rem; }
        }

        /* ── Bottom hint ──────────────────────────────────── */
        .lcp-hint {
          text-align: center;
          color: var(--mv-text-secondary);
          font-size: 0.75rem;
          font-family: Outfit, sans-serif;
          margin-top: 1.5rem;
          opacity: 0.65;
        }
      `}</style>

      {/* Top bar with back link */}
      <div className="lcp-page">
        <div className="lcp-topbar">
          <Link href="/properties" className="lcp-back">
            <ArrowLeft size={14} />
            All Properties
          </Link>
        </div>

        {/* Hero */}
        <div className="lcp-hero">
          <div className="lcp-location-pill">
            <MapPin size={12} />
            {location}
          </div>
          <h1 className="lcp-title">What are you looking for?</h1>
          <p className="lcp-subtitle">Select a category to see matching listings</p>
        </div>

        {/* Cards */}
        <div className="lcp-cards">

          {/* Urgent Property */}
          <Link
            href={`/properties?location=${encodeURIComponent(location)}&category=urgent`}
            className="lcp-card lcp-card-urgent"
          >
            <div className="lcp-icon lcp-icon-urgent">
              <Flame size={26} color="#fb923c" />
            </div>
            <div className="lcp-text">
              <p className="lcp-card-label lcp-card-label-urgent">Urgent Property</p>
              <p className="lcp-card-desc">
                Properties listed for urgent sale at competitive prices
              </p>
            </div>
            <ChevronRight size={18} color="#fb923c" className="lcp-chevron" />
          </Link>

          <div className="lcp-divider">or</div>

          {/* Rent Property */}
          <Link
            href={`/properties?location=${encodeURIComponent(location)}&category=rent`}
            className="lcp-card lcp-card-rent"
          >
            <div className="lcp-icon lcp-icon-rent">
              <Key size={26} color="#63b3ed" />
            </div>
            <div className="lcp-text">
              <p className="lcp-card-label lcp-card-label-rent">Rent Property</p>
              <p className="lcp-card-desc">
                Properties available for monthly rental in this area
              </p>
            </div>
            <ChevronRight size={18} color="#63b3ed" className="lcp-chevron" />
          </Link>

        </div>

        <p className="lcp-hint">Tap a category to view listings</p>
      </div>
    </div>
  );
}
