"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

// Tipos de propriedades
export interface CalendarProps {
  mode?: 'single' | 'range' | 'multiple';
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  initialFocus?: boolean;
}

// Nomes dos meses
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Nomes dos dias da semana
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CustomCalendar({
  mode = 'single',
  selected,
  onSelect,
  className,
  disabled = false,
}: CalendarProps) {
  // Estado para controlar o mês e ano exibidos
  const [currentDate, setCurrentDate] = useState(
    selected instanceof Date ? selected : new Date()
  );
  
  // Obter o mês e ano atuais
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Manipuladores para mudar o mês
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Obter dias do mês atual
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Obter o dia da semana do primeiro dia do mês (0 = domingo, 1 = segunda, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Obter dias do mês anterior
  const getDaysFromPreviousMonth = (year: number, month: number) => {
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1
    );
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(daysInPrevMonth - firstDay + i + 1);
    }
    return days;
  };
  
  // Verificar se uma data está selecionada
  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    
    if (selected instanceof Date) {
      return date.toDateString() === selected.toDateString();
    }
    
    if (Array.isArray(selected)) {
      return selected.some(
        (selectedDate) => date.toDateString() === selectedDate.toDateString()
      );
    }
    
    if (selected.from && selected.to) {
      return (
        date >= selected.from &&
        date <= selected.to
      );
    }
    
    return false;
  };
  
  // Verificar se a data é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Manipulador para selecionar uma data
  const handleDateSelect = (date: Date) => {
    if (disabled) return;
    if (onSelect) {
      onSelect(date);
    }
  };
  
  // Renderizar os dias do calendário
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const daysFromPrevMonth = getDaysFromPreviousMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < daysFromPrevMonth.length; i++) {
      const day = daysFromPrevMonth[i];
      const date = new Date(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1,
        day
      );
      
      days.push(
        <button
          key={`prev-${day}`}
          type="button"
          onClick={() => handleDateSelect(date)}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal text-muted-foreground opacity-50',
            className
          )}
          disabled={disabled}
        >
          {day}
        </button>
      );
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelectedDate = isDateSelected(date);
      const isTodayDate = isToday(date);
      
      days.push(
        <button
          key={`current-${day}`}
          type="button"
          onClick={() => handleDateSelect(date)}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal',
            isSelectedDate && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            isTodayDate && !isSelectedDate && 'bg-accent text-accent-foreground',
            !isSelectedDate && !isTodayDate && 'text-foreground',
            className
          )}
          disabled={disabled}
        >
          {day}
        </button>
      );
    }
    
    // Dias do próximo mês
    const totalCells = 42; // 6 semanas x 7 dias
    const remainingCells = totalCells - days.length;
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(
        currentMonth === 11 ? currentYear + 1 : currentYear,
        currentMonth === 11 ? 0 : currentMonth + 1,
        day
      );
      
      days.push(
        <button
          key={`next-${day}`}
          type="button"
          onClick={() => handleDateSelect(date)}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal text-muted-foreground opacity-50',
            className
          )}
          disabled={disabled}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className={cn('p-3', className)}>
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between pt-1 px-1">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-accent'
          )}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="text-sm font-medium flex-1 text-center">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
            new Date(currentYear, currentMonth)
          )}
        </div>
        
        <button
          type="button"
          onClick={goToNextMonth}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-accent'
          )}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Dias da semana */}
      <div className="grid grid-cols-7 mt-4">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-muted-foreground text-center text-xs h-9 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Grid de dias */}
      <div className="grid grid-cols-7 mt-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
}

CustomCalendar.displayName = 'CustomCalendar';
