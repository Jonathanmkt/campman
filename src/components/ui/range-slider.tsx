'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPosition = React.useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const rawValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  const handleTouchStart = (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  React.useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(clientX);
      const [minVal, maxVal] = value;

      if (isDragging === 'min') {
        onChange([Math.min(newValue, maxVal - step), maxVal]);
      } else {
        onChange([minVal, Math.max(newValue, minVal + step)]);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, value, step, onChange, getValueFromPosition]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-2 w-full rounded-full bg-gray-200 cursor-pointer"
        onClick={(e) => {
          const newValue = getValueFromPosition(e.clientX);
          const [minVal, maxVal] = value;
          const distToMin = Math.abs(newValue - minVal);
          const distToMax = Math.abs(newValue - maxVal);

          if (distToMin < distToMax) {
            onChange([Math.min(newValue, maxVal - step), maxVal]);
          } else {
            onChange([minVal, Math.max(newValue, minVal + step)]);
          }
        }}
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-blue-600 rounded-full"
          style={{
            left: `${minPercentage}%`,
            right: `${100 - maxPercentage}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow-md cursor-grab transition-transform',
            isDragging === 'min' && 'scale-110 cursor-grabbing'
          )}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
          tabIndex={0}
        />

        {/* Max thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow-md cursor-grab transition-transform',
            isDragging === 'max' && 'scale-110 cursor-grabbing'
          )}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[1]}
          tabIndex={0}
        />
      </div>
    </div>
  );
}
