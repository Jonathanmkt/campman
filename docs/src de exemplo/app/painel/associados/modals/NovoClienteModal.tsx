import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface NovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EnderecoForm {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;
}

interface ClienteForm {
  nome_completo: string;
  telefone: string; // Será normalizado para cliente_id
  email: string;
  observacoes: string;
  endereco: EnderecoForm;
}

const initialFormState: ClienteForm = {
  nome_completo: '',
  telefone: '',
  email: '',
  observacoes: '',
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: ''
  }
};

// Função para formatar o telefone com máscara
const formatTelefone = (value: string) => {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara conforme o tamanho do número
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

// Função para normalizar o telefone (remover formatação e adicionar 55)
const normalizeTelefone = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Adiciona o prefixo 55 se não existir
  if (numbers.startsWith('55')) {
    return numbers;
  }
  return `55${numbers}`;
};

export function NovoClienteModal({ isOpen, onClose }: NovoClienteModalProps) {
  const [form, setForm] = useState<ClienteForm>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Campo de endereço
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ClienteForm],
          [child]: value
        }
      }));
    } else if (name === 'telefone') {
      // Formata o telefone enquanto digita
      setForm(prev => ({
        ...prev,
        [name]: formatTelefone(value)
      }));
    } else {
      // Campo normal
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normaliza o telefone para o formato esperado (com 55)
      const cliente_id = normalizeTelefone(form.telefone);
      
      // Prepara o objeto de endereço
      const endereco = {
        logradouro: form.endereco.logradouro,
        numero: form.endereco.numero,
        complemento: form.endereco.complemento,
        bairro: form.endereco.bairro,
        cidade: form.endereco.cidade,
        cep: form.endereco.cep
      };

      // Insere o cliente na tabela clientes
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          nome_completo: form.nome_completo,
          cliente_id: cliente_id,
          email: form.email || null,
          observacoes: form.observacoes || null,
          endereco: endereco
        })
        .select('cliente_uuid')
        .single();

      if (clienteError) {
        throw new Error(clienteError.message);
      }

      // Cria o relacionamento com a filial
      // UUID fixo da filial - futuramente será dinâmico conforme contexto do usuário
      const FILIAL_UUID = '14911a2c-45a9-43c4-8ede-9dd5b02aa234';
      
      const { error: relacaoError } = await supabase
        .from('filiais_clientes')
        .insert({
          cliente_id: clienteData.cliente_uuid,
          filial_id: FILIAL_UUID
        });

      if (relacaoError) {
        throw new Error(relacaoError.message);
      }

      // Atualiza os dados na interface
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      
      toast.success('Cliente cadastrado com sucesso!');
      setForm(initialFormState);
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome Completo*</Label>
            <Input
              id="nome_completo"
              name="nome_completo"
              value={form.nome_completo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone*</Label>
            <Input
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Endereço</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Input
                  name="endereco.logradouro"
                  placeholder="Logradouro"
                  value={form.endereco.logradouro}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="endereco.numero"
                  placeholder="Número"
                  value={form.endereco.numero}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="endereco.complemento"
                  placeholder="Complemento"
                  value={form.endereco.complemento}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="endereco.bairro"
                  placeholder="Bairro"
                  value={form.endereco.bairro}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="endereco.cidade"
                  placeholder="Cidade"
                  value={form.endereco.cidade}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="endereco.cep"
                  placeholder="CEP"
                  value={form.endereco.cep}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
