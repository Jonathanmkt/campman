'use client';

import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NovaLiderancaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  prefillData?: {
    nome?: string;
    telefone?: string;
  } | null;
}

interface ConviteResult {
  link_onboarding: string;
  mensagem_whatsapp: string;
  telefone: string;
  nome: string;
}

interface CoordenadorOption {
  id: string;
  profile_id: string;
  nome: string;
  telefone?: string | null;
}

export function NovaLiderancaForm({ onSuccess, onCancel, prefillData }: NovaLiderancaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conviteGerado, setConviteGerado] = useState<ConviteResult | null>(null);
  const [copiado, setCopiado] = useState<'link' | 'mensagem' | null>(null);
  const [coordenadores, setCoordenadores] = useState<CoordenadorOption[]>([]);
  const [selectedCoordenadorId, setSelectedCoordenadorId] = useState<string>('');
  const [isLoadingCoordenadores, setIsLoadingCoordenadores] = useState(true);
  const [formData, setFormData] = useState({
    nome_completo: '',
    nome_popular: '',
    telefone: '',
    tipo_lideranca: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    handleChange('telefone', formatted);
  };

  useEffect(() => {
    if (!prefillData) return;
    setFormData(prev => ({
      ...prev,
      nome_completo: prefillData.nome ?? prev.nome_completo,
      telefone: prefillData.telefone
        ? formatarTelefone(prefillData.telefone)
        : prev.telefone,
    }));
  }, [prefillData]);

  useEffect(() => {
    const carregarCoordenadores = async () => {
      try {
        setIsLoadingCoordenadores(true);
        const response = await fetch('/api/mobile/coordenadores');
        const result = await response.json();

        if (result.success) {
          setCoordenadores(result.data || []);
          if ((result.data || []).length > 0) {
            setSelectedCoordenadorId(result.data[0].id);
          }
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao carregar coordenadores:', error);
      } finally {
        setIsLoadingCoordenadores(false);
      }
    };

    carregarCoordenadores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (!formData.telefone.trim()) {
      alert('Telefone é obrigatório para enviar o convite');
      return;
    }

    if (!formData.tipo_lideranca) {
      alert('Tipo de liderança é obrigatório');
      return;
    }

    const coordenadorSelecionado = coordenadores.find((c) => c.id === selectedCoordenadorId);

    if (!coordenadorSelecionado) {
      alert('Selecione o coordenador responsável');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/mobile/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: formData.nome_completo.trim(),
          nome_popular: formData.nome_popular.trim() || null,
          telefone: formData.telefone,
          tipo_lideranca: formData.tipo_lideranca,
          coordenador_regional_id: coordenadorSelecionado.id,
          created_by: coordenadorSelecionado.profile_id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConviteGerado({
          link_onboarding: result.data.link_onboarding,
          mensagem_whatsapp: result.data.mensagem_whatsapp,
          telefone: result.data.telefone,
          nome: formData.nome_completo,
        });
      } else {
        alert(result.error || 'Erro ao criar convite');
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      alert('Erro ao criar convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copiarParaClipboard = async (texto: string, tipo: 'link' | 'mensagem') => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      alert('Não foi possível copiar. Selecione o texto manualmente.');
    }
  };

  const abrirWhatsApp = () => {
    if (!conviteGerado) return;
    const telefoneNumeros = conviteGerado.telefone.replace(/\D/g, '');
    const telefoneFormatado = telefoneNumeros.startsWith('55') ? telefoneNumeros : `55${telefoneNumeros}`;
    const mensagemCodificada = encodeURIComponent(conviteGerado.mensagem_whatsapp);
    window.open(`https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`, '_blank');
  };

  const handleNovoConvite = () => {
    setConviteGerado(null);
    setFormData({
      nome_completo: '',
      nome_popular: '',
      telefone: '',
      tipo_lideranca: '',
    });
  };

  // Tela de sucesso com link gerado
  if (conviteGerado) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Convite criado com sucesso para <strong>{conviteGerado.nome}</strong>!
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Link de cadastro</Label>
              <div className="flex gap-2">
                <Input
                  value={conviteGerado.link_onboarding}
                  readOnly
                  className="h-12 text-xs bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  onClick={() => copiarParaClipboard(conviteGerado.link_onboarding, 'link')}
                >
                  {copiado === 'link' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mensagem para WhatsApp</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap border">
                {conviteGerado.mensagem_whatsapp}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => copiarParaClipboard(conviteGerado.mensagem_whatsapp, 'mensagem')}
                >
                  {copiado === 'mensagem' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar mensagem
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                  onClick={abrirWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar WhatsApp
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                O convite expira em 48 horas. A liderança receberá o link e poderá criar sua senha para acessar o app.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => window.open(conviteGerado.link_onboarding, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Testar link (abre em nova aba)
              </Button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="flex-1 h-12"
          >
            Voltar à lista
          </Button>
          <Button
            type="button"
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
            onClick={handleNovoConvite}
          >
            Novo convite
          </Button>
        </div>
      </div>
    );
  }

  // Formulário de cadastro
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <Alert className="bg-blue-50 border-blue-200">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Preencha os dados e envie o convite por WhatsApp. A liderança receberá um link para criar sua senha.
          </AlertDescription>
        </Alert>

        {/* Nome Completo */}
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

        {/* Nome Popular */}
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

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-sm font-medium">
            Telefone (WhatsApp) <span className="text-red-500">*</span>
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
          <p className="text-xs text-muted-foreground">
            O convite será enviado para este número
          </p>
        </div>

        {/* Coordenador responsável */}
        <div className="space-y-2">
          <Label htmlFor="coordenador" className="text-sm font-medium">
            Coordenador responsável <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedCoordenadorId}
            onValueChange={setSelectedCoordenadorId}
            disabled={isLoadingCoordenadores || coordenadores.length === 0}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder={isLoadingCoordenadores ? 'Carregando...' : 'Selecione o coordenador'} />
            </SelectTrigger>
            <SelectContent>
              {coordenadores.map((coord) => (
                <SelectItem key={coord.id} value={coord.id}>
                  {coord.nome} {coord.telefone ? `- ${coord.telefone}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {coordenadores.length === 0 && !isLoadingCoordenadores && (
            <p className="text-xs text-red-500">
              Nenhum coordenador encontrado. Cadastre um coordenador antes de criar convites.
            </p>
          )}
        </div>

        {/* Tipo de Liderança */}
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

      {/* Botões de ação */}
      <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Convite'
          )}
        </Button>
      </div>
    </form>
  );
}
