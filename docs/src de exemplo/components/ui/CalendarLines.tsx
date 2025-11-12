'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CalendarLinesProps {
  className?: string;
  animated?: boolean;
  variant?: 'grid' | 'flowing' | 'minimal';
}

export const CalendarLines: React.FC<CalendarLinesProps> = ({ 
  className = '', 
  animated = true,
  variant = 'grid'
}) => {
  if (variant === 'grid') {
    return (
      <div className={`relative ${className}`}>
        <svg 
          className="w-full h-full pointer-events-none opacity-30" 
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Linhas horizontais do calendário */}
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <motion.line
              key={`h-${row}`}
              x1="50"
              y1={30 + row * 25}
              x2="350"
              y2={30 + row * 25}
              stroke="url(#calendarGradient)"
              strokeWidth="1"
              filter="url(#glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : {}}
              animate={animated ? { pathLength: 1, opacity: 0.7 } : {}}
              transition={{ duration: 1.5, delay: row * 0.2 }}
            />
          ))}
          
          {/* Linhas verticais do calendário */}
          {[0, 1, 2, 3, 4, 5, 6].map((col) => (
            <motion.line
              key={`v-${col}`}
              x1={50 + col * 50}
              y1="30"
              x2={50 + col * 50}
              y2="155"
              stroke="url(#calendarGradient)"
              strokeWidth="1"
              filter="url(#glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : {}}
              animate={animated ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 1.5, delay: 0.5 + col * 0.1 }}
            />
          ))}
          
          {/* Pontos de destaque em algumas intersecções */}
          {[
            { x: 100, y: 55 }, { x: 150, y: 80 }, { x: 200, y: 105 },
            { x: 250, y: 80 }, { x: 300, y: 130 }
          ].map((point, index) => (
            <motion.circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="hsl(var(--accent))"
              filter="url(#glow)"
              initial={animated ? { scale: 0, opacity: 0 } : {}}
              animate={animated ? { scale: 1, opacity: 0.8 } : {}}
              transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
            />
          ))}
        </svg>
      </div>
    );
  } else if (variant === 'flowing') {
    return (
      <div className={`relative ${className}`}>
        <svg 
          className="w-full h-full pointer-events-none opacity-30" 
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4"/>
            </linearGradient>
            <filter id="flowGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Flowing calendar lines */}
          <motion.path
            d="M50,50 C100,30 150,80 200,50 S300,90 350,50"
            stroke="url(#flowGradient)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#flowGlow)"
            initial={animated ? { pathLength: 0, opacity: 0 } : {}}
            animate={animated ? { pathLength: 1, opacity: 0.7 } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          <motion.path
            d="M50,80 C120,60 180,100 250,70 S320,90 350,75"
            stroke="url(#flowGradient)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#flowGlow)"
            initial={animated ? { pathLength: 0, opacity: 0 } : {}}
            animate={animated ? { pathLength: 1, opacity: 0.7 } : {}}
            transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
          />
          
          <motion.path
            d="M50,110 C90,130 140,90 200,120 S300,100 350,110"
            stroke="url(#flowGradient)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#flowGlow)"
            initial={animated ? { pathLength: 0, opacity: 0 } : {}}
            animate={animated ? { pathLength: 1, opacity: 0.7 } : {}}
            transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }}
          />
          
          {/* Flowing calendar points */}
          {[
            { x: 80, y: 50 }, { x: 150, y: 80 }, { x: 200, y: 70 },
            { x: 250, y: 120 }, { x: 320, y: 110 }
          ].map((point, index) => (
            <motion.circle
              key={`flow-point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="hsl(var(--accent))"
              filter="url(#flowGlow)"
              initial={animated ? { scale: 0, opacity: 0 } : {}}
              animate={animated ? { 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0.8]
              } : {}}
              transition={{ 
                duration: 1.2, 
                delay: 1 + index * 0.3,
                repeat: animated ? Infinity : 0,
                repeatType: "reverse",
                repeatDelay: 3
              }}
            />
          ))}
        </svg>
      </div>
    );
  } else {
    // Minimal variant
    return (
      <div className={`relative ${className}`}>
        <svg 
          className="w-full h-full pointer-events-none opacity-20" 
          viewBox="0 0 400 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="minimalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4"/>
            </linearGradient>
          </defs>
          
          {/* Simple horizontal lines */}
          {[0, 1, 2].map((row) => (
            <motion.line
              key={`min-h-${row}`}
              x1="50"
              y1={30 + row * 20}
              x2="350"
              y2={30 + row * 20}
              stroke="url(#minimalGradient)"
              strokeWidth="1"
              initial={animated ? { opacity: 0, pathLength: 0 } : {}}
              animate={animated ? { opacity: 0.5, pathLength: 1 } : {}}
              transition={{ duration: 1, delay: row * 0.2 }}
            />
          ))}
          
          {/* Simple vertical markers */}
          {[0, 1, 2, 3, 4].map((col) => (
            <motion.line
              key={`min-v-${col}`}
              x1={100 + col * 50}
              y1="20"
              x2={100 + col * 50}
              y2="80"
              stroke="url(#minimalGradient)"
              strokeWidth="1"
              initial={animated ? { opacity: 0, pathLength: 0 } : {}}
              animate={animated ? { opacity: 0.3, pathLength: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 + col * 0.1 }}
            />
          ))}
        </svg>
      </div>
    );
  }
};
