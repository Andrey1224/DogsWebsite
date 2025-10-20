'use client';

import Link, { LinkProps } from "next/link";
import { useCallback } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useAnalytics } from "@/components/analytics-provider";

type AnalyticsCtaLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
};

export function AnalyticsCtaLink({
  children,
  className,
  onClick,
  href,
  ...rest
}: AnalyticsCtaLinkProps) {
  const { trackEvent } = useAnalytics();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      trackEvent("about_cta", { href });
      onClick?.(event);
    },
    [href, onClick, trackEvent],
  );

  return (
    <Link className={className} href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
