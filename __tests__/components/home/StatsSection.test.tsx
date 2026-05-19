/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { stats } from '@/components/home/data';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    section: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('section', { ...props, ref }, children)
    ),
    span: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('span', { ...props, ref }, children)
    ),
    h1: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('h1', { ...props, ref }, children)
    ),
    p: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('p', { ...props, ref }, children)
    ),
    a: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('a', { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

describe('Home Data', () => {
  it('has 4 stats entries', () => {
    expect(stats).toHaveLength(4);
  });

  it('each stat has required fields', () => {
    stats.forEach((stat) => {
      expect(stat.value).toBeTruthy();
      expect(stat.label).toBeTruthy();
      expect(stat.sublabel).toBeTruthy();
      expect(stat.icon).toBeDefined();
      expect(stat.color).toBeTruthy();
      expect(stat.bg).toBeTruthy();
    });
  });
});

describe('StatsSection', () => {
  it('renders all stats values', async () => {
    const { default: StatsSection } = await import('@/components/home/StatsSection');
    render(React.createElement(StatsSection));

    stats.forEach((stat) => {
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    });
  });
});
