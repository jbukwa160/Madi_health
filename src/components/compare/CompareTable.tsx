"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { IconBag, IconClose, IconCompare } from "@/components/Icons";
import { discountPercent, expiryLabel, price } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import { useCompare } from "./CompareProvider";

type Row = CardProduct & { iw: number; ih: number; brandSlug: string; category: string; sub: string; amount: string; ean: string; expiry: string; lead: string };

/** Side-by-side table of the products picked for comparison (fresh prices and stock from /api/compare). */
export function CompareTable() {
  const { items, ready, remove, clear } = useCompare();
  const { add } = useCart();
  const [loaded, setLoaded] = useState<{ key: string; rows: Row[] } | null>(null);
  const key = items.map((p) => p.sku).join(",");

  useEffect(() => {
    if (!ready || !key) return;
    let live = true;
    fetch(`/api/compare?skus=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d: { products: Row[] }) => live && setLoaded({ key, rows: d.products }))
      .catch(() => live && setLoaded({ key, rows: [] }));
    return () => {
      live = false;
    };
  }, [key, ready]);
  // Nothing picked: nothing to load. Otherwise the rows for the current pick (null while they load).
  const rows = !key ? [] : loaded?.key === key ? loaded.rows : null;

  if (!ready || rows === null) return <p className="mt-10 text-[0.9375rem] text-ink-3">Зареждане…</p>;

  if (!rows.length) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-line bg-surface px-6 py-12 text-center">
        <IconCompare size={34} className="mx-auto text-mint-deep" />
        <p className="mt-4 text-[1.25rem] font-bold">Няма избрани продукти</p>
        <p className="mt-2 text-[0.9375rem] text-ink-2">
          Натиснете иконата за сравнение върху продукт — до 4 продукта един до друг, с цена, наличност, количество и описание.
        </p>
        <Link href="/kategorii" className="btn btn-ink mt-6">
          Към категориите
        </Link>
      </div>
    );
  }

  const lines: { label: string; value: (r: Row) => React.ReactNode }[] = [
    {
      label: "Цена",
      value: (r) => (
        <span className={`num text-[1.125rem] font-bold ${r.oldPrice ? "text-danger" : ""}`}>
          {price(r.price)}
          {r.oldPrice ? (
            <span className="ml-2 text-[0.8125rem] font-normal text-ink-3 line-through">{price(r.oldPrice)}</span>
          ) : null}
          {r.oldPrice ? <span className="badge badge-sale ml-2">−{discountPercent(r.oldPrice, r.price)}%</span> : null}
        </span>
      ),
    },
    { label: "Наличност", value: (r) => (r.stock > 0 ? <span className="font-medium text-mint-deep">В наличност</span> : <span className="text-ink-3">Няма наличност</span>) },
    { label: "Марка", value: (r) => (r.brand ? <Link href={`/marki/${r.brandSlug}`} className="link">{r.brand}</Link> : "—") },
    { label: "Категория", value: (r) => r.category || "—" },
    { label: "Вид", value: (r) => r.sub || "—" },
    { label: "Количество", value: (r) => r.amount || "—" },
    { label: "Срок на годност", value: (r) => (r.expiry ? `до ${expiryLabel(r.expiry)}` : "—") },
    { label: "Баркод", value: (r) => (r.ean ? <span className="num">{r.ean}</span> : "—") },
    { label: "Описание", value: (r) => (r.lead ? <span className="text-ink-2">{r.lead}</span> : "—") },
  ];
  const cols = { gridTemplateColumns: `9rem repeat(${rows.length}, minmax(13rem, 1fr))` };

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={clear} className="link text-[0.875rem] font-semibold text-ink-3 hover:text-ink">
          Изчисти сравнението
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <div className="min-w-max">
          <div className="grid border-b border-line" style={cols}>
            <div />
            {rows.map((r) => (
              <div key={r.sku} className="relative border-l border-line p-4">
                <button
                  type="button"
                  onClick={() => remove(r.sku)}
                  aria-label={`Премахни ${r.name} от сравнението`}
                  className="icon-btn absolute right-2 top-2 size-8 text-ink-3"
                >
                  <IconClose size={16} />
                </button>
                <Link href={`/produkt/${r.slug}`} className="block">
                  <span className="tile relative mx-auto block aspect-square w-32 rounded-xl">
                    <Image src={r.image} alt="" fill sizes="128px" className="object-contain p-2" />
                  </span>
                  <span className="clamp-2 mt-3 block text-[0.9375rem] font-semibold leading-snug">{r.name}</span>
                </Link>
                {r.stock > 0 ? (
                  <button type="button" onClick={() => add({ sku: r.sku, slug: r.slug, name: r.name, brand: r.brand, price: r.price, image: r.image, stock: r.stock, variant: r.variant, oldPrice: r.oldPrice }, 1)} className="btn btn-brand btn-sm mt-3 w-full">
                    <IconBag size={16} /> Добави
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {lines.map((line, i) => (
            <div key={line.label} className={`grid text-[0.875rem] ${i % 2 ? "bg-canvas/60" : ""}`} style={cols}>
              <div className="p-4 font-semibold text-ink-3">{line.label}</div>
              {rows.map((r) => (
                <div key={r.sku} className="border-l border-line p-4 leading-relaxed">
                  {line.value(r)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
