import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'vitest-axe/extend-expect'; 

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up the DOM after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});