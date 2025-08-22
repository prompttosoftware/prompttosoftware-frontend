'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SkeletonLoader from './SkeletonLoader';

const ProfileButton = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  if (isLoading) {
    return <SkeletonLoader width="w-8" height="h-8" className="rounded-full" />;
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => router.push('/login')}
        className="bg-primary hover:bg-primar-hover text-primary-foreground hover:text-primary-foreground px-4 py-2 text-sm"
      >
        Login
      </Button>
    );
  }

  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full profile-button">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || '/avatars/01.png'} alt="User Avatar" />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;
