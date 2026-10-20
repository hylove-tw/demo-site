// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Highcharts calls CSS.supports during import. This jsdom build exposes CSS
// without that function, which throws before any chart test can run.
if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
  Object.defineProperty(window, 'CSS', {
    configurable: true,
    writable: true,
    value: { ...(typeof CSS === 'undefined' ? {} : CSS), supports: () => false },
  });
}
