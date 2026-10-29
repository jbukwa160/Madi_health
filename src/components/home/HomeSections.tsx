import Link from "next/link";
import { IconArrowRight, IconCash, IconClock, IconPharmacist, IconPhone, IconPin, IconReturn, IconShield, IconTruck } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import { Reveal } from "@/components/Reveal";
import type { NavCategory } from "@/lib/catalog";
import { count, priceShort } from "@/lib/format";
import { SHIPPING, SITE } from "@/lib/site";
import type { Brand, Product } from "@/lib/types";

const tel = SITE.phone.replace(/\s/g, "");

// ── Hero ──

export function Hero({ products, brands, stills }: { products: number; brands: number; stills: Product[] }) {
  return (
    <section className="shell pt-4 md:pt-6">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-brand text-white">
        {/* Soft mint light from the harp colour; decoration only. */}
        <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 size-[34rem] rounded-full bg-mint/25 blur-[90px]" />
        <div aria-hidden="true" className="absolute -bottom-40 left-1/3 -z-10 size-[26rem] rounded-full bg-[#3b47d6]/30 blur-[90px]" />
        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 md:py-14 lg:grid-cols-[1.05fr_1fr] lg:px-14 lg:py-16">
          <div>
            <p className="anim-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.8125rem] font-medium text-white/90 ring-1 ring-white/15">
              <IconShield size={16} className="text-mint" /> Лицензирана аптека · {SITE.brand}
            </p>
            <h1 className="anim-rise display mt-5 text-[2.35rem] sm:text-[3rem] lg:text-[3.5rem]" style={{ animationDelay: "60ms" }}>
              Грижа за здравето, <em className="text-mint">доставена</em> до вас
            </h1>
            <p className="anim-rise mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/80" style={{ animationDelay: "120ms" }}>
              Над {count(Math.floor(products / 1000) * 1000)} продукта от {count(brands)} марки — продукти без рецепта, хранителни добавки, дермокозметика и
              всичко за мама и бебе. Доставка до цяла България за {SHIPPING.days} работни дни.
            </p>
            <div className="anim-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
              <Link href="/kategorii" className="btn bg-mint text-ink hover:bg-[#2fdcba]">
                Разгледай аптеката <IconArrowRight size={18} />
              </Link>
              <Link href="/konsultatsia" className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/16">
                <IconPharmacist size={19} /> Попитай фармацевт
              </Link>
            </div>
          </div>
          <HeroStills stills={stills} />
        </div>
      </div>
    </section>
  );
}

function HeroStills({ stills }: { stills: Product[] }) {
  const [a, b, c] = stills;
  if (!a) return null;
  return (
    <div className="relative mx-auto hidden h-[23rem] w-full max-w-[30rem] sm:block" aria-hidden="true">
      {[
        { p: a, cls: "left-[6%] top-[4%] w-[52%] rotate-[-4deg]", delay: 140 },
        { p: b, cls: "right-[2%] top-[18%] w-[44%] rotate-[5deg]", delay: 220 },
        { p: c, cls: "bottom-[2%] left-[30%] w-[40%] rotate-[-1deg]", delay: 300 },
      ]
        .filter((s) => s.p)
        .map(({ p, cls, delay }) => (
          <div key={p.sku} className={`anim-rise absolute ${cls}`} style={{ animationDelay: `${delay}ms` }}>
            <div className="tile aspect-square rounded-2xl shadow-[0_24px_50px_-20px_rgb(0_0_0/0.45)]">
              <ProductImage src={p.image} alt="" iw={p.iw} ih={p.ih} sizes="16rem" priority inset={10} />
            </div>
          </div>
        ))}
      <div className="anim-rise absolute -left-2 bottom-[16%] flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 text-ink shadow-lift" style={{ animationDelay: "360ms" }}>
        <span className="grid size-9 place-items-center rounded-full bg-mint-soft text-mint-deep">
          <IconPharmacist size={19} />
        </span>
        <span className="leading-tight">
          <span className="block text-[0.8125rem] font-semibold">Магистър-фармацевт</span>
          <span className="block text-[0.75rem] text-ink-3">отговор до 1 час</span>
        </span>
      </div>
    </div>
  );
}

// ── The shop's promises ──

