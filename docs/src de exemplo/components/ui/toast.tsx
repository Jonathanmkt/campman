'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './useToast';

export function Toast() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative flex w-[356px] items-center gap-3 p-4 rounded-lg shadow-sm border-l-4",
              toast.type === 'success' && "bg-green-50 text-green-800 border-l-green-500",
              toast.type === 'error' && "bg-red-50 text-red-800 border-l-red-500",
              toast.type === 'info' && "bg-blue-50 text-blue-800 border-l-blue-500"
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium">{toast.title}</h4>
              {toast.message && <p className="text-sm opacity-90">{toast.message}</p>}
            </div>

            <button 
              onClick={() => remove(toast.id)}
              className={cn(
                "shrink-0 rounded-lg p-1 transition-colors",
                toast.type === 'success' && "hover:bg-green-100 text-green-600",
                toast.type === 'error' && "hover:bg-red-100 text-red-600",
                toast.type === 'info' && "hover:bg-blue-100 text-blue-600"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}