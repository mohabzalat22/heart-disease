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
    section: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('section', { ...props, ref }, children)
    ),
    h1: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('h1', { ...props, ref }, children)
    ),
    p: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('p', { ...props, ref }, children)
    ),
    span: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('span', { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

describe('HeroSection', () => {
  it('renders main heading', async () => {
    const { default: HeroSection } = await import('@/components/home/HeroSection');
    render(React.createElement(HeroSection));
    // Hero should have some heart disease related heading
    const heading = document.querySelector('h1');
    expect(heading).toBeInTheDocument();
  });

  it('renders a CTA link', async () => {
    const { default: HeroSection } = await import('@/components/home/HeroSection');
    render(React.createElement(HeroSection));
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
