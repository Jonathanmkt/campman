import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NovaLiderancaForm } from '../components/NovaLiderancaForm';

interface NovaLiderancaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData: { nome?: string; telefone?: string } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NovaLiderancaModal({
  open,
  onOpenChange,
  prefillData,
  onSuccess,
  onCancel,
}: NovaLiderancaModalProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl px-5">
        <SheetHeader className="pb-6 pt-2">
          <SheetTitle className="text-xl">Nova Liderança</SheetTitle>
        </SheetHeader>
        <NovaLiderancaForm
          prefillData={prefillData}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </SheetContent>
    </Sheet>
  );
}
