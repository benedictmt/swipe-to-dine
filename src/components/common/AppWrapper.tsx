'use client';

/**
 * App Wrapper Component
 *
 * Manages global app state like splash screen visibility.
 * Wraps the entire app content and shows splash on first load.
 */

import { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';

interface AppWrapperProps {
  children: React.ReactNode;
}

const SPLASH_SHOWN_KEY = 'swipe-to-dine-splash-shown';

export function AppWrapper({ children }: AppWrapperProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if splash was already shown this session
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    if (!splashShown) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    setShowSplash(false);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} duration={2500} />
      )}
      {children}
    </>
  );
}
