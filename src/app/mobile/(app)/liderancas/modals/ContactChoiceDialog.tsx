import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ContactChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportFromContacts: () => void;
  onManualForm: () => void;
  isImporting: boolean;
}

export function ContactChoiceDialog({
  open,
  onOpenChange,
  onImportFromContacts,
  onManualForm,
  isImporting,
}: ContactChoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] mx-4">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Adicionar liderança</DialogTitle>
          <DialogDescription className="text-base">
            Escolha se prefere puxar dos contatos do aparelho ou digitar manualmente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Button
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-base"
            onClick={onImportFromContacts}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Abrindo contatos...
              </>
            ) : (
              'Escolher dos contatos'
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-base"
            onClick={onManualForm}
            disabled={isImporting}
          >
            Digitar manualmente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
