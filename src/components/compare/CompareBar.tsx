"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconCompare } from "@/components/Icons";
import { COMPARE_MAX } from "@/lib/site";
import { useCompare } from "./CompareProvider";

/** A bar at the bottom while products are picked for comparison. Slides up from below; leaves faster than it comes. */
export function CompareBar() {
  const { items, ready, remove, clear } = useCompare();
  const pathname = usePathname();
  const open = ready && items.length > 0 && pathname !== "/sravnenie";
  return (
    <div
      role="region"
      aria-label="Сравнение"
      data-open={open}
      className="fixed inset-x-0 bottom-0 z-40 translate-y-full transition-transform duration-200 ease-out data-[open=true]:translate-y-0 data-[open=true]:duration-300 data-[open=false]:invisible"
    >
      <div className="shell pb-3">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2.5 pl-4 shadow-lift backdrop-blur-md">
          <IconCompare size={20} className="hidden shrink-0 text-brand sm:block" />
          <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {items.map((p) => (
              <li key={p.sku} className="relative shrink-0">
                <span className="tile relative block size-12 rounded-lg border border-line">
                  <Image src={p.image} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                </span>
                <button
                  type="button"
                  onClick={() => remove(p.sku)}
                  aria-label={`Премахни ${p.name}`}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-white transition-transform duration-150 ease-out active:scale-90"
                >
                  <IconClose size={12} />
                </button>
              </li>
            ))}
            <li className="hidden shrink-0 text-[0.8125rem] text-ink-3 md:block">
              {items.length} от {COMPARE_MAX}
            </li>
          </ul>
          <button type="button" onClick={clear} className="hidden text-[0.8125rem] font-semibold text-ink-3 hover:text-ink sm:block">
            Изчисти
          </button>
          <Link href="/sravnenie" className={`btn btn-ink btn-sm ${items.length < 2 ? "opacity-60" : ""}`}>
            Сравни{items.length > 1 ? ` (${items.length})` : ""}
          </Link>
        </div>
      </div>
    </div>
  );
}
