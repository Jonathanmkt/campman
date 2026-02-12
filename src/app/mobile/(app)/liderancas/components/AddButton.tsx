import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddButtonProps {
  onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <Button
      size="icon"
      className="fixed bottom-8 right-6 h-16 w-16 rounded-full aspect-square shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
      onClick={onClick}
    >
      <Plus className="h-7 w-7" />
    </Button>
  );
}
