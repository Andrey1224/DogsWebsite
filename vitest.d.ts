/**
 * Type declarations for extending Vitest with jest-axe matchers
 *
 * Note: jest-dom types are loaded automatically via tsconfig.json types array
 */

import 'vitest';
import type { JestAxeMatchers } from 'jest-axe/dist/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends JestAxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends JestAxeMatchers {}
}
