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

interface ChatSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  chats: Chat[];
}

export function ChatSidebar({ user, chats }: ChatSidebarProps) {
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
        <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md">
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
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
                    <SidebarMenuButton className="px-4 py-6 hover:bg-sidebar-accent transition-colors duration-200">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {chat.title || 'New Assessment'}
                      </span>
                    </SidebarMenuButton>
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
                <SidebarMenuButton className="px-4 py-6 hover:bg-sidebar-accent transition-colors duration-200">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span>View full history</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
