'use client'

import * as React from 'react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface SelectableBadgeProps {
  id: string
  label: string
  isSelected: boolean
  onToggle: (id: string) => void
  className?: string
}

export function SelectableBadge({
  id,
  label,
  isSelected,
  onToggle,
  className,
}: SelectableBadgeProps) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.2 }}
      style={{ display: 'inline-block' }}
    >
      <Badge
        variant={isSelected ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer m-0.5 transition-colors py-1.5 select-none',
          className
        )}
        onClick={() => {
          console.log('Click badge:', { id, isSelected });
          onToggle(id);
        }}
      >
        {label}
      </Badge>
    </motion.div>
  )
}

export interface MultiBadgeSelectorProps {
  options: { id: string; nome: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  className?: string
  loading?: boolean
}

export function MultiBadgeSelector({
  options,
  selectedIds: initialSelectedIds,
  onChange,
  className,
  loading = false
}: MultiBadgeSelectorProps) {
  // Garantir que selectedIds seja sempre um array
  const selectedIds = initialSelectedIds || [];

  const handleToggle = (id: string) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    
    const option = options.find(opt => opt.id === id);
    console.log('Toggle badge:', { 
      id, 
      nome: option?.nome,
      wasSelected: selectedIds.includes(id), 
      newSelectedIds 
    });
    onChange(newSelectedIds);
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando opções...</div>
  }

  if (options.length === 0) {
    return <div className="text-sm text-gray-500">Nenhuma opção disponível</div>
  }
  
  // Reordenar as opções: selecionados primeiro, depois não selecionados
  const sortedOptions = [...options].sort((a, b) => {
    const aSelected = selectedIds.includes(a.id)
    const bSelected = selectedIds.includes(b.id)
    
    if (aSelected && !bSelected) return -1 // a vem primeiro
    if (!aSelected && bSelected) return 1  // b vem primeiro
    
    // Se ambos estão selecionados, ordenar pela ordem de seleção
    if (aSelected && bSelected) {
      const aIndex = selectedIds.indexOf(a.id)
      const bIndex = selectedIds.indexOf(b.id)
      return aIndex - bIndex
    }
    
    // Se nenhum está selecionado, manter ordem original
    return 0
  })

  return (
    <div className={cn('flex flex-wrap gap-0.5', className)}>
      <AnimatePresence>
        {sortedOptions.map(option => (
          <SelectableBadge
            key={option.id}
            id={option.id}
            label={option.nome}
            isSelected={selectedIds.includes(option.id)}
            onToggle={handleToggle}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
