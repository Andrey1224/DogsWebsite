# ADR: Address Privacy for Public Display

**Date**: 2025-11-16

**Status**: Accepted

## Context

The business owner of Exotic Bulldog Legacy has expressed a desire for privacy and does not want the full physical address of the kennel to be publicly displayed on the website. However, completely removing the address would negatively impact Local SEO, as search engines rely on a precise Name, Address, and Phone Number (NAP) for local search rankings.

## Decision

We will implement a solution that balances privacy with SEO requirements.

1.  **Dual Address Representation**: The business address will be represented in two forms within the application's configuration (`lib/config/business.ts`):
    - A **full, precise address** (street, city, state, postal code) will be stored for use in machine-readable formats like JSON-LD schema markup. This provides search engines with the accurate data needed for local SEO.
    - A **publicly visible display address**, consisting of only the city and state (e.g., "Falkville, AL"), will be used for rendering on the user-facing website, such as in the site footer.

2.  **Implementation**:
    - The `parseAddress` function in `lib/config/business.ts` was modified to return both a `formatted` property (full address) and a `display` property (city, state).
    - The `SiteFooter` component (`components/site-footer.tsx`) was updated to use the `display` property, ensuring only the general location is shown to visitors.

## Consequences

- **Positive**:
  - The business owner's privacy is protected as the full street address is no longer visible on the website.
  - Local SEO should not be negatively impacted, as the full address is still provided to search engines via structured data.
- **Negative**:
  - Users who wish to visit the kennel will not see the full address immediately and will need to use the "Get directions" link or contact the business directly, which is the intended workflow as visits are by appointment only.
- **Neutral**:
  - This introduces a small amount of complexity to the address handling in the codebase, but it is well-encapsulated within the business configuration.
