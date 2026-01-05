'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MunicipioSearch, MunicipioData } from './MunicipioSearch';
import { AddressSearch, AddressData } from './AddressSearch';

interface NovaLiderancaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  prefillData?: {
    nome?: string;
    telefone?: string;
  } | null;
}

export function NovaLiderancaForm({ onSuccess, onCancel, prefillData }: NovaLiderancaFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: prefillData?.nome || '',
    nome_popular: '',
    telefone: prefillData?.telefone ? formatarTelefone(prefillData.telefone) : '',
    tipo_lideranca: '',
  });
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    handleChange('telefone', formatted);
  };

  const handleContinueToStep2 = () => {
    if (!formData.nome_completo.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (!formData.telefone.trim()) {
      alert('Telefone é obrigatório');
      return;
    }

    if (!formData.tipo_lideranca) {
      alert('Tipo de liderança é obrigatório');
      return;
    }

    setStep(2);
  };

  const handleMunicipioSelect = (municipio: MunicipioData) => {
    setSelectedMunicipio(municipio);
    setSelectedAddress(null);
  };

  const handleAddressSelect = (address: AddressData) => {
    setSelectedAddress(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMunicipio) {
      alert('Selecione o município');
      return;
    }

    if (!selectedAddress) {
      alert('Selecione o bairro');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/mobile/liderancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: formData.nome_completo.trim(),
          nome_popular: formData.nome_popular.trim() || null,
          telefone: formData.telefone,
          tipo_lideranca: formData.tipo_lideranca,
          cidade: selectedMunicipio.nome,
          estado: selectedMunicipio.uf,
          bairro: selectedAddress.bairro,
          endereco_formatado: selectedAddress.endereco_formatado,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Liderança cadastrada com sucesso!');
        onSuccess();
      } else {
        alert(result.error || 'Erro ao cadastrar liderança');
      }
    } catch (error) {
      console.error('Erro ao cadastrar liderança:', error);
      alert('Erro ao cadastrar liderança');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Etapa 1: Dados básicos
  if (step === 1) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleContinueToStep2(); }} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="nome_completo" className="text-sm font-medium">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome_completo"
              placeholder="Digite o nome completo"
              value={formData.nome_completo}
              onChange={(e) => handleChange('nome_completo', e.target.value)}
              className="h-12"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_popular" className="text-sm font-medium">
              Nome Popular (Apelido)
            </Label>
            <Input
              id="nome_popular"
              placeholder="Como é conhecido"
              value={formData.nome_popular}
              onChange={(e) => handleChange('nome_popular', e.target.value)}
              className="h-12"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-sm font-medium">
              Telefone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(21) 99999-9999"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              className="h-12"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_lideranca" className="text-sm font-medium">
              Tipo de Liderança <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tipo_lideranca}
              onValueChange={(value) => handleChange('tipo_lideranca', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comunitaria">Comunitária</SelectItem>
                <SelectItem value="religiosa">Religiosa</SelectItem>
                <SelectItem value="sindical">Sindical</SelectItem>
                <SelectItem value="empresarial">Empresarial</SelectItem>
                <SelectItem value="politica">Política</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="esportiva">Esportiva</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            Continuar
          </Button>
        </div>
      </form>
    );
  }

  // Etapa 2: Seleção de município e bairro
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Município <span className="text-red-500">*</span>
          </Label>
          <MunicipioSearch
            onMunicipioSelect={handleMunicipioSelect}
            placeholder="Digite o nome do município..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Bairro <span className="text-red-500">*</span>
          </Label>
          <AddressSearch
            onAddressSelect={handleAddressSelect}
            placeholder="Digite o nome do bairro..."
            cityFilter={selectedMunicipio?.nome || null}
            disabled={!selectedMunicipio}
          />
          {!selectedMunicipio && (
            <p className="text-xs text-muted-foreground">
              Selecione o município primeiro
            </p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 h-12"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting || !selectedMunicipio || !selectedAddress}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Cadastrar Liderança'
          )}
        </Button>
      </div>
    </form>
  );
}
