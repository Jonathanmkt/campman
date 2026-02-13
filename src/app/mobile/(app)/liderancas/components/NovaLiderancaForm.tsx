'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft, Check, Share2, Star } from 'lucide-react';
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

interface ConviteData {
  token: string;
  link_onboarding: string;
  mensagem_whatsapp: string;
  telefone: string;
}

export function NovaLiderancaForm({ onSuccess, onCancel, prefillData }: NovaLiderancaFormProps) {
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: prefillData?.nome || '',
    nome_popular: '',
    telefone: prefillData?.telefone ? formatarTelefone(prefillData.telefone) : '',
    tipo_lideranca: '',
    nivel_influencia: 3,
    alcance_estimado: '',
  });
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [conviteData, setConviteData] = useState<ConviteData | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  function formatarTelefone(valor: string) {
    let numeros = valor.replace(/\D/g, '');
    if (numeros.length > 11 && numeros.startsWith('55')) {
      numeros = numeros.slice(2);
    }
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
          nivel_influencia: formData.nivel_influencia,
          alcance_estimado: formData.alcance_estimado ? Number(formData.alcance_estimado) : null,
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
        if (result.data?.convite) {
          setConviteData(result.data.convite);
          setStep('success');
        } else {
          alert('Liderança cadastrada, mas não foi possível gerar o convite.');
          onSuccess();
        }
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


  const handleEnviarConvite = () => {
    if (!conviteData?.token || !conviteData?.telefone || !formData.nome_completo) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const linkConvite = `${appUrl}/mobile/onboarding?token=${conviteData.token}`;
    const telefoneNumeros = conviteData.telefone.replace(/\D/g, '');
    const telefoneComDDI = telefoneNumeros.startsWith('55') ? telefoneNumeros : `55${telefoneNumeros}`;
    const primeiroNome = formData.nome_completo.trim().split(/\s+/)[0] || formData.nome_completo;
    // TODO: buscar nome do candidato e cargo da tabela campanha (Etapa 1.2)
    const nomeCandidato = 'nosso candidato';
    const mensagem = `Oi ${primeiroNome}, tudo bem?\n\nEstou participando da campanha de ${nomeCandidato} e gostaria de lhe convidar pra fazer parte.\n\nPra aceitar basta clicar no link abaixo e cadastrar tua senha.\n\n${linkConvite}`;
    const mensagemCodificada = encodeURIComponent(mensagem);

    window.open(`https://wa.me/${telefoneComDDI}?text=${mensagemCodificada}`, '_blank');
  };

  // Tela de sucesso
  if (step === 'success' && conviteData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
            <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-base text-green-900">Liderança cadastrada com sucesso!</h3>
              <p className="text-sm text-green-700 mt-2">
                {formData.nome_completo} foi adicionado(a) à sua equipe.
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-14 bg-green-600 hover:bg-green-700 active:bg-green-800 text-base font-medium"
            onClick={handleEnviarConvite}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Enviar Convite
          </Button>
        </div>

        <div className="sticky bottom-0 bg-white pt-5 pb-6 border-t">
          <Button
            type="button"
            onClick={onSuccess}
            className="w-full h-14 text-base font-medium"
          >
            Finalizar
          </Button>
        </div>
      </div>
    );
  }

  // Etapa 1: Dados básicos
  if (step === 1) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleContinueToStep2(); }} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-5 pb-6">
          <div className="space-y-2.5">
            <Label htmlFor="nome_completo" className="text-base font-medium">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome_completo"
              placeholder="Digite o nome completo"
              value={formData.nome_completo}
              onChange={(e) => handleChange('nome_completo', e.target.value)}
              className="h-14 text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="nome_popular" className="text-base font-medium">
              Nome Popular (Apelido)
            </Label>
            <Input
              id="nome_popular"
              placeholder="Como é conhecido"
              value={formData.nome_popular}
              onChange={(e) => handleChange('nome_popular', e.target.value)}
              className="h-14 text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="telefone" className="text-base font-medium">
              Telefone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(21) 99999-9999"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              className="h-14 text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="tipo_lideranca" className="text-base font-medium">
              Tipo de Liderança <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tipo_lideranca}
              onValueChange={(value) => handleChange('tipo_lideranca', value)}
            >
              <SelectTrigger className="h-14 text-base">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comunitaria" className="text-base py-3">Comunitária</SelectItem>
                <SelectItem value="religiosa" className="text-base py-3">Religiosa</SelectItem>
                <SelectItem value="sindical" className="text-base py-3">Sindical</SelectItem>
                <SelectItem value="empresarial" className="text-base py-3">Empresarial</SelectItem>
                <SelectItem value="politica" className="text-base py-3">Política</SelectItem>
                <SelectItem value="social" className="text-base py-3">Social</SelectItem>
                <SelectItem value="esportiva" className="text-base py-3">Esportiva</SelectItem>
                <SelectItem value="cultural" className="text-base py-3">Cultural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white pt-5 pb-6 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-14 text-base font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-base font-medium"
          >
            Continuar
          </Button>
        </div>
      </form>
    );
  }

  // Etapa 2: Seleção de município, bairro, influência e alcance
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5 pb-6">
        <div className="space-y-2.5">
          <Label className="text-base font-medium">
            Município <span className="text-red-500">*</span>
          </Label>
          <MunicipioSearch
            onMunicipioSelect={handleMunicipioSelect}
            placeholder="Digite o nome do município..."
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-base font-medium">
            Bairro <span className="text-red-500">*</span>
          </Label>
          <AddressSearch
            onAddressSelect={handleAddressSelect}
            placeholder="Digite o nome do bairro..."
            cityFilter={selectedMunicipio?.nome || null}
            disabled={!selectedMunicipio}
          />
          {!selectedMunicipio && (
            <p className="text-sm text-muted-foreground mt-2">
              Selecione o município primeiro
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label className="text-base font-medium">
            Nível de Influência
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((nivel) => (
              <button
                key={nivel}
                type="button"
                onClick={() => handleChange('nivel_influencia', String(nivel))}
                className="flex-1 h-14 rounded-lg border-2 transition-all active:scale-95"
                style={{
                  borderColor: formData.nivel_influencia >= nivel ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: formData.nivel_influencia >= nivel ? '#eff6ff' : 'white',
                }}
              >
                <Star
                  className="mx-auto"
                  size={24}
                  fill={formData.nivel_influencia >= nivel ? '#3b82f6' : 'none'}
                  color={formData.nivel_influencia >= nivel ? '#3b82f6' : '#9ca3af'}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Avalie o nível de influência da liderança na comunidade
          </p>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="alcance_estimado" className="text-base font-medium">
            Alcance Estimado
          </Label>
          <Input
            id="alcance_estimado"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 150"
            value={formData.alcance_estimado}
            onChange={(e) => handleChange('alcance_estimado', e.target.value)}
            className="h-14 text-base"
            min="0"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade aproximada de eleitores que esta liderança pode alcançar
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-5 pb-6 border-t flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 h-14 text-base font-medium"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-base font-medium"
          disabled={isSubmitting || !selectedMunicipio || !selectedAddress}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            'Cadastrar'
          )}
        </Button>
      </div>
    </form>
  );
}
