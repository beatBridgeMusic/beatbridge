import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { AxeMatchers } from 'vitest-axe';

declare module 'vitest' {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<T, void>, AxeMatchers {}
}