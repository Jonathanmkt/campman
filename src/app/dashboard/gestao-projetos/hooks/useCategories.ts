'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Category {
  id: string
  nome: string
  descricao?: string
  cor?: string
  created_at: string
  updated_at: string
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  // Actions
  fetchCategories: (search?: string) => Promise<void>
  createCategory: (categoryData: Partial<Category>) => Promise<Category | null>
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
  getCategory: (id: string) => Promise<Category | null>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (search) queryParams.set('search', search)

      const response = await fetch(`/api/supabase/categorias-projeto?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar categorias: ${response.statusText}`)
      }

      const result = await response.json()
      setCategories(result.data || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (categoryData: Partial<Category>): Promise<Category | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/supabase/categorias-projeto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao criar categoria: ${response.statusText}`)
      }

      const newCategory = await response.json()
      
      // Atualizar lista local
      setCategories(prev => [newCategory, ...prev])
      
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao criar categoria:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>): Promise<Category | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/supabase/categorias-projeto/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao atualizar categoria: ${response.statusText}`)
      }

      const updatedCategory = await response.json()
      
      // Atualizar lista local
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c))
      
      return updatedCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao atualizar categoria:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/supabase/categorias-projeto/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao deletar categoria: ${response.statusText}`)
      }

      // Remover da lista local
      setCategories(prev => prev.filter(c => c.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao deletar categoria:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getCategory = useCallback(async (id: string): Promise<Category | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/supabase/categorias-projeto/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao buscar categoria: ${response.statusText}`)
      }

      const category = await response.json()
      return category
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar categoria:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar categorias na inicialização
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
  }
}
