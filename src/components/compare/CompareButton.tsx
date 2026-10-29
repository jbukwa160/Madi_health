"use client";

import { useEffect, useRef, useState } from "react";
import { IconCompare } from "@/components/Icons";
import { COMPARE_MAX } from "@/lib/site";
import type { CardProduct } from "@/lib/types";
import { useCompare } from "./CompareProvider";

/** Adds a product to the comparison. `label` shows the text next to the icon (product page). */
export function CompareButton({ product, className = "", label = false }: { product: CardProduct; className?: string; label?: boolean }) {
  const { has, toggle, ready } = useCompare();
  const on = ready && has(product.sku);
  const [full, setFull] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const click = () => {
    if (toggle(product) === "full") {
      setFull(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setFull(false), 2200);
    }
  };
  const text = full ? `Най-много ${COMPARE_MAX} продукта` : on ? "В сравнението" : "Сравни";
  if (label) {
    return (
      <button type="button" aria-pressed={on} onClick={click} className={`chip h-9 ${on ? "chip-on" : ""} ${className}`}>
        <IconCompare size={16} /> {text}
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Премахни от сравнението: ${product.name}` : `Добави за сравнение: ${product.name}`}
      title={text}
      onClick={click}
      className={`icon-btn size-9 bg-surface/85 backdrop-blur-sm ${on ? "!bg-brand text-white" : full ? "text-danger" : "text-ink-3"} ${className}`}
    >
      <IconCompare size={17} />
    </button>
  );
}
