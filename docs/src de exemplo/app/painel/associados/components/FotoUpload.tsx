'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FotoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function FotoUpload({ value, onChange, className }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Atualiza o preview quando o arquivo muda
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      // Limpa o URL quando o componente desmonta ou o arquivo muda
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Valida se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Valida tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        {/* Container da foto */}
        <div
          onClick={!preview ? handleClick : undefined}
          className={cn(
            'w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors',
            !preview && 'cursor-pointer hover:border-primary hover:bg-primary/5',
            preview && 'border-solid border-gray-300'
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Camera size={32} />
              <span className="text-xs text-center px-2">Adicionar foto</span>
            </div>
          )}
        </div>

        {/* Botão de remover */}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 hover:text-gray-700 transition-colors shadow-md"
            title="Remover foto"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Botão para trocar foto */}
      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="w-32"
        >
          Trocar foto
        </Button>
      )}

      {/* Removidas informações de formato e tamanho */}
    </div>
  );
}
