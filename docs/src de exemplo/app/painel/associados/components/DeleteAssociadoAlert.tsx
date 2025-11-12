import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Associado } from '@/types/associados';

interface DeleteAssociadoAlertProps {
  isOpen: boolean;
  onClose: () => void;
  associado: Associado;
}

export function DeleteAssociadoAlert({ isOpen, onClose, associado }: DeleteAssociadoAlertProps) {
  // Como não temos o hook useDeleteAssociado ainda, vamos criar uma função temporária
  const handleDelete = async (id: string) => {
    // Implementação temporária
    console.log('Excluindo associado:', id);
    // Aqui virá a implementação real com a action de deletar associado
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o associado <span className="font-semibold text-foreground">{associado.nome_completo}</span>?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              onClose();
              handleDelete(associado.id);
            }}
            type="button"
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
