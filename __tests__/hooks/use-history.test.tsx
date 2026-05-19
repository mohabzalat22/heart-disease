/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { HistoryProvider, useHistory } from '@/hooks/use-history';

describe('useHistory', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <HistoryProvider>{children}</HistoryProvider>
  );

  it('throws when used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useHistory())).toThrow(
      'useHistory must be used within a HistoryProvider'
    );
    spy.mockRestore();
  });

  it('starts with isOpen=false and empty search', () => {
    const { result } = renderHook(() => useHistory(), { wrapper });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchQuery).toBe('');
  });

  it('can toggle open state', () => {
    const { result } = renderHook(() => useHistory(), { wrapper });
    act(() => result.current.setIsOpen(true));
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.setIsOpen(false));
    expect(result.current.isOpen).toBe(false);
  });

  it('clears search query when modal closes', () => {
    const { result } = renderHook(() => useHistory(), { wrapper });
    act(() => {
      result.current.setIsOpen(true);
      result.current.setSearchQuery('test query');
    });
    expect(result.current.searchQuery).toBe('test query');

    act(() => result.current.setIsOpen(false));
    expect(result.current.searchQuery).toBe('');
  });

  it('openWithSearch opens the modal', () => {
    const { result } = renderHook(() => useHistory(), { wrapper });
    act(() => result.current.openWithSearch());
    expect(result.current.isOpen).toBe(true);
  });
});
