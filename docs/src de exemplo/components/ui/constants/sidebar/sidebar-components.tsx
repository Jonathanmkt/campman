import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { sidebarVariants } from './sidebar';
import { SidebarContext, SIDEBAR_WIDTH } from './sidebar-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  to: string;
  icon: React.ReactNode;
}

export function SidebarItem({
  className,
  to,
  icon,
  children,
  ...props
}: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <div
        className={cn(
          sidebarVariants({ variant: isActive ? 'active' : 'default' }),
          className,
        )}
        {...props}
      >
        {icon}
        {children}
      </div>
    </Link>
  );
}

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    children: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  const { expanded } = React.useContext(SidebarContext);

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-full flex-col justify-between border-r border-border bg-background px-3 py-4 transition-[width] duration-300',
        expanded ? `w-[${SIDEBAR_WIDTH}]` : 'w-[4.5rem]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ children, className, ...props }, ref) => {
  const { expanded } = React.useContext(SidebarContext);

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 px-3',
        expanded ? 'justify-between' : 'justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ children, className, ...props }, ref) => {
  const { expanded } = React.useContext(SidebarContext);

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2',
        expanded ? 'items-stretch' : 'items-center',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarContent.displayName = 'SidebarContent';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ children, className, ...props }, ref) => {
  const { expanded } = React.useContext(SidebarContext);

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3',
        expanded ? 'justify-between' : 'justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarFooter.displayName = 'SidebarFooter';

export const SidebarTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    tooltip: string;
  }
>(({ tooltip, children, ...props }, ref) => {
  const { expanded } = React.useContext(SidebarContext);

  if (expanded) {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div ref={ref} {...props}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side='right'>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
SidebarTooltip.displayName = 'SidebarTooltip';
