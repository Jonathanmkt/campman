'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, User, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Colaborador {
  id: string
  funcao: string
  status_colaborador: string
  ativo: boolean
  profiles: {
    id: string
    nome_completo: string
    telefone?: string
    foto_url?: string
    status: string
  }
}

interface CollaboratorSearchBoxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CollaboratorSearchBox({ 
  value, 
  onValueChange, 
  placeholder = "Buscar colaborador...",
  className 
}: CollaboratorSearchBoxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null)

  // Debounced search
  const searchColaboradores = useCallback(async (query: string) => {
    if (!query.trim()) {
      setColaboradores([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/supabase/colaboradores/search?q=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const result = await response.json()
        setColaboradores(result.data || [])
      } else {
        console.error('Erro ao buscar colaboradores:', response.statusText)
        setColaboradores([])
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error)
      setColaboradores([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchColaboradores(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchColaboradores])

  // Load selected colaborador details
  useEffect(() => {
    if (value && value !== 'none') {
      const colaborador = colaboradores.find(c => c.id === value)
      if (colaborador) {
        setSelectedColaborador(colaborador)
      } else if (!selectedColaborador || selectedColaborador.id !== value) {
        // Load colaborador details if not in current list
        loadColaboradorDetails(value)
      }
    } else {
      setSelectedColaborador(null)
    }
  }, [value, colaboradores, selectedColaborador])

  const loadColaboradorDetails = async (colaboradorId: string) => {
    try {
      const response = await fetch(`/api/supabase/colaboradores/search?q=${colaboradorId}&limit=1`)
      if (response.ok) {
        const result = await response.json()
        if (result.data && result.data.length > 0) {
          setSelectedColaborador(result.data[0])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do colaborador:', error)
    }
  }

  const handleSelect = (colaborador: Colaborador | null) => {
    if (colaborador) {
      onValueChange(colaborador.id)
      setSelectedColaborador(colaborador)
    } else {
      onValueChange('none')
      setSelectedColaborador(null)
    }
    setOpen(false)
    setSearchQuery('')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = (colaborador: Colaborador) => colaborador.profiles.nome_completo
  const getDisplayFunction = (colaborador: Colaborador) => colaborador.funcao
  const getDisplayPhoto = (colaborador: Colaborador) => colaborador.profiles.foto_url

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedColaborador ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-6 w-6">
                <AvatarImage src={getDisplayPhoto(selectedColaborador)} />
                <AvatarFallback className="text-xs">
                  {getInitials(getDisplayName(selectedColaborador))}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0">
                <span className="font-medium truncate">
                  {getDisplayName(selectedColaborador)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {getDisplayFunction(selectedColaborador)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(null)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {placeholder}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Digite o nome do colaborador..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Buscando colaboradores...
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Nenhum colaborador encontrado para &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Digite para buscar colaboradores
                  </p>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => handleSelect(null)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "none" || !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Nenhum responsável
              </CommandItem>
              {colaboradores.map((colaborador) => (
                <CommandItem
                  key={colaborador.id}
                  value={colaborador.id}
                  onSelect={() => handleSelect(colaborador)}
                  className="flex items-center gap-3 py-3"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === colaborador.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getDisplayPhoto(colaborador)} />
                    <AvatarFallback className="text-xs">
                      {getInitials(getDisplayName(colaborador))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {getDisplayName(colaborador)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {getDisplayFunction(colaborador)}
                      </Badge>
                      {colaborador.profiles.telefone && (
                        <span className="truncate">{colaborador.profiles.telefone}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
