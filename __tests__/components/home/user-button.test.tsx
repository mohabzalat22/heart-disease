/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserButton } from '@/components/home/user-button';
import { handleSignOut } from '@/actions/authActions';

jest.mock('@/actions/authActions', () => ({
  handleSignOut: jest.fn(),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, className }: any) => (
    <div data-testid="dropdown-item" className={className} onClick={onSelect}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

describe('UserButton', () => {
  it('renders initials when no image is provided', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserButton user={user} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders email initial when no name is provided', () => {
    const user = { name: '', email: 'alice@example.com' };
    render(<UserButton user={user} />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('calls handleSignOut when log out is clicked', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserButton user={user} />);

    const logOutItem = screen.getByText(/log out/i);
    fireEvent.click(logOutItem);

    expect(handleSignOut).toHaveBeenCalled();
  });
});
