import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberFormatInput } from "@/components/ui/number-format-input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea";
import { ProdutoFormProps } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/supabase/dropzone';
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload/useSupabaseUpload';
import { useState, useEffect } from 'react';
import { ProdutoStatus } from '../types/form-schema';

export function StepBasicInfo({ form }: ProdutoFormProps) {
  const { register, formState: { errors } } = form;
  
  // Garantir que o status seja inicializado como ativo
  useEffect(() => {
    // Sempre define o status como ATIVO ao montar o componente
    form.setValue('status', ProdutoStatus.ATIVO, { shouldValidate: true });
  }, []);
  
  return (
    <div className="space-y-4 pr-3">
      {/* Primeira linha - Nome do Produto e Estoque Inicial */}
      <div className="space-y-2 p-2">
        <div className="grid grid-cols-10 gap-4">
          {/* Nome do Produto - 70% */}
          <div className="col-span-7">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do produto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Estoque Inicial - 30% */}
          <div className="col-span-3">
            <FormField
              control={form.control}
              name="estoque_inicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Inicial*</FormLabel>
                  <FormControl>
                    <NumberFormatInput
                      placeholder="0"
                      value={field.value}
                      onChange={field.onChange}
                      allowDecimals={false}
                      min={0}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Segunda linha - Descrição */}
      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição do Produto</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva detalhes sobre o produto" 
                className="min-h-[100px] resize-y"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Terceira linha - FileUploader usando Supabase Dropzone */}
      <FormField
        control={form.control}
        name="imagens"
        render={({ field }) => {
          // useSupabaseUpload hook para configuração do componente Dropzone
          const dropzoneProps = useSupabaseUpload({
            bucketName: 'produtos',
            path: 'images/',
            allowedMimeTypes: ['image/*'],
            onUploadComplete: (urls) => {
              // Quando o upload for concluído, atualize o campo do formulário
              console.log('[StepBasicInfo] URLs recebidas:', urls);
              form.setValue('imagens', urls, { shouldValidate: true });
            }
          });
          
          return (
            <FormItem>
              <FormLabel>Imagens do Produto</FormLabel>
              <FormControl>
                <div className="w-full">
                  <Dropzone {...dropzoneProps}>
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Quarta linha - Status */}
      <FormField
        control={form.control}
        name="status"
        defaultValue={ProdutoStatus.ATIVO}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status do Produto*</FormLabel>
            <Select 
              defaultValue={ProdutoStatus.ATIVO} 
              onValueChange={field.onChange}
              value={field.value || ProdutoStatus.ATIVO}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={ProdutoStatus.ATIVO}>Ativo</SelectItem>
                <SelectItem value={ProdutoStatus.INATIVO}>Inativo</SelectItem>
                <SelectItem value={ProdutoStatus.RASCUNHO}>Rascunho</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
