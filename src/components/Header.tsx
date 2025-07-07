'use client';

import React from 'react';
import ProfileButton from '@/app/main/components/ProfileButton';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="text-xl font-bold">
        My App
      </Link>
      <nav>
        <ProfileButton />
      </nav>
    </header>
  );
};

export default Header;
