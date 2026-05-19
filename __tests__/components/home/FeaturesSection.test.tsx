/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { features } from '@/components/home/data';

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    section: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('section', { ...props, ref }, children)
    ),
  },
  useInView: () => true,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

describe('FeaturesSection', () => {
  it('renders all feature titles', async () => {
    const { default: FeaturesSection } = await import('@/components/home/FeaturesSection');
    render(React.createElement(FeaturesSection));

    features.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
    });
  });

  it('renders all feature descriptions', async () => {
    const { default: FeaturesSection } = await import('@/components/home/FeaturesSection');
    render(React.createElement(FeaturesSection));

    features.forEach((feature) => {
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });
});
