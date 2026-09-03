'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface CustomCategorySelectProps {
  categories: Category[];
  defaultValue: string;
  allText: string;
  lang?: string;
}

const marathiCategoryMap: Record<string, string> = {
  'Home': 'घर',
  'Open Plot': 'खुला प्लॉट',
  'Row House': 'रो हाऊस',
  'Flat': 'फ्लॅट',
  'Shop': 'दुकान',
  'Land': 'जमीन',
  'Rent': 'भाड्याने'
};

export default function CustomCategorySelect({ categories, defaultValue, allText, lang = 'en' }: CustomCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parents = categories.filter(c => !c.parentId);
  
  // Find the selected display name
  let selectedLabel = allText;
  if (selectedValue) {
    const selectedCat = categories.find(c => c.id === selectedValue);
    if (selectedCat) {
      let baseName = selectedCat.name.replace(/rent\s*-\s*/i, '').replace(/rent/i, 'Rent').trim();
      if (lang === 'mr') {
        baseName = marathiCategoryMap[baseName] || baseName;
      }
      selectedLabel = baseName;
    }
  }

  const handleSelect = (val: string) => {
    setSelectedValue(val);
    setIsOpen(false);
  };

  return (
    <div className="mv-custom-select-wrapper" ref={dropdownRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Hidden input to ensure the native HTML form submission still works */}
      <input type="hidden" name="type" value={selectedValue} />

      {/* The visible trigger button */}
      <div 
        className="mv-properties-filter-select"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '10px 14px 10px 36px',
          height: '100%',
          userSelect: 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          color: selectedValue ? 'var(--mv-text)' : 'var(--mv-text-muted)'
        }}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={16} 
          color="var(--mv-text-muted)" 
          style={{ 
            transition: 'transform 0.2s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} 
        />
      </div>

      {/* The dropdown menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 100,
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '8px 0',
          animation: 'dropdownFadeIn 0.2s ease-out forwards'
        }}>
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .mv-custom-select-option {
              padding: 10px 16px;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: space-between;
              color: var(--mv-text);
              font-size: 0.875rem;
            }
            .mv-custom-select-option:hover {
              background: rgba(255, 255, 255, 0.05);
            }
            .mv-custom-select-group {
              padding: 12px 16px 4px 16px;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--mv-text-muted);
              font-weight: 700;
            }
          `}</style>
          
          <div 
            className="mv-custom-select-option" 
            onClick={() => handleSelect('')}
            style={{ color: selectedValue === '' ? 'var(--mv-accent)' : undefined }}
          >
            <span>{allText}</span>
            {selectedValue === '' && <Check size={16} />}
          </div>

          {parents.map(parent => {
            const children = categories.filter(c => c.parentId === parent.id);
            
            if (children.length === 0) {
              const displayName = lang === 'mr' ? (marathiCategoryMap[parent.name] || parent.name) : parent.name;
              return (
                <div 
                  key={parent.id} 
                  className="mv-custom-select-option"
                  onClick={() => handleSelect(parent.id)}
                  style={{ color: selectedValue === parent.id ? 'var(--mv-accent)' : undefined }}
                >
                  <span>{displayName}</span>
                  {selectedValue === parent.id && <Check size={16} />}
                </div>
              );
            }

            const groupDisplayName = lang === 'mr' ? (marathiCategoryMap[parent.name] || parent.name) : parent.name;
            const allGroupDisplayName = lang === 'mr' ? `सर्व ${groupDisplayName}` : `All ${parent.name}`;

            return (
              <React.Fragment key={parent.id}>
                <div className="mv-custom-select-group">{groupDisplayName}</div>
                <div 
                  className="mv-custom-select-option"
                  onClick={() => handleSelect(parent.id)}
                  style={{ 
                    paddingLeft: '24px',
                    color: selectedValue === parent.id ? 'var(--mv-accent)' : undefined 
                  }}
                >
                  <span>{allGroupDisplayName}</span>
                  {selectedValue === parent.id && <Check size={16} />}
                </div>
                {children.map(child => {
                  const childBaseName = child.name.replace(/rent\s*-\s*/i, '').replace(/rent/i, 'Rent').trim();
                  const childDisplayName = lang === 'mr' ? (marathiCategoryMap[childBaseName] || childBaseName) : childBaseName;
                  return (
                  <div 
                    key={child.id} 
                    className="mv-custom-select-option"
                    onClick={() => handleSelect(child.id)}
                    style={{ 
                      paddingLeft: '24px',
                      color: selectedValue === child.id ? 'var(--mv-accent)' : undefined
                    }}
                  >
                    <span>{childDisplayName}</span>
                    {selectedValue === child.id && <Check size={16} />}
                  </div>
                )})}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
