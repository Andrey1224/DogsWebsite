'use client';

import dynamic from 'next/dynamic';

const LazyCrispChat = dynamic(
  () => import('@/components/crisp-chat').then((mod) => ({ default: mod.CrispChat })),
  { ssr: false },
);

export function CrispChatLoader() {
  return <LazyCrispChat />;
}
