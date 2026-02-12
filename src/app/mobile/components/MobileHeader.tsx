'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuHamburger } from './MenuHamburger';
import Image from 'next/image';
import logo from '@/app/favicon.png';

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-blue-600 text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="Logo CampMan" className="h-8 w-8 rounded-full" priority />
            <h1 className="text-lg font-semibold">CampMan</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <MenuHamburger open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
