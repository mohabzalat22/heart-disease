'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { handleSignOut } from '@/actions/authActions';
import Link from 'next/link';

interface UserButtonProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserButton({ user }: UserButtonProps) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full border border-border/50 p-0 hover:bg-muted/50"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name} />
            <AvatarFallback className="bg-rose-500 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 p-2"
        align="end"
        sideOffset={8}
        forceMount
      >
        <DropdownMenuLabel className="font-normal px-2 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold leading-tight text-foreground">
              {user.name}
            </p>
            <p className="text-xs font-medium leading-none text-muted-foreground truncate">
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
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="cursor-pointer py-2 text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/30"
          onSelect={() => {
            const form = document.createElement('form');
            form.action = '/api/logout'; // We should probably use a client-side trigger or the server action properly
            // Actually, handleSignOut is a server action, let's try calling it.
            handleSignOut();
          }}
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          <span className="text-sm font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
