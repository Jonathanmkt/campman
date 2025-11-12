import React, { useState, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Product } from '../types/produtos-types';

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableField {
  key: keyof Product;
  label: string;
  type: 'text' | 'tel' | 'email' | 'date' | 'number' | 'textarea' | 'switch' | 'url';
  description?: string;
}

const EDITABLE_FIELDS: EditableField[] = [
  { key: 'nome', label: 'Nome', type: 'text', description: 'Nome do produto' },
  { key: 'codigo_sku', label: 'Código SKU', type: 'text', description: 'Código único de identificação' },
  { key: 'preco_custo', label: 'Preço de Custo', type: 'number', description: 'Em R$' },
  { key: 'preco_venda', label: 'Preço de Venda', type: 'number', description: 'Em R$' },
  { key: 'preco_promocional', label: 'Preço Promocional', type: 'number', description: 'Em R$' },
  { key: 'descricao', label: 'Descrição', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'text', description: 'active ou inactive' },
  { key: 'estoque', label: 'Estoque', type: 'number' },
  { key: 'peso', label: 'Peso', type: 'number', description: 'Em kg' },
  { key: 'altura', label: 'Altura', type: 'number', description: 'Em cm' },
  { key: 'largura', label: 'Largura', type: 'number', description: 'Em cm' },
  { key: 'comprimento', label: 'Comprimento', type: 'number', description: 'Em cm' },
  { key: 'material', label: 'Material', type: 'text' },
  { key: 'marca', label: 'Marca/Fabricante', type: 'text' },
  { key: 'garantia', label: 'Garantia', type: 'number', description: 'Em meses' },
  { key: 'url_imagem', label: 'URL da Imagem', type: 'url' },
];

const NON_EDITABLE_FIELDS: EditableField[] = [
  { key: 'data_cadastro', label: 'Data de Cadastro', type: 'date' },
  { key: 'data_atualizacao', label: 'Última Atualização', type: 'date' },
];

export function EditProductModal({ product: productInicial, isOpen, onClose }: EditProductModalProps) {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<keyof Product | null>(null);
  const [editValue, setEditValue] = useState<string | number | boolean>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product>(productInicial);

  useEffect(() => {
    setProduct(productInicial);
  }, [productInicial]);

  const handleEditClick = (field: keyof Product) => {
    setEditingField(field);
    setEditValue(product[field]);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleConfirmEdit = async (field: keyof Product) => {
    // Validação específica por tipo de campo
    if (typeof editValue === 'string' && editValue.trim() === '' && field !== 'descricao') {
      toast.error('O campo não pode ficar vazio');
      return;
    }

    try {
      setIsSubmitting(true);
      // Formata o valor de acordo com o tipo do campo
      let valueToUpdate = editValue;
      const fieldConfig = EDITABLE_FIELDS.find(f => f.key === field);
      
      if (fieldConfig) {
        switch (fieldConfig.type) {
          case 'number':
            valueToUpdate = Number(editValue);
            if (isNaN(valueToUpdate as number)) {
              throw new Error('Valor inválido para campo numérico');
            }
            break;
          case 'date':
            if (!editValue) {
              valueToUpdate = null;
            }
            break;
          case 'switch':
            valueToUpdate = Boolean(editValue);
            break;
          default:
            if (typeof editValue === 'string') {
              valueToUpdate = editValue.trim();
            }
        }
      }

      // Aqui irá a chamada para atualizar o produto quando tivermos a action
      // Por enquanto, apenas atualizamos o estado local
      console.log('Atualizando campo:', field, 'com valor:', valueToUpdate);
      
      // Simulação de atualização (remove quando tiver a action)
      const updatedData = {
        ...product,
        [field]: valueToUpdate
      };

      // Atualiza o estado local do produto com os dados mais recentes
      setProduct(updatedData);

      // Invalida o cache para recarregar os dados em segundo plano (quando tivermos o React Query configurado)
      // queryClient.invalidateQueries({ queryKey: ['produtos'] });
      
      toast.success('Campo atualizado com sucesso!');
      setEditingField(null);
      setEditValue('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar campo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEditField = (field: EditableField) => {
    if (field.type === 'textarea') {
      return (
        <Textarea
          value={editValue as string}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px] resize-y"
          placeholder={`Digite as ${field.label.toLowerCase()}`}
          disabled={isSubmitting}
        />
      );
    }

    if (field.type === 'switch') {
      return (
        <Switch
          checked={editValue as boolean}
          onCheckedChange={(checked) => {
            setEditValue(checked);
            handleConfirmEdit(field.key);
          }}
          disabled={isSubmitting}
        />
      );
    }

    return (
      <div className="relative">
        <Input
          type={field.type}
          value={editValue}
          onChange={(e) => {
            const value = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
            setEditValue(value);
          }}
          className="pr-8 border-green-200 focus:ring-green-500 focus:border-green-500"
          min={field.type === 'number' ? 0 : undefined}
          step={field.type === 'number' ? 'any' : undefined}
          autoFocus
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleConfirmEdit(field.key);
            } else if (e.key === 'Escape') {
              handleCancelEdit();
            }
          }}
        />
        {isSubmitting && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span>Editar Produto</span>
            <span className="text-sm font-normal text-gray-500">
              (clique no lápis para editar cada campo)
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-4">
            {EDITABLE_FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                  </div>
                  {field.type !== 'switch' && editingField === field.key ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelEdit()}
                        disabled={isSubmitting}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">Cancelar edição</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfirmEdit(field.key)}
                        disabled={isSubmitting}
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span className="sr-only">Confirmar edição</span>
                      </Button>
                    </div>
                  ) : field.type !== 'switch' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(field.key)}
                      className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar {field.label.toLowerCase()}</span>
                    </Button>
                  )}
                </div>

                {editingField === field.key ? (
                  renderEditField(field)
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[40px] flex items-center">
                    {field.type === 'switch' ? (
                      <Switch
                        checked={Boolean(product[field.key])}
                        onCheckedChange={(checked) => {
                          setEditValue(checked);
                          handleConfirmEdit(field.key);
                        }}
                      />
                    ) : field.type === 'date' ? (
                      product[field.key] ? new Date(product[field.key]).toLocaleDateString('pt-BR') : '-'
                    ) : field.type === 'number' ? (
                      field.key === 'preco_venda' || field.key === 'preco_custo' || field.key === 'preco_promocional' ? 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product[field.key] || 0)) :
                        Number(product[field.key] || 0).toString()
                    ) : (
                      String(product[field.key] || '-')
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Campos não editáveis */}
            {NON_EDITABLE_FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-500">
                  {product[field.key] ? new Date(product[field.key]).toLocaleDateString('pt-BR') : '-'}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
