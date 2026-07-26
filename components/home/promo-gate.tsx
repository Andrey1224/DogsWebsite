'use client';

import { useEffect, useState } from 'react';

import { PromoModal } from '@/components/home/promo-modal';

const PROMO_SEEN_KEY = 'ebl_promo_seen_v1';

export function PromoGate() {
  const [open, setOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [automation, setAutomation] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setAutomation(Boolean(navigator.webdriver));

    const hasCompletedIntro = sessionStorage.getItem('ebl_intro_complete') === 'true';
    if (hasCompletedIntro) setIntroComplete(true);

    const handleIntroComplete = () => setIntroComplete(true);
    window.addEventListener('ebl:intro-complete', handleIntroComplete);
    return () => window.removeEventListener('ebl:intro-complete', handleIntroComplete);
  }, []);

  useEffect(() => {
    if (!introComplete || automation) return;
    try {
      const hasSeen = localStorage.getItem(PROMO_SEEN_KEY);
      if (hasSeen) return;
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    } catch {
      // ignore storage issues
    }
  }, [introComplete, automation]);

  const handleClose = () => {
    setOpen(false);
    try {
      localStorage.setItem(PROMO_SEEN_KEY, 'true');
    } catch {
      // ignore storage issues
    }
  };

  if (automation) return null;

  // Check if promo is disabled via env variable
  const promoDisabled = process.env.NEXT_PUBLIC_PROMO_DISABLED === 'true';

  // Debug log (remove after verification)
  if (typeof window !== 'undefined') {
    console.log('[PromoGate] NEXT_PUBLIC_PROMO_DISABLED:', process.env.NEXT_PUBLIC_PROMO_DISABLED);
    console.log('[PromoGate] promoDisabled:', promoDisabled);
  }

  if (promoDisabled) return null;

  return <PromoModal open={open} onClose={handleClose} />;
}
