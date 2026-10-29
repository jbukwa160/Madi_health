"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCompare } from "@/components/compare/CompareProvider";
import { IconArrowRight, IconChevronDown, IconChevronRight, IconGrid } from "@/components/Icons";
import { count } from "@/lib/format";

export type MenuCategory = {
  id: string;
  name: string;
  short: string;
  count: number;
  subs: { id: string; name: string; group: string; count: number }[];
  cover: { src: string; iw: number; ih: number; alt: string } | null;
};

const OPEN_DELAY = 90;
const CLOSE_DELAY = 170;
/** Categories with their own link in the bar, in madihealth.com's order (the rest are under "Категории"). */
const IN_BAR = ["zdrave", "kozmetika", "dobavki-i-sport", "mama-i-bebe", "higiena", "meditsinski-izdeliya"];
const ALL = "__all";

/**
 * Category bar, laid out like madihealth.com's. "Категории" opens the whole catalogue (categories on the left, the hovered one's
 * subcategories on the right); the main categories open their own menu. Menus open on hover after a short pause (so
 * crossing the bar does not flash them), on keyboard focus and on tap. Once one is open, moving to the next swaps
 * instantly, without animating again.
 */
export function MegaNav({ categories }: { categories: MenuCategory[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();
  const compare = useCompare();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu when the page changes
  useEffect(() => setOpen(null), [pathname]);
  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const show = (id: string, delay = OPEN_DELAY) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    if (open) {
      setInstant(open !== id);
      setOpen(id);
      return;
    }
    openTimer.current = setTimeout(() => {
      setInstant(false);
      setOpen(id);
    }, delay);
  };
  const hide = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => {
      setInstant(false);
      setOpen(null);
    }, CLOSE_DELAY);
  };
  const inBar = IN_BAR.map((id) => categories.find((c) => c.id === id)).filter((c): c is MenuCategory => Boolean(c));

  return (
    <nav aria-label="Категории" className="relative hidden border-t border-line bg-surface lg:block" onMouseLeave={hide}>
      <ul className="shell flex h-12 items-center gap-1">
        <li
          className="flex h-full items-center pr-3"
          onMouseEnter={() => show(ALL)}
          onFocus={(e) => {
            if (e.target.matches(":focus-visible")) show(ALL, 0);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide();
          }}
        >
          <button
            type="button"
            aria-expanded={open === ALL}
            onClick={() => (open === ALL ? setOpen(null) : show(ALL, 0))}
            className={`flex h-9 items-center gap-2 rounded-lg px-3.5 text-[0.875rem] font-semibold transition-colors duration-150 ${
              open === ALL ? "bg-brand text-white" : "bg-brand-soft text-brand hover:bg-brand hover:text-white"
            }`}
          >
            <IconGrid size={17} />
            Категории
            <IconChevronDown size={15} className={`transition-transform duration-200 ease-out ${open === ALL ? "rotate-180" : ""}`} />
          </button>
          <CatalogPanel categories={categories} open={open === ALL} instant={instant} onEnter={() => show(ALL, 0)} />
        </li>
        {inBar.map((c) => {
          const active = pathname === `/${c.id}` || pathname.startsWith(`/${c.id}/`);
          const isOpen = open === c.id;
          return (
            <li
              key={c.id}
              className="flex h-full items-center"
              onMouseEnter={() => show(c.id)}
              onFocus={(e) => {
                if (e.target.matches(":focus-visible")) show(c.id, 0);
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide();
              }}
            >
              <Link
                href={`/${c.id}`}
                aria-expanded={isOpen}
                className={`relative flex h-full items-center whitespace-nowrap px-2 text-[0.8125rem] font-medium transition-colors duration-150 after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:origin-left after:rounded-full after:bg-mint after:transition-transform after:duration-200 after:ease-out 2xl:px-2.5 2xl:text-[0.875rem] 2xl:after:inset-x-2.5 ${
                  active || isOpen ? "text-brand after:scale-x-100" : "text-ink-2 after:scale-x-0 hover:text-brand"
                }`}
              >
                {c.short}
              </Link>
              <Panel category={c} open={isOpen} instant={instant} onEnter={() => show(c.id, 0)} />
            </li>
          );
        })}
        <li className="ml-auto flex h-full items-center">
          <BarLink href="/promotsii" pathname={pathname} className="font-semibold text-danger">
            Промоции
          </BarLink>
        </li>
        <li className="hidden h-full items-center xl:flex">
          <BarLink href="/srochni-produkti" pathname={pathname}>
            Срочни продукти
          </BarLink>
        </li>
        <li className="hidden h-full items-center min-[87.5rem]:flex">
          <BarLink href="/kolektsii/novo" pathname={pathname}>
            Нови продукти
          </BarLink>
        </li>
        <li className="hidden h-full items-center xl:flex">
          <BarLink href="/marki" pathname={pathname}>
            Марки
          </BarLink>
        </li>
        <li className="flex h-full items-center">
          <BarLink href="/sravnenie" pathname={pathname}>
            Сравнение
            {compare.ready && compare.items.length ? (
              <span className="num ml-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.6875rem] font-bold text-white">
                {compare.items.length}
              </span>
            ) : null}
          </BarLink>
        </li>
      </ul>
    </nav>
  );
}

