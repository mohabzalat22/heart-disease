'use client';

import * as React from 'react';

interface HistoryContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openWithSearch: () => void;
}

const HistoryContext = React.createContext<HistoryContextType | undefined>(
  undefined
);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const openWithSearch = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  // Clear search query when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <HistoryContext.Provider
      value={{ isOpen, setIsOpen, searchQuery, setSearchQuery, openWithSearch }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = React.useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
