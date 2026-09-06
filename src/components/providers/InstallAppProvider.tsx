'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface InstallContextType {
  deferredPrompt: any;
  canInstall: boolean;
  isInstalled: boolean;
  promptDismissed: boolean;
  triggerInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

const InstallContext = createContext<InstallContextType>({
  deferredPrompt: null,
  canInstall: false,
  isInstalled: false,
  promptDismissed: false,
  triggerInstall: async () => {},
  dismissPrompt: () => {},
});

export const useInstallApp = () => useContext(InstallContext);

export default function InstallAppProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('mv_install_dismissed');
    if (dismissed) setPromptDismissed(true);

    // Detect iOS
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);
    if (iosDevice) setCanInstall(true);

    // Listen for the browser's install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (isIOS) {
      const toast = (await import('react-hot-toast')).default;
      toast('Tap the Share button ⎋ then tap "Add to Home Screen"', {
        icon: '📱',
        duration: 6000,
      });
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        const toast = (await import('react-hot-toast')).default;
        toast.success('MaziVastu app installed!');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isIOS]);

  const dismissPrompt = useCallback(() => {
    setPromptDismissed(true);
    localStorage.setItem('mv_install_dismissed', 'true');
  }, []);

  return (
    <InstallContext.Provider value={{ deferredPrompt, canInstall, isInstalled, promptDismissed, triggerInstall, dismissPrompt }}>
      {children}
    </InstallContext.Provider>
  );
}
