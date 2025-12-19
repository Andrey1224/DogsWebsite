'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useAnalytics } from '@/components/analytics-provider';
import { CONTACT_COPY, CONTACT_CHANNELS } from '@/lib/config/contact';

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
const WHATSAPP_LINK = CONTACT_CHANNELS.find((channel) => channel.id === 'whatsapp')?.href;

// Helper to detect mobile screens (matches Tailwind 'sm' breakpoint)
const MOBILE_MAX = 640;
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${MOBILE_MAX}px}`).matches;
}

export function CrispChat() {
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();

  // Core logic to inject the script
  const loadCrisp = async () => {
    if (!CRISP_WEBSITE_ID) return;
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;

    // Initialize queue
    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Helper to push commands
    const pushCommand = (action: string, ...args: unknown[]) => {
      window.$crisp?.push([action, ...args]);
    };

    // Prepare handlers
    const welcomeMessage = CONTACT_COPY.crisp.welcome;
    const offlineMessage = CONTACT_COPY.crisp.offline;

    const sessionHandler = () => {
      pushCommand('do', 'message:show', ['text', welcomeMessage]);
      applyMobileVisibility(); // Ensure visibility rules apply after session load
      window.dispatchEvent(new CustomEvent('crisp:session', { detail: { status: 'ready' } }));
    };

    const availabilityHandler = (availability: 'online' | 'offline') => {
      window.dispatchEvent(
        new CustomEvent('crisp:availability', { detail: { status: availability } }),
      );
      if (availability === 'offline') {
        if (offlineMessage) {
          const message = WHATSAPP_LINK ? `${offlineMessage} ${WHATSAPP_LINK}` : offlineMessage;
          pushCommand('do', 'message:show', ['text', message]);
        }
      }
    };

    const chatOpenedHandler = () => {
      trackEvent('chat_open', { context_path: pathname });
    };

    const chatClosedHandler = () => {
      // Re-hide widget on mobile after user closes chat
      if (isMobile()) {
        pushCommand('do', 'chat:hide');
      }
    };

    // Attach listeners BEFORE script loads
    pushCommand('on', 'session:loaded', sessionHandler);
    pushCommand('on', 'website:availability:changed', availabilityHandler);
    pushCommand('on', 'chat:opened', chatOpenedHandler);
    pushCommand('on', 'chat:closed', chatClosedHandler);

    // Inject Script
    await new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

    loadedRef.current = true;
    loadingRef.current = false;

    // Apply visibility rules immediately after load
    applyMobileVisibility();
  };

  const applyMobileVisibility = () => {
    if (!window.$crisp) return;

    if (isMobile()) {
      window.$crisp.push(['do', 'chat:hide']); // Hide bubble on mobile
    } else {
      window.$crisp.push(['do', 'chat:show']); // Show bubble on desktop
    }
  };

  const openChat = async () => {
    await loadCrisp();
    if (!window.$crisp) return;

    // Force show and open, even if hidden by default rules
    window.$crisp.push(['do', 'chat:show']);
    window.$crisp.push(['do', 'chat:open']);
  };

  useEffect(() => {
    // 1. Lazy load schedule
    const schedule = () => {
      const run = () => {
        void loadCrisp();
      };

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback?.(run, { timeout: 4000 });
      } else {
        setTimeout(run, 4000);
      }
    };
    schedule();

    // 2. Listen for forced open event (from ContactBar)
    const onForceOpen = () => {
      void openChat();
    };
    window.addEventListener('crisp:open', onForceOpen);

    // 3. Re-apply visibility rules on resize
    const onResize = () => {
      if (loadedRef.current) applyMobileVisibility();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('crisp:open', onForceOpen);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, trackEvent]); // loadCrisp and openChat are stable via refs

  return null;
}
