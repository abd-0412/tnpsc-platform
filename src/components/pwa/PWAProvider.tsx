'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { syncOfflineSubmissionsToServer, getPendingSubmissions } from '@/lib/offline-storage';

interface PWAContextType {
  isOnline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  installPWA: () => Promise<boolean>;
  pendingSyncCount: number;
  triggerManualSync: () => Promise<{ syncedCount: number; failedCount: number }>;
  lastSyncTime: Date | null;
}

const PWAContext = createContext<PWAContextType>({
  isOnline: true,
  canInstall: false,
  isInstalled: false,
  installPWA: async () => false,
  pendingSyncCount: 0,
  triggerManualSync: async () => ({ syncedCount: 0, failedCount: 0 }),
  lastSyncTime: null,
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Refresh pending count
  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await getPendingSubmissions();
      setPendingSyncCount(pending.length);
    } catch {
      // IndexedDB might not be ready yet
    }
  }, []);

  // Perform background sync
  const performSync = useCallback(async () => {
    if (!navigator.onLine) return { syncedCount: 0, failedCount: 0 };
    try {
      const res = await syncOfflineSubmissionsToServer();
      if (res.syncedCount > 0) {
        setLastSyncTime(new Date());
      }
      await refreshPendingCount();
      return res;
    } catch (err) {
      console.warn('[PWA] Sync error:', err);
      return { syncedCount: 0, failedCount: 0 };
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check online status initially
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    // Online / Offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setCanInstall(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [performSync, refreshPendingCount]);

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  const triggerManualSync = async () => {
    return await performSync();
  };

  return (
    <PWAContext.Provider
      value={{
        isOnline,
        canInstall,
        isInstalled,
        installPWA,
        pendingSyncCount,
        triggerManualSync,
        lastSyncTime,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

