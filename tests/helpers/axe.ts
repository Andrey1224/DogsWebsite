import { configureAxe, type JestAxeConfigureOptions } from 'jest-axe';

/**
 * Custom axe configuration for our project.
 * Extends default rules with project-specific requirements.
 */
const axeConfig: JestAxeConfigureOptions = {
  rules: {
    // Enforce color contrast ratios
    'color-contrast': { enabled: true },
    // Ensure all images have alt text
    'image-alt': { enabled: true },
    // Require labels for form elements
    label: { enabled: true },
    // Ensure proper heading hierarchy
    'heading-order': { enabled: true },
    // Require accessible names for interactive elements
    'button-name': { enabled: true },
    // Ensure links have discernible text
    'link-name': { enabled: true },
  },
};

export const axe = configureAxe(axeConfig);

/**
 * Common axe test helper that runs accessibility tests on a rendered component
 * and provides clear error messaging.
 */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}
