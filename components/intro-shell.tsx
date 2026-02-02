// Client wrapper to show IntroScreen before main content
'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { IntroScreen } from '@/components/intro-screen';

type IntroShellProps = {
  children: ReactNode;
};

export function IntroShell({ children }: IntroShellProps) {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [hasEmittedComplete, setHasEmittedComplete] = useState(false);
  const introDisabled = process.env.NEXT_PUBLIC_INTRO_DISABLED === 'true';

  const emitIntroComplete = useCallback(() => {
    if (hasEmittedComplete) return;
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ebl:intro-complete'));
    setHasEmittedComplete(true);
  }, [hasEmittedComplete]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (introDisabled) {
      sessionStorage.setItem('ebl_intro_complete', 'true');
      setShowIntro(false);
      emitIntroComplete();
      return;
    }

    // Auto-skip intro for automated browsers (e.g., Playwright) to keep tests stable
    const isAutomation = navigator.webdriver;
    if (isAutomation) {
      sessionStorage.setItem('ebl_intro_complete', 'true');
      setShowIntro(false);
      emitIntroComplete();
      return;
    }

    const hasSeen = sessionStorage.getItem('ebl_intro_complete');
    setShowIntro(!hasSeen);
    if (hasSeen) emitIntroComplete();
  }, [emitIntroComplete, introDisabled]);

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
      {showIntro && (
        <IntroScreen
          onComplete={() => {
            setShowIntro(false);
            emitIntroComplete();
          }}
        />
      )}
      <div className={showIntro ? 'pointer-events-none select-none blur-[1px]' : ''}>
        {children}
      </div>
    </>
  );
}
