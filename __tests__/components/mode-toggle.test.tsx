import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle } from '@/components/mode-toggle';
import { useTheme } from 'next-themes';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ModeToggle', () => {
  it('toggles theme from dark to light', () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', setTheme });

    render(<ModeToggle />);

    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('toggles theme from light to dark', () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme });

    render(<ModeToggle />);

    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
