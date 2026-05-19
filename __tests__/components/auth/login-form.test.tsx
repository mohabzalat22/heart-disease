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
    form: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('form', { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/login',
}));

// Mock react-dom useActionState (used by Next.js form actions)
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useActionState: jest.fn(() => [null, jest.fn(), false]),
  };
});

describe('LoginForm', () => {
  it('renders email and password inputs', async () => {
    const { LoginForm } = await import('@/components/auth/login-form');
    render(React.createElement(LoginForm));

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('renders submit button', async () => {
    const { LoginForm } = await import('@/components/auth/login-form');
    render(React.createElement(LoginForm));

    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it('renders link to signup', async () => {
    const { LoginForm } = await import('@/components/auth/login-form');
    render(React.createElement(LoginForm));

    const signupLink = screen.getByText(/sign up/i);
    expect(signupLink).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const { LoginForm } = await import('@/components/auth/login-form');
    render(React.createElement(LoginForm));

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
