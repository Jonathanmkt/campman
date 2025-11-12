import { Loader2 } from 'lucide-react';
import { Button } from './button';
import { ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
}

export function LoadingButton({
  children,
  loading,
  success,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(
        'bg-primary text-white hover:bg-green-600 transition-colors duration-200',
        success && 'bg-green-600',
        className,
      )}
      disabled={loading || success}
      {...props}
    >
      {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {children}
    </Button>
  );
}
