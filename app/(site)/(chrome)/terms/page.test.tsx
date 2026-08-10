/**
 * Terms of Service Page Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

import TermsPage from './page';
import { expectNoA11yViolations } from '@/tests/helpers/axe';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    prefetch,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
    void prefetch;
    return <a {...props}>{children}</a>;
  },
}));

function renderTermsPage() {
  return render(<TermsPage />);
}

describe('Terms of Service Page', () => {
  it('renders page heading', () => {
    renderTermsPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Deposit terms.*reservation process/is,
      }),
    ).toBeInTheDocument();
  });

  it('describes the full reservation sequence before any deposit', () => {
    renderTermsPage();

    expect(
      screen.getByText(/Reserving a puppy is not an instant, self-serve checkout/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/You send us an inquiry about a specific puppy/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We confirm you as the buyer and confirm the puppy is still available/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/You receive and sign our adoption contract/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Only after your contract is signed do you place the/i),
    ).toBeInTheDocument();
  });

  it('renders deposit policy content correctly', () => {
    renderTermsPage();

    expect(screen.getAllByText(/\$300 deposit/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/deposits are non-refundable once paid/i)).toBeInTheDocument();
    expect(
      screen.getByText(/transfer the deposit to another available puppy or upcoming litter/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/remaining balance is due as outlined in your signed contract/i),
    ).toBeInTheDocument();
  });

  it('carries over the existing health guarantee clause unchanged', () => {
    renderTermsPage();

    expect(screen.getByText(/Every puppy receives a comprehensive vet exam/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We guarantee against life-threatening congenital conditions for/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/12 months/i)).toBeInTheDocument();
  });

  it('renders a real #delivery anchor on the Delivery & Pickup section', () => {
    const { container } = renderTermsPage();

    const deliverySection = container.querySelector('#delivery');
    expect(deliverySection).toBeInTheDocument();
    expect(deliverySection).toHaveTextContent(/Flight nanny transport/i);
  });

  it('has only one element with id="delivery"', () => {
    const { container } = renderTermsPage();

    expect(container.querySelectorAll('#delivery').length).toBe(1);
  });

  it('renders refunds and exchanges content correctly', () => {
    renderTermsPage();

    expect(
      screen.getByText(
        /Once reserved, refunds are not provided unless a licensed veterinarian documents a health concern/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/replacement puppy/i)).toBeInTheDocument();
  });

  it('renders documents and contracts content correctly', () => {
    renderTermsPage();

    expect(
      screen.getByText(/Adoption contracts, medical records, and AKC paperwork/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/when applicable to your puppy/i).length).toBeGreaterThan(0);
  });

  it('links to the Privacy Policy page', () => {
    renderTermsPage();

    const link = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(link).toHaveAttribute('href', '/privacy');
  });

  it('renders breadcrumbs with correct links', () => {
    renderTermsPage();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('Terms of Service');
  });

  it('renders JSON-LD MerchantReturnPolicy structured data', () => {
    const { container } = renderTermsPage();

    const jsonLdScripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    const schemas = Array.from(jsonLdScripts).map((script) =>
      JSON.parse(script.textContent || '{}'),
    );
    const returnPolicySchema = schemas.find((schema) => schema['@type'] === 'MerchantReturnPolicy');

    expect(returnPolicySchema).toBeTruthy();
  });

  it('passes accessibility checks', async () => {
    const { container } = renderTermsPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
