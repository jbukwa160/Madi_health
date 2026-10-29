"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { COMPARE_KEY, COMPARE_MAX } from "@/lib/site";
import type { CardProduct } from "@/lib/types";

type CompareContext = {
  items: CardProduct[];
  ready: boolean;
  has: (sku: string) => boolean;
  /** Adds or removes the product. Returns "added", "removed" or "full" (already COMPARE_MAX products). */
  toggle: (product: CardProduct) => "added" | "removed" | "full";
  remove: (sku: string) => void;
  clear: () => void;
};

const Ctx = createContext<CompareContext | null>(null);

function read(): CardProduct[] {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPARE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((p) => p && typeof p.sku === "string" && typeof p.slug === "string").slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

/** The products picked for comparison, kept in this browser (like favourites). */
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CardProduct[]>([]);
  const [ready, setReady] = useState(false);
  const itemsRef = useRef<CardProduct[]>([]);
  const commit = useCallback((next: CardProduct[]) => {
    itemsRef.current = next;
    setItems(next);
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked: the comparison lasts for this visit only.
    }
  }, []);

  useEffect(() => {
    itemsRef.current = read();
    setItems(itemsRef.current);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== COMPARE_KEY) return;
      itemsRef.current = read();
      setItems(itemsRef.current);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((sku: string) => items.some((p) => p.sku === sku), [items]);
  const toggle = useCallback(
    (product: CardProduct) => {
      const current = itemsRef.current;
      if (current.some((p) => p.sku === product.sku)) {
        commit(current.filter((p) => p.sku !== product.sku));
        return "removed" as const;
      }
      if (current.length >= COMPARE_MAX) return "full" as const;
      commit([...current, product]);
      return "added" as const;
    },
    [commit],
  );
  const remove = useCallback((sku: string) => commit(itemsRef.current.filter((p) => p.sku !== sku)), [commit]);
  const clear = useCallback(() => commit([]), [commit]);

  const value = useMemo(() => ({ items, ready, has, toggle, remove, clear }), [items, ready, has, toggle, remove, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompare(): CompareContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompare must be used inside <CompareProvider>");
  return ctx;
}
