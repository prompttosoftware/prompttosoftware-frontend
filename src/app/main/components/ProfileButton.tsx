'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProfileButton = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => router.push('/login')}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
      >
        Login
      </Button>
    );
  }

  // Authenticated state: Display profile icon and dropdown
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full profile-button">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl || '/avatars/01.png'} alt="User Avatar" />
            <AvatarFallback>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative z-[60] max-h-96 min-w-[8rem] rounded-md border bg-gray-700 text-white shadow-md">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
            {user?.balance !== undefined && (
              <p className="text-xs leading-none text-muted-foreground">
                Balance: {user.balance} credits
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/main/settings')}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;
