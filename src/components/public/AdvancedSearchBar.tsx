'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CustomCategorySelect from '@/components/public/CustomCategorySelect';
import { t } from '@/lib/i18n/translate';

interface PropertyType {
  id: string;
  name: string;
  parentId: string | null;
}

interface AdvancedSearchBarProps {
  propertyTypes: PropertyType[];
  uniqueLocations: string[];
  lang: string;
  initialQuery?: string;
  initialType?: string;
  initialLocation?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
}

export default function AdvancedSearchBar({
  propertyTypes,
  uniqueLocations,
  lang,
  initialQuery = '',
  initialType = '',
  initialLocation = '',
  initialMinPrice = '',
  initialMaxPrice = ''
}: AdvancedSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [location, setLocation] = useState(initialLocation);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'min' | 'max' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBudget = (value: string | number) => {
    const num = Number(value);
    if (isNaN(num)) return '';
    if (num === 0) return '0';
    const lakhStr = lang === 'mr' ? 'लाख' : 'Lakh';
    const crStr = lang === 'mr' ? 'कोटी' : 'Cr';
    const kStr = 'K';
    
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2).replace(/\.00$/, '') + ' ' + crStr;
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(2).replace(/\.00$/, '') + ' ' + lakhStr;
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2).replace(/\.00$/, '') + ' ' + kStr;
    }
    return num.toString();
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    
    let searchType = typeFilter;
    if (e && e.target instanceof HTMLFormElement) {
      const formData = new FormData(e.target);
      const typeVal = formData.get('type') as string;
      if (typeVal !== null) {
         searchType = typeVal;
      }
    }

    if (searchType) params.set('type', searchType);
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    setIsFilterModalOpen(false);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <>
      <style>{`
        .mv-properties-filter-container {
          background: var(--mv-bg-elevated);
          padding: 4px 4px 4px 12px;
          border-radius: 999px;
          box-shadow: var(--mv-shadow-lg);
          border: 1px solid var(--mv-border);
          margin: 0 auto;
          max-width: 650px;
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) {
          .mv-properties-filter-container {
            padding: 6px 6px 6px 16px;
          }
        }
        .mv-properties-filter-container:focus-within {
          border-color: var(--mv-accent);
          box-shadow: 0 4px 24px rgba(245, 197, 24, 0.15);
        }
        .mv-properties-filter-form {
          display: flex;
          width: 100%;
          gap: 2px;
          flex-direction: row;
          align-items: center;
        }
        @media (min-width: 768px) {
          .mv-properties-filter-form {
            gap: 4px;
          }
        }
        .mv-properties-filter-input-wrapper {
          position: relative; 
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 0;
          background: transparent;
          border-radius: 0;
          padding: 0;
        }
        .mv-properties-filter-input,
        .mv-properties-filter-select {
          width: 100%;
          padding: 6px 4px 6px 20px;
          background: transparent !important;
          border: none !important;
          color: var(--mv-text);
          font-size: 0.75rem;
          outline: none;
          text-overflow: ellipsis;
        }
        @media (min-width: 768px) {
          .mv-properties-filter-input,
          .mv-properties-filter-select {
             padding: 8px 14px 8px 32px;
             font-size: 0.9375rem;
          }
        }
        .mv-properties-filter-btn {
          padding: 8px 12px;
          font-size: 0.75rem;
          border-radius: 999px;
          width: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .mv-properties-filter-btn {
             padding: 12px 32px;
             font-size: 0.9375rem;
          }
        }
        .mv-filter-icon-btn {
          background: var(--mv-bg-surface);
          border: 1px solid var(--mv-border);
          border-radius: 999px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--mv-text);
          transition: all 0.2s ease;
          margin-left: 2px;
        }
        .mv-filter-icon-btn:hover {
          background: var(--mv-accent);
          color: #000;
          border-color: var(--mv-accent);
        }
        @media (min-width: 768px) {
          .mv-filter-icon-btn {
             padding: 10px;
             margin-left: 4px;
          }
        }
        .mv-filter-icon {
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .mv-filter-icon {
             left: 4px;
             width: 18px;
             height: 18px;
          }
        }
        .mv-divider {
          display: block;
          width: 1px;
          height: 18px;
          background: var(--mv-border);
          margin: 0 2px;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .mv-divider {
            height: 24px;
            margin: 0 4px;
          }
        }
        
        .dual-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--mv-accent);
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .dual-slider::-moz-range-thumb {
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--mv-accent);
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
      
      <div className="mv-properties-filter-container">
        <form onSubmit={handleSearch} className="mv-properties-filter-form">
          <div className="mv-properties-filter-input-wrapper">
            <Search className="mv-filter-icon" color="var(--mv-text-muted)" />
            <input 
              type="text" 
              name="q" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'mr' ? 'कुठे शोधायचे?' : 'Where to?'}
              className="mv-properties-filter-input"
            />
          </div>
          
          <div className="mv-divider"></div>
          
          <div className="mv-properties-filter-input-wrapper">
            <CustomCategorySelect 
              categories={propertyTypes as any} 
              defaultValue={typeFilter} 
              allText={t('properties.allCategories', lang as any) || "All Categories"} 
              lang={lang} 
            />
          </div>

          <button 
            type="button" 
            className="mv-filter-icon-btn" 
            onClick={() => setIsFilterModalOpen(true)}
            title="Advanced Filters"
          >
            <SlidersHorizontal size={18} />
          </button>

          <button type="submit" className="mv-btn mv-btn-primary mv-properties-filter-btn">
            {t('properties.searchButton', lang as any)}
          </button>
        </form>
      </div>

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(12px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(30,30,30,0.95), rgba(15,15,15,0.98))',
            width: '100%', maxWidth: '420px', borderRadius: '24px', padding: '32px 24px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 32px rgba(245, 197, 24, 0.08)',
            border: '1px solid rgba(255,255,255,0.05)', borderTop: '2px solid var(--mv-accent)',
            animation: 'slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <style>{`
              @keyframes slideUpModal {
                from { transform: translateY(30px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .mv-advanced-input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(0,0,0,0.4) !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                border-radius: 12px;
                color: var(--mv-text);
                font-size: 1rem;
                outline: none;
                transition: all 0.3s ease;
              }
              .mv-advanced-input:focus, .mv-advanced-input:hover {
                border-color: var(--mv-accent) !important;
                background: rgba(0,0,0,0.6) !important;
                box-shadow: 0 0 0 4px rgba(245, 197, 24, 0.1);
              }
              .mv-advanced-btn-secondary {
                flex: 1; padding: 14px; border-radius: 12px;
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                color: var(--mv-text); cursor: pointer; font-weight: 600;
                transition: all 0.3s ease;
              }
              .mv-advanced-btn-secondary:hover {
                background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);
              }
              .mv-advanced-btn-primary {
                flex: 2; padding: 14px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700;
                background: linear-gradient(135deg, var(--mv-accent, #f5c518), #d49a00);
                color: #000; box-shadow: 0 4px 12px rgba(245, 197, 24, 0.3);
                transition: all 0.3s ease;
              }
              .mv-advanced-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(245, 197, 24, 0.4);
              }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--mv-text)' }}>
                {lang === 'mr' ? 'प्रगत फिल्टर' : 'Advanced Filters'}
              </h2>
              <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mv-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Location Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--mv-text-secondary)', marginBottom: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {lang === 'mr' ? 'ठिकाण' : 'Location'}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mv-advanced-input"
                style={{ cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23F5C518%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto' }}
              >
                <option value="" style={{ background: 'var(--mv-bg)' }}>{lang === 'mr' ? 'सर्व ठिकाणे' : 'All Locations'}</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc} style={{ background: 'var(--mv-bg)' }}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Budget Filter */}
            <div style={{ marginBottom: '40px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--mv-text-secondary)', marginBottom: '20px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {lang === 'mr' ? 'बजेट (₹)' : 'Budget (₹)'}
              </label>

              {/* Range Slider Track */}
              <div style={{ position: 'relative', height: '24px', marginBottom: '16px', padding: '0 10px' }}>
                {/* Background Track */}
                <div style={{ position: 'absolute', left: '10px', right: '10px', height: '4px', background: 'var(--mv-border)', top: '10px', borderRadius: '4px' }}></div>
                
                {/* Active Track */}
                <div style={{ 
                  position: 'absolute', 
                  height: '4px', 
                  background: 'var(--mv-accent)', 
                  top: '10px', 
                  borderRadius: '4px', 
                  left: `calc(10px + ${(Number(minPrice) || 0) / 100000000 * 100}% - ${(Number(minPrice) || 0) / 100000000 * 20}px)`, 
                  right: `calc(10px + ${100 - ((Number(maxPrice) || 100000000) / 100000000 * 100)}% - ${(100 - ((Number(maxPrice) || 100000000) / 100000000 * 100)) / 100 * 20}px)` 
                }}></div>

                <input
                  type="range"
                  min={0}
                  max={100000000}
                  step={500000}
                  value={minPrice || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!maxPrice || val <= parseInt(maxPrice)) setMinPrice(val.toString());
                  }}
                  style={{ position: 'absolute', width: 'calc(100% - 20px)', left: '10px', top: '2px', WebkitAppearance: 'none', background: 'transparent', pointerEvents: 'none' }}
                  className="dual-slider"
                />
                <input
                  type="range"
                  min={0}
                  max={100000000}
                  step={500000}
                  value={maxPrice || 100000000}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!minPrice || val >= parseInt(minPrice)) setMaxPrice(val.toString());
                  }}
                  style={{ position: 'absolute', width: 'calc(100% - 20px)', left: '10px', top: '2px', WebkitAppearance: 'none', background: 'transparent', pointerEvents: 'none' }}
                  className="dual-slider"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-text-muted)' }}>₹</span>
                  <input
                    type={focusedInput === 'min' ? 'number' : 'text'}
                    placeholder={lang === 'mr' ? 'किमान' : 'Min'}
                    value={focusedInput === 'min' ? minPrice : formatBudget(minPrice || '0')}
                    onFocus={() => setFocusedInput('min')}
                    onBlur={() => setFocusedInput(null)}
                    onChange={(e) => {
                      if (focusedInput === 'min') {
                        setMinPrice(e.target.value);
                      }
                    }}
                    readOnly={focusedInput !== 'min'}
                    className="mv-advanced-input"
                    style={{ paddingLeft: '28px' }}
                  />
                </div>
                <span style={{ color: 'var(--mv-text-muted)', fontWeight: 700 }}>-</span>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-accent)', fontWeight: 600 }}>₹</span>
                  <input
                    type={focusedInput === 'max' ? 'number' : 'text'}
                    placeholder={lang === 'mr' ? 'कमाल' : 'Max'}
                    value={focusedInput === 'max' ? maxPrice : formatBudget(maxPrice || '100000000')}
                    onFocus={() => setFocusedInput('max')}
                    onBlur={() => setFocusedInput(null)}
                    onChange={(e) => {
                      if (focusedInput === 'max') {
                        setMaxPrice(e.target.value);
                      }
                    }}
                    readOnly={focusedInput !== 'max'}
                    className="mv-advanced-input"
                    style={{ paddingLeft: '28px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button 
                onClick={() => { setLocation(''); setMinPrice(''); setMaxPrice(''); }} 
                className="mv-advanced-btn-secondary"
              >
                {lang === 'mr' ? 'रीसेट करा' : 'Reset'}
              </button>
              <button 
                onClick={() => handleSearch()} 
                className="mv-advanced-btn-primary"
              >
                {lang === 'mr' ? 'लागू करा' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
