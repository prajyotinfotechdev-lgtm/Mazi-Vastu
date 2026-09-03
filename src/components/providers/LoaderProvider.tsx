'use client';

import React, { createContext, useContext, useState } from 'react';
import GlobalLoader from '../ui/GlobalLoader';

interface LoaderContextType {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');

  const showLoader = (text = 'Loading') => {
    setLoadingText(text);
    setIsVisible(true);
  };

  const hideLoader = () => {
    setIsVisible(false);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isVisible && <GlobalLoader text={loadingText} />}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}
