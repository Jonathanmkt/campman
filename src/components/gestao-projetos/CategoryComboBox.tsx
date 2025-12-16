'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/app/dashboard/gestao-projetos/hooks/useCategories'

interface CategoryComboBoxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

const colorOptions = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'
]

export function CategoryComboBox({ 
  value, 
  onValueChange, 
  placeholder = "Selecione uma categoria...",
  className 
}: CategoryComboBoxProps) {
  const [open, setOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCategory, setNewCategory] = useState({
    nome: '',
    descricao: '',
    cor: colorOptions[0]
  })

  const { categories, loading, createCategory, fetchCategories } = useCategories()

  useEffect(() => {
    if (open && categories.length === 0) {
      fetchCategories()
    }
  }, [open, categories.length, fetchCategories])

  const selectedCategory = categories.find(category => category.id === value)

  const handleCreateCategory = async () => {
    if (!newCategory.nome.trim()) return

    setIsCreating(true)
    try {
      const created = await createCategory(newCategory)
      if (created) {
        onValueChange(created.id)
        setCreateModalOpen(false)
        setNewCategory({ nome: '', descricao: '', cor: colorOptions[0] })
        setOpen(false)
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedCategory.cor || '#3b82f6' }}
                />
                {selectedCategory.nome}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar categoria..." />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhuma categoria encontrada
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar nova categoria
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onValueChange("none")
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "none" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Nenhuma categoria
                </CommandItem>
                {loading ? (
                  <CommandItem disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </CommandItem>
                ) : (
                  categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={(currentValue: string) => {
                        onValueChange(currentValue === value ? "none" : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.cor || '#3b82f6' }}
                        />
                        <div>
                          <div className="font-medium">{category.nome}</div>
                          {category.descricao && (
                            <div className="text-xs text-muted-foreground">
                              {category.descricao}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setCreateModalOpen(true)}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar nova categoria
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Modal para criar nova categoria */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Categoria
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria *</Label>
              <Input
                id="nome"
                value={newCategory.nome}
                onChange={(e) => setNewCategory(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Marketing, Desenvolvimento, etc."
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={newCategory.descricao}
                onChange={(e) => setNewCategory(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o propósito desta categoria..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cor da Categoria</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newCategory.cor === color 
                        ? "border-gray-900 scale-110" 
                        : "border-gray-300 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory(prev => ({ ...prev, cor: color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategory.nome.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Categoria
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
