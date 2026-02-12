'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Users, UserCheck } from 'lucide-react';

export function BottomBar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Lideranças',
      icon: Users,
      path: '/mobile/liderancas',
    },
    {
      label: 'Eleitores',
      icon: UserCheck,
      path: '/mobile/eleitores',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
