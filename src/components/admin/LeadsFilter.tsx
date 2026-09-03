'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type PropertyType = { 
  id: string; 
  name: string;
  children?: { id: string; name: string }[];
};

export default function LeadsFilter({ propertyTypes = [], locations = [], services = [] }: { propertyTypes?: PropertyType[], locations?: string[], services?: { id: string, name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const source = searchParams.get('source') || 'PROPERTY_INTEREST';
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [propertyTypeId, setPropertyTypeId] = useState(searchParams.get('propertyTypeId') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [dateRange, setDateRange] = useState(searchParams.get('dateRange') || '');
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') || '');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce state to URL
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) params.set('q', query); else params.delete('q');
      if (status) params.set('status', status); else params.delete('status');
      if (propertyTypeId) params.set('propertyTypeId', propertyTypeId); else params.delete('propertyTypeId');
      if (location) params.set('location', location); else params.delete('location');
      if (dateRange) params.set('dateRange', dateRange); else params.delete('dateRange');
      if (serviceId) params.set('serviceId', serviceId); else params.delete('serviceId');

      const newQueryString = params.toString();
      if (newQueryString !== searchParams.toString()) {
        params.set('page', '1');
        router.push(`?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query, status, propertyTypeId, location, dateRange, serviceId, router, searchParams]);

  // Clear specific filters when source changes
  useEffect(() => {
    if (source !== 'PROPERTY_INTEREST') {
      if (propertyTypeId || location) {
        setPropertyTypeId('');
        setLocation('');
      }
    }
    if (source !== 'SERVICE_CONTACT') {
      if (serviceId) {
        setServiceId('');
      }
    }
  }, [source, propertyTypeId, location, serviceId]);

  const clearFilters = () => {
    setQuery('');
    setStatus('');
    setPropertyTypeId('');
    setLocation('');
    setDateRange('');
    setServiceId('');
    router.push(`?source=${source}`);
  };

  const hasActiveFilters = !!(query || status || propertyTypeId || location || dateRange || serviceId);

  let selectedCategoryName = "All Categories";
  propertyTypes.forEach(t => {
    if (t.id === propertyTypeId) selectedCategoryName = `All ${t.name}`;
    t.children?.forEach(c => {
      if (c.id === propertyTypeId) selectedCategoryName = c.name;
    });
  });

  return (
    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--mv-border)', background: 'var(--mv-bg-surface)' }}>
      <style>{`
        .mv-custom-dropdown-item {
          padding: 0.625rem 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--mv-text);
          font-size: 0.875rem;
          transition: background-color 0.1s;
        }
        .mv-custom-dropdown-item:hover, .mv-custom-dropdown-item.active {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .mv-custom-submenu {
          position: absolute;
          top: -1px;
          left: 100%;
          background: var(--mv-bg-surface);
          border: 1px solid var(--mv-border);
          border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
          min-width: 180px;
          padding: 0.5rem 0;
          z-index: 60;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 500 }}>
        <Filter size={16} />
        <span style={{ fontSize: '0.875rem' }}>Filters</span>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              color: 'var(--mv-text-accent)', 
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <X size={14} /> Clear all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-text-muted)' }} size={16} />
          <input 
            type="text" 
            placeholder="Search by name, phone..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.625rem 1rem 0.625rem 2.5rem', 
              border: '1px solid var(--mv-border)', 
              background: 'var(--mv-bg)',
              color: 'var(--mv-text)',
              borderRadius: '6px',
              outline: 'none',
              fontSize: '0.875rem'
            }} 
          />
        </div>
        
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            flex: '1 1 140px',
            padding: '0.625rem 1rem',
            border: '1px solid var(--mv-border)',
            background: 'var(--mv-bg)',
            color: 'var(--mv-text)',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '0.875rem',
          }}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CLOSED">Closed (Success)</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            flex: '1 1 140px',
            padding: '0.625rem 1rem',
            border: '1px solid var(--mv-border)',
            background: 'var(--mv-bg)',
            color: 'var(--mv-text)',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '0.875rem',
          }}
        >
          <option value="">All Time</option>
          <option value="TODAY">Today</option>
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="THIS_MONTH">This Month</option>
        </select>

        {source === 'PROPERTY_INTEREST' && (
          <>
            {/* Custom Nested Dropdown */}
            <div style={{ position: 'relative', flex: '1 1 200px' }} ref={dropdownRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 1rem',
                  border: '1px solid var(--mv-border)',
                  background: 'var(--mv-bg)',
                  color: 'var(--mv-text)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedCategoryName}
                </span>
                <ChevronDown size={16} style={{ color: 'var(--mv-text-muted)', flexShrink: 0 }} />
              </button>

              {isCategoryOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.25rem',
                  width: '100%',
                  background: 'var(--mv-bg-surface)',
                  border: '1px solid var(--mv-border)',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
                  zIndex: 50,
                  padding: '0.5rem 0'
                }}>
                  <div 
                    className={`mv-custom-dropdown-item ${propertyTypeId === '' ? 'active' : ''}`}
                    onClick={() => { setPropertyTypeId(''); setIsCategoryOpen(false); }}
                  >
                    All Categories
                  </div>
                  
                  {propertyTypes.map((type) => (
                    <div 
                      key={type.id}
                      className="mv-custom-dropdown-item"
                      onMouseEnter={() => setHoveredCategory(type.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{ position: 'relative' }}
                    >
                      <div 
                        style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                        onClick={(e) => {
                          if (type.children && type.children.length > 0) {
                            // Don't close if they click the parent and it has children, let them hover
                            if (window.innerWidth < 768) {
                                // mobile fallback: just select the parent
                                setPropertyTypeId(type.id);
                                setIsCategoryOpen(false);
                            }
                          } else {
                            setPropertyTypeId(type.id);
                            setIsCategoryOpen(false);
                          }
                        }}
                      >
                        {type.name}
                      </div>
                      
                      {type.children && type.children.length > 0 && (
                        <>
                          <ChevronRight size={14} style={{ color: 'var(--mv-text-muted)' }} />
                          {hoveredCategory === type.id && (
                            <div className="mv-custom-submenu">
                              <div 
                                className={`mv-custom-dropdown-item ${propertyTypeId === type.id ? 'active' : ''}`}
                                onClick={() => { setPropertyTypeId(type.id); setIsCategoryOpen(false); }}
                                style={{ fontWeight: 600, borderBottom: '1px solid var(--mv-border)', marginBottom: '0.25rem', paddingBottom: '0.5rem' }}
                              >
                                All {type.name}
                              </div>
                              {type.children.map(child => (
                                <div 
                                  key={child.id}
                                  className={`mv-custom-dropdown-item ${propertyTypeId === child.id ? 'active' : ''}`}
                                  onClick={() => { setPropertyTypeId(child.id); setIsCategoryOpen(false); }}
                                >
                                  {child.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                flex: '1 1 150px',
                padding: '0.625rem 1rem',
                border: '1px solid var(--mv-border)',
                background: 'var(--mv-bg)',
                color: 'var(--mv-text)',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </>
        )}

        {source === 'SERVICE_CONTACT' && (
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            style={{
              flex: '1 1 150px',
              padding: '0.625rem 1rem',
              border: '1px solid var(--mv-border)',
              background: 'var(--mv-bg)',
              color: 'var(--mv-text)',
              borderRadius: '6px',
              outline: 'none',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All Services</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

      </div>
    </div>
  );
}
