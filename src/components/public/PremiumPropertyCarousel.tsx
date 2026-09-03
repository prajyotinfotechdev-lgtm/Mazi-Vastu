'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';

interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  priceType: string;
  approximateLocation: string | null;
  size: number | null;
  sizeUnit: string | null;
  media: { publicUrl: string; mediaType: string; sortOrder: number }[];
  propertyType: { name: string };
}

interface PremiumPropertyCarouselProps {
  properties: Property[];
  isLocked: boolean;
  lang: string;
  title: string;
  viewAllText: string;
  viewAllLink: string;
}

export default function PremiumPropertyCarousel({
  properties,
  isLocked,
  lang,
  title,
  viewAllText,
  viewAllLink
}: PremiumPropertyCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!properties || properties.length === 0) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % properties.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  const onTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: any) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (-50 > diff) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      style={{
        background: '#0c0c0c',
        borderRadius: '16px',
        padding: '20px 24px 24px',
        border: '1px solid rgba(245, 197, 24, 0.15)',
        margin: '0 auto',
        width: '100%',
        maxWidth: '1200px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .pop-carousel-container {
          position: relative;
          height: 180px; 
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-top: 16px;
        }
        .pop-carousel-card {
          position: absolute;
          width: 80vw;
          max-width: 280px; 
          height: 170px; 
          transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1);
          transform-origin: center center;
          cursor: pointer;
        }
        .pop-carousel-card > div {
          height: 100%;
          border-radius: 16px;
          transition: all 400ms ease;
        }
        .pop-carousel-card.active > div {
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px var(--mv-accent, #f5c518);
          opacity: 1;
        }
        .pop-carousel-card.inactive > div {
          opacity: 0.6;
          pointer-events: none;
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .pop-carousel-card.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
          z-index: 0;
        }
        
        .pop-carousel-nav {
          display: none;
        }

        @media (min-width: 768px) {
          .pop-carousel-container {
            height: 240px;
          }
          .pop-carousel-card {
            max-width: 360px;
            height: 220px;
          }
          .pop-carousel-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 20;
          }
          .pop-carousel-nav:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--mv-accent, #f5c518);
            color: var(--mv-accent, #f5c518);
          }
          .pop-carousel-nav.prev {
            left: 20px;
          }
          .pop-carousel-nav.next {
            right: 20px;
          }
        }
      `}} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
          {title}
        </h2>
        <Link href={viewAllLink} style={{
          color: 'var(--mv-accent, #f5c518)',
          textDecoration: 'none',
          fontSize: '0.9375rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {viewAllText} <ArrowRight size={16} />
        </Link>
      </div>

      {/* Navigation Arrows (Desktop) */}
      <button className="pop-carousel-nav prev" onClick={handlePrev} aria-label="Previous property">
        <ChevronLeft size={24} />
      </button>
      <button className="pop-carousel-nav next" onClick={handleNext} aria-label="Next property">
        <ChevronRight size={24} />
      </button>

      {/* Carousel Track */}
      <div className="pop-carousel-container" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {properties.map((prop, i) => {
          let diff = (i - activeIndex) % properties.length;
          // Shortest path for circular array
          if (diff > properties.length / 2) diff -= properties.length;
          if (-properties.length / 2 > diff) diff += properties.length;

          const isCenter = diff === 0;
          const isVisible = Math.abs(diff) <= 1;

          // Mobile: overlap more (-90%), Desktop: clear separation (-105%)
          const translateX = isCenter ? '0%' : 0 > diff ? 'clamp(-110%, -100% - 10px, -90%)' : 'clamp(90%, 100% + 10px, 110%)';

          const scale = isCenter ? 1 : 0.85;
          const zIndex = isCenter ? 10 : isVisible ? 5 : 0;

          return (
            <div
              key={prop.id}
              className={`pop-carousel-card ${isCenter ? 'active' : isVisible ? 'inactive' : 'hidden'}`}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                zIndex,
              }}
              onClick={() => {
                if (!isCenter && isVisible) {
                  0 > diff ? handlePrev() : handleNext();
                }
              }}
            >
              <div style={{ background: 'var(--mv-bg-surface, #161616)', height: '100%', borderRadius: '16px' }}>
                <PropertyCard property={prop as any} isLocked={isLocked} lang={lang} variant="premium" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
        {properties.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: i === activeIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === activeIndex ? 'var(--mv-accent, #f5c518)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease'
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
