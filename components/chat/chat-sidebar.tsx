'use client';

import * as React from 'react';
import {
  Plus,
  MessageSquare,
  History,
  Settings,
  MoreHorizontal,
  User,
  LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { handleSignOut } from '@/actions/authActions';
import { Chat } from '@/generated/prisma';
import { createNewChat } from '@/actions/chatActions';
import { ChatActions } from './chat-actions';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';
import { HistoryModal } from './history-modal';

interface ChatSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  chats: Chat[];
}

export function ChatSidebar({ user, chats }: ChatSidebarProps) {
  const { isOpen, setIsOpen } = useHistory();
  const pathname = usePathname();
  const currentChatToken = pathname.split('/').pop();

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <form action={createNewChat}>
          <Button
            type="submit"
            className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </form>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length > 0 ? (
                chats.map((chat: Chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <div className="flex items-center w-full group/chatitem">
                      <Link
                        href={`/chat/${chat.token}`}
                        className="flex-1 min-w-0"
                      >
                        <SidebarMenuButton
                          isActive={currentChatToken === chat.token}
                          className={cn(
                            'px-4 py-6 hover:bg-sidebar-accent transition-all duration-200 w-full',
                            currentChatToken === chat.token &&
                              'bg-sidebar-accent shadow-sm ring-1 ring-border/50'
                          )}
                        >
                          <MessageSquare
                            className={cn(
                              'h-4 w-4 flex-shrink-0 mr-2',
                              currentChatToken === chat.token
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'truncate',
                              currentChatToken === chat.token &&
                                'font-semibold text-primary'
                            )}
                          >
                            {chat.title || 'New Assessment'}
                          </span>
                        </SidebarMenuButton>
                      </Link>
                      <div className="pr-2 opacity-0 group-hover/chatitem:opacity-100 transition-opacity flex-shrink-0">
                        <ChatActions
                          token={chat.token}
                          initialTitle={chat.title || 'New Assessment'}
                        />
                      </div>
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-muted-foreground/60">
                  No recent assessments
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-4 py-6 hover:bg-sidebar-accent transition-colors duration-200"
                  onClick={() => setIsOpen(true)}
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span>View full history</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <HistoryModal open={isOpen} onOpenChange={setIsOpen} />
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full h-12 hover:bg-sidebar-accent transition-colors duration-200">
                  <Avatar className="h-8 w-8 ring-1 ring-border/50">
                    <AvatarImage src={user.image || ''} />
                    <AvatarFallback className="bg-rose-500 text-white text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-xs ml-2 overflow-hidden">
                    <span className="font-medium truncate w-full">
                      {user.name}
                    </span>
                    <span className="text-muted-foreground truncate w-full">
                      {user.email}
                    </span>
                  </div>
                  <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-60 p-2"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal px-2 py-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/settings?tab=profile">
                    <DropdownMenuItem className="cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings?tab=prompt">
                    <DropdownMenuItem className="cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Settings</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2 text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/30"
                  onSelect={() => handleSignOut()}
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
