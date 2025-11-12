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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Associado } from '@/types/associados';
import { useFetchAssociadosOptions } from '../hooks/useFetchAssociadosOptions';

interface EditAssociadoModalProps {
  associado: Associado;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableField {
  key: keyof Associado | string; // String para campos aninhados
  label: string;
  type: 'text' | 'tel' | 'email' | 'date' | 'number' | 'textarea' | 'switch' | 'select';
  description?: string;
  options?: Array<{id: string | number, nome: string}>;
}

export function EditAssociadoModal({ associado: associadoInicial, isOpen, onClose }: EditAssociadoModalProps) {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | number | boolean | any>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [associado, setAssociado] = useState<Associado>(associadoInicial);
  
  const {
    estadoCivil,
    sexo,
    situacoes,
    estados,
    orgaosEmissores,
    loading: optionsLoading
  } = useFetchAssociadosOptions();

  // Campos básicos editáveis
  const EDITABLE_FIELDS: EditableField[] = [
    { key: 'nome_completo', label: 'Nome Completo', type: 'text', description: 'Nome completo do associado' },
    { key: 'matricula', label: 'Matrícula', type: 'text', description: 'Número de matrícula do associado' },
    { key: 'cpf', label: 'CPF', type: 'text', description: 'CPF do associado' },
    { key: 'telefone', label: 'Telefone', type: 'tel', description: 'Telefone principal para contato' },
    { key: 'email', label: 'E-mail', type: 'email', description: 'E-mail para contato' },
    { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
    { key: 'data_associacao', label: 'Data de Associação', type: 'date' },
    { 
      key: 'sexo', 
      label: 'Sexo', 
      type: 'select', 
      options: sexo
    },
    { 
      key: 'estado_civil', 
      label: 'Estado Civil', 
      type: 'select',
      options: estadoCivil 
    },
    { key: 'drt', label: 'DRT', type: 'text', description: 'Registro profissional' },
    { 
      key: 'situacao', 
      label: 'Situação', 
      type: 'select',
      options: [
        { id: 'ativo', nome: 'Ativo' },
        { id: 'inativo', nome: 'Inativo' },
        { id: 'pendente', nome: 'Pendente' }
      ]
    },
    { key: 'inadimplente', label: 'Inadimplente', type: 'switch', description: 'Indica se o associado está inadimplente' },
    { key: 'observacao', label: 'Observações', type: 'textarea' },
  ];

  // Campos de endereço
  const ENDERECO_FIELDS: EditableField[] = [
    { key: 'endereco_data.logradouro', label: 'Logradouro', type: 'text' },
    { key: 'endereco_data.numero', label: 'Número', type: 'text' },
    { key: 'endereco_data.complemento', label: 'Complemento', type: 'text' },
    { key: 'endereco_data.bairro', label: 'Bairro', type: 'text' },
    { key: 'endereco_data.cidade', label: 'Cidade', type: 'text' },
    { 
      key: 'endereco_data.uf', 
      label: 'UF', 
      type: 'select',
      options: estados
    },
    { key: 'endereco_data.cep', label: 'CEP', type: 'text' },
  ];

  // Campos de RG
  const RG_FIELDS: EditableField[] = [
    { key: 'rg_data.numero', label: 'Número do RG', type: 'text' },
    { 
      key: 'rg_data.orgao_emissor', 
      label: 'Órgão Emissor', 
      type: 'text'
    },
    { key: 'rg_data.data_emissao', label: 'Data de Emissão', type: 'date' },
  ];

  // Campos não editáveis
  const NON_EDITABLE_FIELDS: EditableField[] = [
    { key: 'created_at', label: 'Data de Cadastro', type: 'date' },
    { key: 'updated_at', label: 'Última Atualização', type: 'date' },
  ];

  useEffect(() => {
    setAssociado(associadoInicial);
  }, [associadoInicial]);

  // Função para obter o valor de um campo aninhado
  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return '';
      }
      value = value[part];
    }
    
