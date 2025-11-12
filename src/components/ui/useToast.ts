import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: Toast[];
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  remove: (id: number) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  success: (title, message) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'success', title, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  error: (title, message) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'error', title, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  info: (title, message) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'info', title, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));