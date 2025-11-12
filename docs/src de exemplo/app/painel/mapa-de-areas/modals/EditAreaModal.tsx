'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit, Loader2 } from 'lucide-react';
import { MapSearch } from '../components/MapSearch';
import type { Area } from '../hooks/useAreas';

interface EditAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: Area | null;
  onUpdateArea: (areaId: number, areaData: UpdateAreaData) => Promise<void>;
}

export interface UpdateAreaData {
  codigo_singaerj?: string;
  endereco_legado?: string;
  vagas?: number;
  posicao?: string;
  rotatividade?: string;
  referencia?: string;
  latitude?: number;
  longitude?: number;
  ativo?: boolean;
}

export function EditAreaModal({ open, onOpenChange, area, onUpdateArea }: EditAreaModalProps) {
  const [formData, setFormData] = useState<UpdateAreaData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);

  // Preencher formulário quando a área mudar
  useEffect(() => {
    if (area) {
      setFormData({
        codigo_singaerj: area.codigo_singaerj || '',
        endereco_legado: area.endereco_legado || area.endereco_formatado || '',
        vagas: area.vagas || 0,
        posicao: area.posicao || '',
        rotatividade: area.rotatividade || '',
        referencia: area.referencia || '',
        latitude: area.latitude ? parseFloat(area.latitude.toString()) : undefined,
        longitude: area.longitude ? parseFloat(area.longitude.toString()) : undefined,
        ativo: area.ativo ?? true
      });
      
      // Se há coordenadas, mostrar no mapa
      if (area.latitude && area.longitude) {
        const address = area.endereco_formatado || area.endereco_legado || '';
        setSelectedLocation({
          lat: parseFloat(area.latitude.toString()),
          lng: parseFloat(area.longitude.toString()),
          address
        });
      }
    }
  }, [area]);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    setFormData(prev => ({
      ...prev,
      endereco_legado: address,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!area || !formData.codigo_singaerj || !formData.endereco_legado) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateArea(area.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar área:', error);
      alert('Erro ao atualizar área. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UpdateAreaData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!area) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Área: {area.codigo_singaerj}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Ativo/Inativo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo ?? true}
              onCheckedChange={(checked) => handleInputChange('ativo', checked)}
            />
            <Label htmlFor="ativo">
              Área {formData.ativo ? 'Ativa' : 'Inativa'}
            </Label>
          </div>

          {/* Código SINGAERJ */}
          <div className="space-y-2">
            <Label htmlFor="codigo_singaerj">
              Código SINGAERJ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigo_singaerj"
              value={formData.codigo_singaerj || ''}
              onChange={(e) => handleInputChange('codigo_singaerj', e.target.value)}
              placeholder="Ex: CG01001"
              required
            />
          </div>

          {/* Busca de Endereço */}
          <div className="space-y-2">
            <Label>
              Endereço <span className="text-red-500">*</span>
            </Label>
            <MapSearch onLocationSelect={handleLocationSelect} />
            {selectedLocation && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                📍 Localização atual: {selectedLocation.address}
              </div>
            )}
          </div>

          {/* Número de Vagas */}
          <div className="space-y-2">
            <Label htmlFor="vagas">
              Número de Vagas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vagas"
              type="number"
              min="0"
              value={formData.vagas || 0}
              onChange={(e) => handleInputChange('vagas', parseInt(e.target.value) || 0)}
              placeholder="Ex: 10"
              required
            />
          </div>

          {/* Posição */}
          <div className="space-y-2">
            <Label htmlFor="posicao">Posição</Label>
            <Select 
              value={formData.posicao || ''} 
              onValueChange={(value) => handleInputChange('posicao', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="45º">45º</SelectItem>
                <SelectItem value="90º">90º</SelectItem>
                <SelectItem value="paralela">Paralela</SelectItem>
                <SelectItem value="perpendicular">Perpendicular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rotatividade */}
          <div className="space-y-2">
            <Label htmlFor="rotatividade">Rotatividade</Label>
            <Select 
              value={formData.rotatividade || ''} 
              onValueChange={(value) => handleInputChange('rotatividade', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a rotatividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="2h">2 horas</SelectItem>
                <SelectItem value="3h">3 horas</SelectItem>
                <SelectItem value="4h">4 horas</SelectItem>
                <SelectItem value="livre">Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referência */}
          <div className="space-y-2">
            <Label htmlFor="referencia">Referência</Label>
            <Textarea
              id="referencia"
              value={formData.referencia || ''}
              onChange={(e) => handleInputChange('referencia', e.target.value)}
              placeholder="Ex: Entre a Rua A e Rua B, lado direito"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
