import * as React from 'react';
import { getCookie, setCookie } from '@/lib/cookies';
import {
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_COOKIE_MAX_AGE,
  SidebarContext,
} from './sidebar-context';

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  SidebarProviderProps
>(({ children }) => {
  const [expanded, setExpanded] = React.useState(() => {
    const sidebarState = getCookie(SIDEBAR_COOKIE_NAME);
    return sidebarState ? sidebarState === 'expanded' : true;
  });

  React.useEffect(() => {
    setCookie(
      SIDEBAR_COOKIE_NAME,
      expanded ? 'expanded' : 'collapsed',
      SIDEBAR_COOKIE_MAX_AGE,
    );
  }, [expanded]);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = 'SidebarProvider';
