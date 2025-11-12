'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Tipo para opções de seleção
type SelectOption = {
  id: string | number;
  nome: string;
  codigo?: string;
}

export function useFetchAssociadosOptions() {
  const [tiposDocumento, setTiposDocumento] = useState<SelectOption[]>([])
  const [orgaosEmissores, setOrgaosEmissores] = useState<SelectOption[]>([])
  const [categorias, setCategorias] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllOptions = async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        // Buscar tipos de documento
        const { data: tiposDocumentoData, error: tiposDocumentoError } = await supabase
          .from('tipo_documento')
          .select('id, nome')
          .eq('ativo', true)

        if (tiposDocumentoError) throw new Error(`Erro ao buscar tipos de documento: ${tiposDocumentoError.message}`)
        setTiposDocumento(tiposDocumentoData || [])

        // Buscar órgãos emissores
        const { data: orgaosEmissoresData, error: orgaosEmissoresError } = await supabase
          .from('orgaos_emissores')
          .select('id, nome, codigo')
          .eq('ativo', true)

        if (orgaosEmissoresError) throw new Error(`Erro ao buscar órgãos emissores: ${orgaosEmissoresError.message}`)
        setOrgaosEmissores(orgaosEmissoresData || [])

        // Buscar categorias de associados
        const { data: categoriasData, error: categoriasError } = await supabase
          .from('associado_categorias')
          .select('id, nome')
          .eq('ativo', true)

        if (categoriasError) throw new Error(`Erro ao buscar categorias: ${categoriasError.message}`)
        setCategorias(categoriasData || [])

      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido ao buscar opções')
      } finally {
        setLoading(false)
      }
    }

    fetchAllOptions()
  }, [])

  // Opções estáticas 
  const estadoCivil = [
    { id: 'solteiro', nome: 'Solteiro(a)' },
    { id: 'casado', nome: 'Casado(a)' },
    { id: 'divorciado', nome: 'Divorciado(a)' },
    { id: 'viuvo', nome: 'Viúvo(a)' },
    { id: 'uniao_estavel', nome: 'União Estável' },
    { id: 'separado', nome: 'Separado(a)' }
  ]

  const sexo = [
    { id: 'masculino', nome: 'Masculino' },
    { id: 'feminino', nome: 'Feminino' },
    { id: 'nao_informado', nome: 'Não informado' }
  ]

  // Situações de associados
  const situacoes = [
    { id: 'ativo', nome: 'Ativo', codigo: 'ativo' },
    { id: 'inativo', nome: 'Inativo', codigo: 'inativo' },
    { id: 'suspenso', nome: 'Suspenso', codigo: 'suspenso' }
  ]

  // Estados brasileiros (27 UFs)
  const estados = [
    { id: 'AC', nome: 'Acre', codigo: 'AC' },
    { id: 'AL', nome: 'Alagoas', codigo: 'AL' },
    { id: 'AP', nome: 'Amapá', codigo: 'AP' },
    { id: 'AM', nome: 'Amazonas', codigo: 'AM' },
    { id: 'BA', nome: 'Bahia', codigo: 'BA' },
    { id: 'CE', nome: 'Ceará', codigo: 'CE' },
    { id: 'DF', nome: 'Distrito Federal', codigo: 'DF' },
    { id: 'ES', nome: 'Espírito Santo', codigo: 'ES' },
    { id: 'GO', nome: 'Goiás', codigo: 'GO' },
    { id: 'MA', nome: 'Maranhão', codigo: 'MA' },
    { id: 'MT', nome: 'Mato Grosso', codigo: 'MT' },
    { id: 'MS', nome: 'Mato Grosso do Sul', codigo: 'MS' },
    { id: 'MG', nome: 'Minas Gerais', codigo: 'MG' },
    { id: 'PA', nome: 'Pará', codigo: 'PA' },
    { id: 'PB', nome: 'Paraíba', codigo: 'PB' },
    { id: 'PR', nome: 'Paraná', codigo: 'PR' },
    { id: 'PE', nome: 'Pernambuco', codigo: 'PE' },
    { id: 'PI', nome: 'Piauí', codigo: 'PI' },
    { id: 'RJ', nome: 'Rio de Janeiro', codigo: 'RJ' },
    { id: 'RN', nome: 'Rio Grande do Norte', codigo: 'RN' },
    { id: 'RS', nome: 'Rio Grande do Sul', codigo: 'RS' },
    { id: 'RO', nome: 'Rondônia', codigo: 'RO' },
    { id: 'RR', nome: 'Roraima', codigo: 'RR' },
    { id: 'SC', nome: 'Santa Catarina', codigo: 'SC' },
    { id: 'SP', nome: 'São Paulo', codigo: 'SP' },
    { id: 'SE', nome: 'Sergipe', codigo: 'SE' },
    { id: 'TO', nome: 'Tocantins', codigo: 'TO' }
  ]

  return {
    situacoes,
    tiposDocumento,
    orgaosEmissores,
    estados,
    categorias,
    estadoCivil,
    sexo,
    loading,
    error
  }
}
