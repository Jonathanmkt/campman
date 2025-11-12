import { cva } from 'class-variance-authority';

export const sidebarVariants = cva('group flex flex-col gap-4 py-2 px-3', {
  variants: {
    variant: {
      default: 'hover:bg-accent rounded-lg transition-all',
      active: 'bg-accent rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
