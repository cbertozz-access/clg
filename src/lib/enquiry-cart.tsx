"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface EnquiryCartItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  specifications?: Record<string, string>;
}

interface EnquiryCartContextType {
  items: EnquiryCartItem[];
  addItem: (item: EnquiryCartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  itemCount: number;
}

const EnquiryCartContext = createContext<EnquiryCartContextType | undefined>(undefined);

export function EnquiryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EnquiryCartItem[]>([]);

  const addItem = useCallback((item: EnquiryCartItem) => {
    setItems((prev) => {
      // Don't add duplicates
      if (prev.some((i) => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((id: string) => {
    return items.some((item) => item.id === id);
  }, [items]);

  return (
    <EnquiryCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount: items.length,
      }}
    >
      {children}
    </EnquiryCartContext.Provider>
  );
}

export function useEnquiryCart() {
  const context = useContext(EnquiryCartContext);
  if (!context) {
    throw new Error("useEnquiryCart must be used within an EnquiryCartProvider");
  }
  return context;
}