function groupsOf(c: MenuCategory) {
  const groups = new Map<string, MenuCategory["subs"]>();
  for (const s of c.subs) {
    const list = groups.get(s.group) ?? [];
    list.push(s);
    groups.set(s.group, list);
  }
  return [...groups.entries()];
}

function SubLinks({ category: c, open }: { category: MenuCategory; open: boolean }) {
  return (
    <div className="columns-2 gap-10 xl:columns-3">
      {groupsOf(c).map(([group, subs]) => (
        <div key={group || "all"} className="mb-6 break-inside-avoid">
          {group ? <p className="eyebrow mb-2.5">{group}</p> : null}
          <ul className="space-y-1.5">
            {subs.map((s) => (
              <li key={s.id}>
                <Link href={`/${c.id}/${s.id}`} tabIndex={open ? 0 : -1} className="link text-[0.9375rem] text-ink-2 hover:text-brand">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The whole catalogue: categories on the left; the one under the pointer (or focus) shows its subcategories. */
function CatalogPanel({ categories, open, instant, onEnter }: { categories: MenuCategory[]; open: boolean; instant: boolean; onEnter: () => void }) {
  const [active, setActive] = useState(categories[0]?.id);
  const current = categories.find((c) => c.id === active) ?? categories[0];
  if (!current) return null;
  return (
    <div
      className="pop absolute inset-x-0 top-full z-40 origin-top border-y border-line bg-surface shadow-[0_30px_60px_-40px_rgb(16_21_58/0.45)]"
      data-open={open}
      data-instant={instant}
      onMouseEnter={onEnter}
    >
      <div className="shell grid grid-cols-[19rem_1fr] gap-10 py-6">
        <ul className="border-r border-line pr-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/${c.id}`}
                tabIndex={open ? 0 : -1}
                onMouseEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[0.9375rem] transition-colors duration-100 ${
                  c.id === current.id ? "bg-brand-soft font-semibold text-brand" : "text-ink-2"
                }`}
              >
                {c.name}
                <IconChevronRight size={16} className={c.id === current.id ? "text-brand" : "text-ink-3/60"} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="py-2">
          <div className="mb-5 flex items-baseline justify-between gap-6">
            <p className="text-[1.25rem] font-bold tracking-[-0.02em] text-ink">{current.name}</p>
            <Link href={`/${current.id}`} tabIndex={open ? 0 : -1} className="flex items-center gap-1.5 text-[0.875rem] font-semibold text-mint-deep">
              Всички {count(current.count)} продукта <IconArrowRight size={16} />
            </Link>
          </div>
          <SubLinks category={current} open={open} />
        </div>
      </div>
    </div>
  );
}

function Panel({ category: c, open, instant, onEnter }: { category: MenuCategory; open: boolean; instant: boolean; onEnter: () => void }) {
  return (
    <div
      className="pop absolute inset-x-0 top-full z-40 origin-top border-y border-line bg-surface shadow-[0_30px_60px_-40px_rgb(16_21_58/0.45)]"
      data-open={open}
      data-instant={instant}
      onMouseEnter={onEnter}
    >
      <div className="shell grid grid-cols-[1fr_17rem] gap-12 py-8 xl:grid-cols-[1fr_19rem]">
        <SubLinks category={c} open={open} />
        <Link
          href={`/${c.id}`}
          tabIndex={open ? 0 : -1}
          className="group/cover relative flex flex-col justify-end overflow-hidden rounded-2xl border border-line bg-canvas p-5"
          style={{ minHeight: "15rem" }}
        >
          {c.cover ? (
            <Image
              src={c.cover.src}
              alt=""
              fill
              sizes="19rem"
              quality={75}
              className="object-contain p-8 pb-20 mix-blend-multiply transition-transform duration-500 ease-out group-hover/cover:scale-[1.03]"
            />
          ) : null}
          <span className="relative">
            <span className="block text-[1.25rem] font-bold leading-tight tracking-[-0.02em]">{c.name}</span>
            <span className="mt-1.5 flex items-center gap-2 text-[0.8125rem] font-medium text-mint-deep">
              Всички {count(c.count)} продукта <IconArrowRight size={16} />
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

/** A plain link on the right of the bar, underlined in mint on its own page. */
function BarLink({ href, pathname, className = "text-ink-2", children }: { href: string; pathname: string; className?: string; children: React.ReactNode }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-full items-center whitespace-nowrap px-2 text-[0.8125rem] font-medium transition-colors duration-150 after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:origin-left after:rounded-full after:bg-mint after:transition-transform after:duration-200 after:ease-out hover:text-brand 2xl:px-2.5 2xl:text-[0.875rem] ${
        active ? "text-brand after:scale-x-100" : `${className} after:scale-x-0`
      }`}
    >
      {children}
    </Link>
  );
}
