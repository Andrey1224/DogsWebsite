'use client';

import { useAnalytics } from '@/components/analytics-provider';

export function PrivacySettingsButton({ className }: { className?: string }) {
  const { resetConsent } = useAnalytics();

  return (
    <button type="button" onClick={resetConsent} className={className}>
      Privacy settings
    </button>
  );
}
