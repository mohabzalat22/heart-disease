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
    nav: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('nav', { ...props, ref }, children)
    ),
    span: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('span', { ...props, ref }, children)
    ),
    a: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('a', { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(null),
  }),
}));

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/repositories/userRepo', () => ({
  UserRepo: {
    findById: jest.fn().mockResolvedValue(null),
  },
}));

describe('Navbar', () => {
  it('renders brand name', async () => {
    const { default: Navbar } = await import('@/components/home/Navbar');
    render(await Navbar());
    expect(screen.getByText(/CardioCare AI/i)).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    const { default: Navbar } = await import('@/components/home/Navbar');
    render(await Navbar());
    // The Navbar should contain some navigation elements
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('renders user components when authenticated', async () => {
    const { verifyToken } = require('@/lib/auth');
    verifyToken.mockResolvedValueOnce({ userId: 1 });

    const { UserRepo } = require('@/repositories/userRepo');
    UserRepo.findById.mockResolvedValueOnce({ name: 'John Doe', email: 'john@example.com', image: null });

    const { cookies } = require('next/headers');
    cookies.mockResolvedValueOnce({
      get: jest.fn().mockReturnValue({ value: 'token' }),
    });

    const { default: Navbar } = await import('@/components/home/Navbar');
    render(await Navbar());

    // Sign In button should not be rendered
    expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
    // UserButton avatar fallback should be present (rendered via initials)
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
