import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SiteFooter } from './site-footer';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

describe('SiteFooter', () => {
  it.each([
    ['Cullman, AL', '/locations/cullman-al'],
    ['Decatur, AL', '/locations/decatur-al'],
    ['Birmingham, AL', '/locations/birmingham-al'],
    ['Huntsville, AL', '/locations/huntsville-al'],
  ])('links to the %s service-area page', (label, href) => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
  });
});
