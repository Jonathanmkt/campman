'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { ProdutoFormProps } from "./types";
import { Switch } from "@/components/ui/switch";
import { MultiBadgeSelector } from "@/components/ui/selectable-badge";
import { useFetchOptions } from "../hooks/useFetchOptions";

export function StepAdditionalInfo({ form }: ProdutoFormProps) {
  const { 
    categories, 
    tags, 
    occasions, 
    targetAudience, 
    freightConditions, 
    materials,
    loading, 
    error 
  } = useFetchOptions();

  return (
    <div className="space-y-6 pr-3">
      {error && <div className="text-red-500 p-2 bg-red-50 rounded">Erro ao carregar opções: {error}</div>}
      
      {/* Linha 1 - Destaque toggle */}
      <div className="flex items-center justify-between pb-4">
        <FormField
          control={form.control}
          name="destaque"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
              <div className="space-y-0.5">
                <FormLabel>Destacar Produto</FormLabel>
                <FormDescription>
                  Produtos destacados aparecem em posição privilegiada no site
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Linha 2 - Seletor de categorias */}
      <div className="pt-4 pb-4">
        <FormField
          control={form.control}
          name="categorias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categorias</FormLabel>
              <FormControl>
                <MultiBadgeSelector 
                  options={categories} 
                  selectedIds={Array.isArray(field.value) ? field.value : []} 
                  onChange={(ids) => {
                    // Log detalhado para debug
                    const selectedCategories = categories.filter(cat => ids.includes(cat.id));
                    console.log('Categorias selecionadas:', selectedCategories.map(cat => ({
                      uuid: cat.id,
                      nome: cat.nome
                    })));
                    
                    form.setValue('categorias', ids, { shouldValidate: true });
                    
                    // Log do valor atual no formulário
                    console.log('Valor no formulário (categorias):', form.getValues('categorias'));
                  }} 
                  loading={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Linha 3 - Seletor de tags */}
      <div className="pt-4 pb-4 border-t border-gray-200">
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiBadgeSelector 
                  options={tags} 
                  selectedIds={Array.isArray(field.value) ? field.value : []} 
                  onChange={(ids) => {
                    console.log('Tags onChange:', {
                      uuids: ids,
                      nomes: ids.map(id => tags.find(tag => tag.id === id)?.nome)
                    });
                    form.setValue('tags', ids, { shouldValidate: true });
                  }} 
                  loading={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Linha 4 - Seletor de ocasiões */}
      <div className="pt-4 pb-4 border-t border-gray-200">
        <FormField
          control={form.control}
          name="ocasioes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ocasiões</FormLabel>
              <FormControl>
                <MultiBadgeSelector 
                  options={occasions} 
                  selectedIds={Array.isArray(field.value) ? field.value : []} 
                  onChange={(ids) => {
                    console.log('Ocasiões onChange:', {
                      uuids: ids,
                      nomes: ids.map(id => occasions.find(occ => occ.id === id)?.nome)
                    });
                    form.setValue('ocasioes', ids, { shouldValidate: true });
                  }} 
                  loading={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Linha 5 - Seletor de público-alvo */}
      <div className="pt-4 pb-4 border-t border-gray-200">
        <FormField
          control={form.control}
          name="publico_alvo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Público-alvo</FormLabel>
              <FormControl>
                <MultiBadgeSelector 
                  options={targetAudience} 
                  selectedIds={Array.isArray(field.value) ? field.value : []} 
                  onChange={(ids) => {
                    console.log('Público-alvo onChange:', {
                      uuids: ids,
                      nomes: ids.map(id => targetAudience.find(ta => ta.id === id)?.nome)
                    });
                    form.setValue('publico_alvo', ids, { shouldValidate: true });
                  }} 
                  loading={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Linha 6 - Condições de frete */}
      <div className="pt-4 pb-4 border-t border-gray-200">
        <FormField
          control={form.control}
          name="condicao_frete"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condições de Frete</FormLabel>
              <FormControl>
                <MultiBadgeSelector 
                  options={freightConditions} 
                  selectedIds={Array.isArray(field.value) ? field.value : []} 
                  onChange={(ids) => {
                    console.log('Condições de frete onChange:', {
                      uuids: ids,
                      nomes: ids.map(id => freightConditions.find(fc => fc.id === id)?.nome)
                    });
                    form.setValue('condicao_frete', ids, { shouldValidate: true });
                  }} 
                  loading={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Linha 7 - Materiais */}
      <div className="pt-4 border-t border-gray-200">
        <FormField
          control={form.control}
          name="materiais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materiais</FormLabel>
              <FormControl>
                <MultiBadgeSelector 
                  options={materials} 
                  selectedIds={Array.isArray(field.value) ? field.value : []} 
                  onChange={(ids) => {
                    console.log('Materiais onChange:', {
                      uuids: ids,
                      nomes: ids.map(id => materials.find(mat => mat.id === id)?.nome)
                    });
                    form.setValue('materiais', ids, { shouldValidate: true });
                  }} 
                  loading={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
