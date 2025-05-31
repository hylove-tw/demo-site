import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navbar with site title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Hylove Demo/i);
  expect(titleElement).toBeInTheDocument();
});
