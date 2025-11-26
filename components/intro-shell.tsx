// Client wrapper to show IntroScreen before main content
'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { IntroScreen } from '@/components/intro-screen';

type IntroShellProps = {
  children: ReactNode;
};

export function IntroShell({ children }: IntroShellProps) {
  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Auto-skip intro for automated browsers (e.g., Playwright) to keep tests stable
    const isAutomation = navigator.webdriver;
    if (isAutomation) {
      sessionStorage.setItem('ebl_intro_complete', 'true');
      setShowIntro(false);
      return;
    }

    const hasSeen = sessionStorage.getItem('ebl_intro_complete');
    setShowIntro(!hasSeen);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (showIntro) {
      root.classList.add('overflow-hidden');
    } else {
      root.classList.remove('overflow-hidden');
    }
    return () => root.classList.remove('overflow-hidden');
  }, [showIntro]);

  return (
    <>
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      <div className={showIntro ? 'pointer-events-none select-none blur-[1px]' : ''}>
        {children}
      </div>
    </>
  );
}
