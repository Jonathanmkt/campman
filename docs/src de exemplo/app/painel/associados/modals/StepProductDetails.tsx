import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { NumberFormatInput } from "@/components/ui/number-format-input";
import { ProdutoFormProps } from "./types";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";

export function StepProductDetails({ form }: ProdutoFormProps) {
  const precoCustoRef = useRef<HTMLInputElement>(null);
  const precoVendaRef = useRef<HTMLInputElement>(null);
  
  // Estado para controlar se o preu00e7o de venda foi modificado manualmente
  const [precoVendaModificadoManualmente, setPrecoVendaModificadoManualmente] = useState(false);
  
  // Observando o preço de custo para calcular automaticamente o preço de venda
  const precoCusto = useWatch({
    control: form.control,
    name: "preco_custo",
    defaultValue: 0
  });

  // Observa mudanças no preço de custo
  useEffect(() => {
    if (typeof precoCusto === 'number') {
      // Multiplica por 2.1 com precisão decimal
      const novoPrecoVenda = Number((precoCusto * 2.1).toFixed(2));
      
      // Sempre atualiza o preço de venda com base no preço de custo
      // a menos que o usuário tenha clicado no input de preço de venda
      if (!precoVendaModificadoManualmente) {
        form.setValue("preco_venda", novoPrecoVenda, { shouldValidate: true });
      }
    }
  }, [precoCusto, form, precoVendaModificadoManualmente]);
  
  return (
    <div className="space-y-4 pr-3">
      {/* Primeira linha - Código SKU e Garantia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="codigo_sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código SKU</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: PROD001" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="garantia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Garantia (meses)</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Segunda linha - Preços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="preco_custo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço de Custo (R$)*</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0,00"
                  ref={precoCustoRef}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preco_venda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço de Venda (R$)*</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0,00"
                  ref={precoVendaRef}
                  value={field.value}
                  onClick={() => setPrecoVendaModificadoManualmente(true)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Terceira linha - Peso e Dimensões */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="peso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso (kg)</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0,00"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensoes.altura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Altura (cm)</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0,00"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensoes.largura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Largura (cm)</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0,00"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensoes.profundidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profundidade (cm)</FormLabel>
              <FormControl>
                <NumberFormatInput
                  placeholder="0,00"
                  value={field.value}
                  onChange={field.onChange}
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
