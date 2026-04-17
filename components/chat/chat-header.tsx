'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Search, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserButton } from '@/components/home/user-button';
import { useHistory } from '@/hooks/use-history';
import { ShareDialog } from '@/components/chat/share-dialog';

interface ChatHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  chatId: number;
  token: string;
  isShared: boolean;
}

export function ChatHeader({ user, chatId, token, isShared }: ChatHeaderProps) {
  const { openWithSearch } = useHistory();
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/60 px-4 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hover:bg-accent transition-colors duration-200" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-semibold tracking-tight sm:text-base">
          Heart Disease Risk Assessment
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          onClick={openWithSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
        </Button>
        {chatId > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        <Separator orientation="vertical" className="mx-1 h-4" />
        <UserButton user={user} />
      </div>

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        chatId={chatId}
        token={token}
        isShared={isShared}
      />
    </header>
  );
}
