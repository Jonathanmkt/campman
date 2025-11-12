'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2 } from 'lucide-react';
import { MapSearch } from '../components/MapSearch';

interface CreateAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateArea: (areaData: CreateAreaData) => Promise<void>;
}

export interface CreateAreaData {
  codigo_singaerj: string;
  endereco_legado: string;
  vagas: number;
  posicao?: string;
  rotatividade?: string;
  referencia?: string;
  latitude?: number;
  longitude?: number;
}

export function CreateAreaModal({ open, onOpenChange, onCreateArea }: CreateAreaModalProps) {
  const [formData, setFormData] = useState<CreateAreaData>({
    codigo_singaerj: '',
    endereco_legado: '',
    vagas: 0,
    posicao: '',
    rotatividade: '',
    referencia: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);

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
    
    if (!formData.codigo_singaerj || !formData.endereco_legado) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateArea(formData);
      // Reset form
      setFormData({
        codigo_singaerj: '',
        endereco_legado: '',
        vagas: 0,
        posicao: '',
        rotatividade: '',
        referencia: ''
      });
      setSelectedLocation(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar área:', error);
      alert('Erro ao criar área. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateAreaData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Criar Nova Área
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código SINGAERJ */}
          <div className="space-y-2">
            <Label htmlFor="codigo_singaerj">
              Código SINGAERJ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigo_singaerj"
              value={formData.codigo_singaerj}
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
                📍 Localização selecionada: {selectedLocation.address}
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
              value={formData.vagas}
              onChange={(e) => handleInputChange('vagas', parseInt(e.target.value) || 0)}
              placeholder="Ex: 10"
              required
            />
          </div>

          {/* Posição */}
          <div className="space-y-2">
            <Label htmlFor="posicao">Posição</Label>
            <Select onValueChange={(value) => handleInputChange('posicao', value)}>
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
            <Select onValueChange={(value) => handleInputChange('rotatividade', value)}>
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
              value={formData.referencia}
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
              Criar Área
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
