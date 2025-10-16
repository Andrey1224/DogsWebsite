/**
 * Type declarations for extending Vitest with jest-axe and jest-dom matchers
 */

import 'vitest';
import type { JestAxeMatchers } from 'jest-axe/dist/matchers';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends JestAxeMatchers, TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends JestAxeMatchers, TestingLibraryMatchers<unknown, void> {}
}
