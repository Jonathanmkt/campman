'use client';

import { useState } from 'react';
import { Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Formulário para admin convidar colaboradores ou coordenadores via email SMTP.
 * Usado na página de Configurações da campanha.
 */
export function ConviteMembroForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('colaborador');
  const [nomeConvidado, setNomeConvidado] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.includes('@')) {
      setError('Informe um email válido.');
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch('/api/dashboard/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
          nomeConvidado: nomeConvidado.trim() || undefined,
          telefone: telefone.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setEmail('');
        setNomeConvidado('');
        setTelefone('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.error || 'Erro ao enviar convite.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Convite enviado com sucesso! O convidado receberá um email para criar sua conta.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="convite-role">Cargo</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="convite-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colaborador">Colaborador</SelectItem>
              <SelectItem value="coordenador">Coordenador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="convite-email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="convite-email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="convite-nome">Nome (opcional)</Label>
          <Input
            id="convite-nome"
            placeholder="Nome do convidado"
            value={nomeConvidado}
            onChange={(e) => setNomeConvidado(e.target.value)}
          />
        </div>

        {role === 'coordenador' && (
          <div className="space-y-2">
            <Label htmlFor="convite-telefone">Telefone</Label>
            <Input
              id="convite-telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSending || !email.trim()}>
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Convite
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