    return value;
  };

  // Função para definir o valor de um campo aninhado
  const setNestedValue = (obj: any, path: string, value: any) => {
    const parts = path.split('.');
    let current = obj;
    
    // Navegar até o objeto pai do campo a ser atualizado
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    // Atualizar o valor do campo
    current[parts[parts.length - 1]] = value;
    return obj;
  };

  const handleEditClick = (field: string) => {
    setEditingField(field);
    
    // Obter o valor atual do campo (pode ser aninhado)
    const currentValue = field.includes('.') 
      ? getNestedValue(associado, field)
      : associado[field as keyof Associado];
    
    setEditValue(currentValue || '');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleConfirmEdit = async (field: string) => {
    // Validação básica
    if (typeof editValue === 'string' && editValue.trim() === '' && 
        !['observacao', 'endereco_data.complemento'].includes(field)) {
      toast.error('O campo não pode ficar vazio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Formatar o valor adequadamente conforme o tipo do campo
      let valueToUpdate = editValue;
      const fieldConfig = [...EDITABLE_FIELDS, ...ENDERECO_FIELDS, ...RG_FIELDS]
        .find(f => f.key === field);
      
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

      // Cria uma cópia profunda do associado para atualização
      const updatedAssociado = JSON.parse(JSON.stringify(associado));
      
      // Atualiza o valor no objeto (lida com campos aninhados)
      if (field.includes('.')) {
        setNestedValue(updatedAssociado, field, valueToUpdate);
      } else {
        updatedAssociado[field] = valueToUpdate;
      }

      // Atualiza o estado local do associado com os dados mais recentes
      setAssociado(updatedAssociado);

      // Aqui seria feita a atualização no banco de dados
      console.log('Campo atualizado:', field, 'com valor:', valueToUpdate);
      console.log('Associado atualizado:', updatedAssociado);
      
      // Quando implementar a API, irá atualizar o banco de dados aqui:
      // await supabase.from('associados').update(...).eq('id', associado.id);
      
      // Invalidar o cache para recarregar os dados da lista
      // queryClient.invalidateQueries({ queryKey: ['associados'] });
      
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

    if (field.type === 'select' && field.options) {
      return (
        <Select
          value={editValue as string}
          onValueChange={(value) => {
            setEditValue(value);
            handleConfirmEdit(field.key);
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Selecione ${field.label}`} />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {field.options.map((option) => (
              <SelectItem 
                key={option.id.toString()} 
                value={option.id.toString()}>
                {option.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <div className="relative">
        <Input
          type={field.type}
          value={editValue as string}
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

  // Função para formatar o valor conforme o tipo do campo
  const formatFieldValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-';
    
    if (type === 'date') {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return value || '-';
      }
    }
    
    if (type === 'switch') {
      return value ? 'Sim' : 'Não';
    }
    
    return value;
  };

  // Função para renderizar os grupos de campos
  const renderFieldGroup = (title: string, fields: EditableField[]) => {
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium">{title}</h3>
        {fields.map((field) => (
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
                    className="h-8 w-8 p-0"
                  >
                    <X size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfirmEdit(field.key)}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check size={14} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(field.key)}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  disabled={isSubmitting || editingField !== null}
                >
                  <Pencil size={14} />
                </Button>
              )}
            </div>

            {editingField === field.key ? (
              renderEditField(field)
            ) : (
              <div className="border-b pb-1 pt-0.5">
                {field.type === 'select' && field.options ? (
                  <span className="text-sm">
                    {field.options.find(opt => opt.id.toString() === getNestedValue(associado, field.key))?.nome || 
                     formatFieldValue(getNestedValue(associado, field.key), field.type)}
                  </span>
                ) : field.type === 'textarea' ? (
                  <span className="text-sm whitespace-pre-wrap">
                    {formatFieldValue(getNestedValue(associado, field.key), field.type)}
                  </span>
                ) : (
                  <span className="text-sm">
                    {formatFieldValue(getNestedValue(associado, field.key), field.type)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
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
            <span>Editar Associado</span>
            <span className="text-sm font-normal text-gray-500">
              (clique no lápis para editar cada campo)
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-4">
            {/* Informações Básicas */}
            {renderFieldGroup("Informações Básicas", EDITABLE_FIELDS)}
            
            {/* Endereço */}
            {renderFieldGroup("Endereço", ENDERECO_FIELDS)}
            
            {/* Documento - RG */}
            {renderFieldGroup("Documento - RG", RG_FIELDS)}
            
            {/* Informações de Sistema */}
            {renderFieldGroup("Informações do Sistema", NON_EDITABLE_FIELDS)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