export function Promises() {
  const items = [
    { icon: <IconTruck size={24} />, title: "Безплатна доставка", text: `за поръчки над ${priceShort(SHIPPING.freeFrom)}` },
    { icon: <IconReturn size={24} />, title: "Връщане до 14 дни", text: "за неразпечатани продукти" },
    { icon: <IconPharmacist size={24} />, title: "Консултация", text: "с магистър-фармацевт до 1 час" },
    { icon: <IconCash size={24} />, title: "Наложен платеж", text: "плащате при получаване" },
  ];
  return (
    <section className="shell">
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {items.map((i) => (
          <li key={i.title} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 sm:gap-4 sm:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint-soft text-mint-deep sm:size-12">{i.icon}</span>
            <span className="min-w-0">
              <span className="block text-[0.875rem] font-semibold leading-tight sm:text-[0.9375rem]">{i.title}</span>
              <span className="mt-0.5 block text-[0.75rem] leading-snug text-ink-3 sm:text-[0.8125rem]">{i.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Section heading ──

export function SectionHead({ eyebrow, title, href, linkLabel = "Виж всички", text }: { eyebrow?: string; title: React.ReactNode; href?: string; linkLabel?: string; text?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-[1.625rem] md:text-[2rem]">{title}</h2>
        {text ? <p className="mt-2 max-w-2xl text-[0.9375rem] text-ink-3">{text}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="mb-1 hidden shrink-0 items-center gap-1.5 text-[0.875rem] font-semibold text-mint-deep sm:flex">
          <span className="link">{linkLabel}</span> <IconArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}

// ── Categories ──

export type CategoryTile = { category: NavCategory; cover?: Product };

export function CategoryGrid({ items }: { items: CategoryTile[] }) {
  return (
    <section className="shell">
      <SectionHead eyebrow="Категории" title="Всичко за здравето и грижата за семейството" href="/kategorii" linkLabel="Категории" />
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {items.map(({ category: c, cover }, i) => (
          <li key={c.id} className={i === 0 ? "col-span-2 sm:col-span-1 xl:row-span-2" : ""}>
            <Link
              href={`/${c.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift active:scale-[0.985]"
            >
              <span className="text-[1rem] font-semibold leading-tight tracking-[-0.01em] text-ink">{c.name}</span>
              <span className="mt-1 text-[0.8125rem] text-ink-3">{count(c.count)} продукта</span>
              {cover ? (
                <span className={`tile relative mt-3 block flex-1 ${i === 0 ? "min-h-40 xl:min-h-0" : "min-h-28"}`}>
                  <ProductImage src={cover.image} alt="" iw={cover.iw} ih={cover.ih} sizes="(min-width: 80rem) 18vw, 45vw" inset={6} className="group-hover:scale-[1.04]" />
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Feature tiles ──

export type FeatureTile = { href: string; eyebrow: string; title: string; text: string; tone: "mint" | "brand" | "sky"; products: Product[] };

const TONES: Record<FeatureTile["tone"], string> = {
  mint: "bg-mint-soft",
  brand: "bg-brand-soft",
  sky: "bg-[#fff3e4]",
};

export function FeatureTiles({ items }: { items: FeatureTile[] }) {
  return (
    <section className="shell">
      <ul className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((f, n) => (
          <li key={f.href}>
            <Reveal delay={n * 60} className="h-full">
              <Link
                href={f.href}
                className={`group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-2xl p-6 transition-transform duration-200 ease-out active:scale-[0.99] ${TONES[f.tone]}`}
              >
                <span className="eyebrow">{f.eyebrow}</span>
                <span className="mt-2 max-w-[58%] text-[1.4rem] font-bold leading-tight tracking-[-0.02em] text-ink">{f.title}</span>
                <span className="mt-2 max-w-[56%] text-[0.875rem] leading-relaxed text-ink-2">{f.text}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.875rem] font-semibold text-brand">
                  Разгледай <IconArrowRight size={16} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </span>
                <span aria-hidden="true" className="absolute -right-3 bottom-3 flex w-[42%] items-end">
                  {f.products.slice(0, 2).map((p, i) => (
                    <span key={p.sku} className={`tile relative block aspect-square flex-1 rounded-xl shadow-card ${i === 1 ? "-ml-6 mb-6" : ""}`}>
                      <ProductImage src={p.image} alt="" iw={p.iw} ih={p.ih} sizes="10rem" inset={8} />
                    </span>
                  ))}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Pharmacist ──

export function ConsultBanner() {
  return (
    <section className="shell">
      <Reveal>
        <div className="grid items-center gap-6 rounded-[1.75rem] border border-mint/30 bg-mint-soft px-6 py-8 sm:px-10 md:grid-cols-[auto_1fr_auto] md:gap-10">
          <span className="grid size-16 place-items-center rounded-2xl bg-white text-mint-deep shadow-card">
            <IconPharmacist size={34} />
          </span>
          <div>
            <h2 className="text-[1.5rem] md:text-[1.75rem]">Консултирайте се с магистър-фармацевт в рамките на 1 час</h2>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
              Въпрос за лекарство, дозировка, съвместимост на добавки или подходящ продукт? Пишете ни или се обадете — консултацията е безплатна.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:flex-col">
            <Link href="/konsultatsia" className="btn btn-brand">
              Задай въпрос
            </Link>
            <a href={`tel:${tel}`} className="btn btn-line">
              <IconPhone size={18} /> {SITE.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Brands ──

export type BrandTile = Brand & { logo: string | null };

export function BrandWall({ brands }: { brands: BrandTile[] }) {
  return (
    <section className="shell">
      <SectionHead eyebrow="Бранд на фокус" title="Марки, на които се доверявате" href="/marki" linkLabel="Всички марки" />
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
        {brands.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/marki/${b.slug}`}
              className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-[border-color,box-shadow,transform] duration-150 ease-out hover:border-line-strong hover:shadow-card active:scale-[0.98]"
            >
              <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white">
                {b.logo ? (
                  // Small square icons served by the shop itself; no optimisation needed.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo} alt="" width={48} height={48} loading="lazy" decoding="async" className="size-full object-contain" />
                ) : (
                  <span aria-hidden="true" className="grid size-full place-items-center bg-brand-soft text-[1.125rem] font-bold text-brand">
                    {b.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink group-hover:text-brand">{b.name}</span>
                <span className="block text-[0.75rem] text-ink-3">{count(b.count)} продукта</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── The pharmacy ──

export function PharmacyBlock() {
  const P = SITE.pharmacy;
  return (
    <section className="shell">
      <Reveal>
        <div className="grid overflow-hidden rounded-[1.75rem] border border-line bg-surface lg:grid-cols-2">
          <div className="p-6 sm:p-10">
            <p className="eyebrow">Нашата аптека</p>
            <h2 className="mt-2 text-[1.625rem] md:text-[2rem]">Заповядайте и на място</h2>
            <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-ink-2">
              Онлайн аптеката работи заедно с „{P.name}“ в София. Там можете да купите и лекарства по лекарско предписание, които не продаваме
              онлайн.
            </p>
            <ul className="mt-6 space-y-3.5 text-[0.9375rem]">
              <li className="flex items-start gap-3">
                <IconPin size={20} className="mt-0.5 shrink-0 text-mint-deep" />
                <a href={P.mapUrl} target="_blank" rel="noopener" className="link">
                  {P.address}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconClock size={20} className="mt-0.5 shrink-0 text-mint-deep" />
                <span>
                  {P.hours.map((h) => (
                    <span key={h.days} className="block">
                      <span className="text-ink-3">{h.days}:</span> <span className="num font-semibold">{h.time}</span>
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <IconPhone size={20} className="mt-0.5 shrink-0 text-mint-deep" />
                <a href={`tel:${tel}`} className="link font-semibold">
                  {SITE.phone}
                </a>
              </li>
            </ul>
          </div>
          <div className="relative flex flex-col justify-end gap-3 bg-brand p-6 text-white sm:p-10">
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full bg-mint/25 blur-[70px]" />
            <IconShield size={34} className="relative text-mint" />
            <p className="relative text-[1.125rem] font-semibold leading-snug">Лицензирана аптека</p>
            <p className="relative max-w-md text-[0.875rem] leading-relaxed text-white/75">
              {P.licence}. Контрол върху дейността упражняват ИАЛ, Българският фармацевтичен съюз и БАПФ.
            </p>
            <Link href="/info/organi" className="relative mt-2 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-mint">
              <span className="link">Органи, регулиращи дейността</span> <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Welcome ──

export function Welcome({ products }: { products: number }) {
  return (
    <section className="shell">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[1.5rem] md:text-[1.75rem]">Добре дошли в {SITE.brand}</h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
          Вашата онлайн аптека за здраве, красота и комфорт — над {count(Math.floor(products / 1000) * 1000)} продукта: продукти без рецепта, хранителни
          добавки, дермокозметика, всичко за мама и бебе, медицински изделия и грижа за дома. Работим с доказани марки и надеждни доставчици, изпращаме в
          рамките на 24 часа и сме насреща, когато имате въпрос.
        </p>
      </div>
    </section>
  );
}
