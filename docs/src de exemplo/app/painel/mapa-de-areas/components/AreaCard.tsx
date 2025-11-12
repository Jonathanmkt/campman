import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Users } from 'lucide-react';
import { AssociadosCarousel } from './AssociadosCarousel';

interface Associado {
  id: number;
  nome: string;
  matricula: string;
  foto: string;
  cargo: string;
}

interface Area {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  telefone: string;
  status: string;
  associados: Associado[];
}

interface AreaCardProps {
  area: Area;
}

export function AreaCard({ area }: AreaCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4 h-32">
          {/* Carrossel de associados - 1/3 do card */}
          <div className="w-1/3 flex-shrink-0">
            <AssociadosCarousel associados={area.associados} />
          </div>
          
          {/* Informações da área - 2/3 do card */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Header com nome e status */}
            <div className="mb-2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-gray-900 truncate">
                  {area.nome}
                </h3>
                <Badge 
                  variant={area.status === 'Ativo' ? 'default' : 'secondary'}
                  className="text-xs flex-shrink-0"
                >
                  {area.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {area.descricao}
              </p>
            </div>
            
            {/* Informações de contato */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{area.endereco}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span>{area.telefone}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>
                  {area.associados.length} associado{area.associados.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
