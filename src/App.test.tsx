import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navbar with site title', () => {
  render(<App />);
  expect(screen.getAllByText('Hylove').length).toBeGreaterThan(0);
});
