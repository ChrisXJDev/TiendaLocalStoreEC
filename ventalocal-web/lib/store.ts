'use client';
import { create } from 'zustand';
import { CartItem, Producto } from './types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (producto: Producto) => void;
  removeItem: (productoId: string) => void;
  updateQty: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (producto) => {
    set((state) => {
      const existing = state.items.find((i) => i.producto.id === producto.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stock) }
              : i
          ),
        };
      }
      return { items: [...state.items, { producto, cantidad: 1 }] };
    });
  },

  removeItem: (productoId) => {
    set((state) => ({
      items: state.items.filter((i) => i.producto.id !== productoId),
    }));
  },

  updateQty: (productoId, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(productoId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.producto.id === productoId ? { ...i, cantidad } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  total: () =>
    get().items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}));
