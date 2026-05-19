/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    footer: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('footer', { ...props, ref }, children)
    ),
  },
  useInView: () => true,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

describe('Footer', () => {
  it('renders the footer with copyright text', async () => {
    const { default: Footer } = await import('@/components/home/Footer');
    render(React.createElement(Footer));
    expect(screen.getByText(/CardioCare AI/i)).toBeInTheDocument();
  });
});
