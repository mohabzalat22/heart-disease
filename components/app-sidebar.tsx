'use client';

import * as React from 'react';
import {
  FileText,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { handleSignOut } from '@/actions/authActions';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'prompt';

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const isAdminPath = pathname === '/admin';

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl"
      {...props}
    >
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-sidebar-accent/50 transition-colors"
            >
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none ml-2">
                  <span className="font-semibold text-sm">CardioAI Admin</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <Link href="/admin?view=prompt" className="w-full">
              <SidebarMenuButton
                isActive={isAdminPath && currentView === 'prompt'}
                tooltip="System Prompt"
                className={cn(
                  'px-4 py-6 hover:bg-sidebar-accent transition-all duration-200 w-full justify-start',
                  isAdminPath &&
                    currentView === 'prompt' &&
                    'bg-sidebar-accent shadow-sm ring-1 ring-border/50'
                )}
              >
                <FileText
                  className={cn(
                    'h-4 w-4 flex-shrink-0 mr-2',
                    isAdminPath && currentView === 'prompt'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'font-medium text-sm',
                    isAdminPath && currentView === 'prompt'
                      ? 'text-primary font-semibold'
                      : 'text-foreground/70'
                  )}
                >
                  System Prompt
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin?view=logs" className="w-full">
              <SidebarMenuButton
                isActive={isAdminPath && currentView === 'logs'}
                tooltip="User Logs"
                className={cn(
                  'px-4 py-6 hover:bg-sidebar-accent transition-all duration-200 w-full justify-start',
                  isAdminPath &&
                    currentView === 'logs' &&
                    'bg-sidebar-accent shadow-sm ring-1 ring-border/50'
                )}
              >
                <ShieldCheck
                  className={cn(
                    'h-4 w-4 flex-shrink-0 mr-2',
                    isAdminPath && currentView === 'logs'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'font-medium text-sm',
                    isAdminPath && currentView === 'logs'
                      ? 'text-primary font-semibold'
                      : 'text-foreground/70'
                  )}
                >
                  User Logs
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin?view=users" className="w-full">
              <SidebarMenuButton
                isActive={isAdminPath && currentView === 'users'}
                tooltip="Manage Users"
                className={cn(
                  'px-4 py-6 hover:bg-sidebar-accent transition-all duration-200 w-full justify-start',
                  isAdminPath &&
                    currentView === 'users' &&
                    'bg-sidebar-accent shadow-sm ring-1 ring-border/50'
                )}
              >
                <Users
                  className={cn(
                    'h-4 w-4 flex-shrink-0 mr-2',
                    isAdminPath && currentView === 'users'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'font-medium text-sm',
                    isAdminPath && currentView === 'users'
                      ? 'text-primary font-semibold'
                      : 'text-foreground/70'
                  )}
                >
                  Manage Users
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
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
      <SidebarRail />
    </Sidebar>
  );
}
