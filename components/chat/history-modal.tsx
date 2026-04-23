'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Calendar, Loader2, Search, X } from 'lucide-react';
import { getUserChats } from '@/actions/chatActions';
import { Chat } from '@/generated/prisma';
import Link from 'next/link';
import { ChatActions } from './chat-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHistory } from '@/hooks/use-history';

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ChatGroup = {
  label: string;
  chats: Chat[];
};

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { searchQuery, setSearchQuery } = useHistory();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const fetchChats = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserChats();
      setChats(data || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchChats();
      // Auto-focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, fetchChats]);

  const groupChats = (chats: Chat[]): ChatGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: Record<string, Chat[]> = {
      Today: [],
      Yesterday: [],
      'Last 7 Days': [],
      Older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      if (chatDate >= today) {
        groups['Today'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= lastWeek) {
        groups['Last 7 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    return Object.entries(groups)
      .filter(([, chats]) => chats.length > 0)
      .map(([label, chats]) => ({ label, chats }));
  };

  const filteredChats = chats.filter((chat) =>
    (chat.title || 'New Assessment')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const groupedChats = groupChats(filteredChats);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-4xl p-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl gap-0">
        <DialogHeader className="p-6 pb-6 border-b border-border/10">
          <div className="flex flex-col gap-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Assessment History
            </DialogTitle>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                ref={searchInputRef}
                placeholder="Search by title..."
                className="pl-10 pr-10 h-11 bg-accent/20 border-border/10 focus-visible:ring-primary/20 transition-all duration-300 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Retrieving your assessment history...
              </p>
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-8">
              {groupedChats.map((group) => (
                <div key={group.label} className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {group.label}
                  </h3>
                  <div className="grid gap-2">
                    {group.chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="group relative flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-300"
                      >
                        <Link
                          href={`/chat/${chat.token}`}
                          className="flex-1 min-w-0"
                          onClick={() => onOpenChange(false)}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold truncate pr-4 group-hover:text-primary transition-colors">
                              {chat.title || 'New Assessment'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(chat.createdAt)}
                            </span>
                          </div>
                        </Link>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChatActions
                            token={chat.token}
                            initialTitle={chat.title || 'New Assessment'}
                            onUpdate={fetchChats}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
              <div className="p-5 rounded-3xl bg-muted/30 border border-border/50 shadow-inner">
                {searchQuery ? (
                  <Search className="h-9 w-9 text-muted-foreground/30" />
                ) : (
                  <MessageSquare className="h-9 w-9 text-muted-foreground/30" />
                )}
              </div>
              <div className="space-y-2 max-w-[280px]">
                <p className="text-xl font-bold tracking-tight">
                  {searchQuery ? 'No results found' : 'No assessments found'}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {searchQuery
                    ? `We couldn't find any assessments matching "${searchQuery}".`
                    : 'Your assessment history will appear here once you start your first conversation.'}
                </p>
                {searchQuery && (
                  <Button
                    variant="link"
                    className="text-primary font-semibold hover:no-underline px-0 h-auto mt-2"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search query
                  </Button>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
