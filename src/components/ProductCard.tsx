import Link from "next/link";
import { FavoriteButton, QuickAdd } from "@/components/CardActions";
import { ProductImage } from "@/components/ProductImage";
import { type Card, toCard } from "@/lib/catalog";
import { plural, price } from "@/lib/format";

const SIZES = "(min-width: 90rem) 15vw, (min-width: 64rem) 20vw, (min-width: 48rem) 28vw, 44vw";

export function ProductCard({ card, priority = false }: { card: Card; priority?: boolean }) {
  const p = card.product;
  const soldOut = p.stock <= 0;
  const isNew = p.tags.includes("novo");
  const range = card.minPrice !== card.maxPrice;
  const many = card.variants > 1;
  const cardProduct = toCard(p);
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-2.5 outline-offset-2 outline-brand transition-[border-color,box-shadow] duration-200 has-[a:focus-visible]:outline-2 hover:border-line-strong hover:shadow-lift sm:p-3">
      {/* The tile sits above the card link (so its buttons work) but lets clicks on the picture through to it. */}
      <div className={`tile pointer-events-none relative z-[1] aspect-square ${soldOut ? "opacity-60" : ""}`}>
        <ProductImage src={p.image} alt="" iw={p.iw} ih={p.ih} sizes={SIZES} priority={priority} className="p-2 group-hover:scale-[1.035]" />
        <div className="absolute left-1 top-1 flex flex-col items-start gap-1.5">
          {soldOut ? <span className="badge">Изчерпан</span> : isNew ? <span className="badge badge-brand">Ново</span> : null}
        </div>
        <FavoriteButton product={cardProduct} className="pointer-events-auto absolute right-0 top-0" />
      </div>
      <div className="mt-2.5 flex flex-1 flex-col px-0.5">
        {p.brand ? <p className="eyebrow mb-1 truncate">{p.brand}</p> : null}
        <h3 className="font-sans text-[0.875rem] font-normal leading-snug tracking-normal text-ink sm:text-[0.9375rem]">
          <Link href={`/produkt/${p.slug}`} className="clamp-2 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {card.title}
          </Link>
        </h3>
        {many ? (
          <p className="mt-1 text-[0.8125rem] text-ink-3">
            {plural(card.variants, card.kind === "size" ? "размер" : "нюанс", card.kind === "size" ? "размера" : "нюанса")}
          </p>
        ) : null}
        <p className={`mt-1.5 flex items-center gap-1.5 text-[0.75rem] font-medium ${soldOut ? "text-ink-3" : "text-mint-deep"}`}>
          <span aria-hidden="true" className={`size-1.5 rounded-full ${soldOut ? "bg-ink-3/50" : "bg-mint"}`} />
          {soldOut ? "Няма наличност" : "В наличност"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <p className="num text-[1rem] font-bold tracking-[-0.01em] text-ink sm:text-[1.0625rem]">
            {range ? <span className="mr-1 text-[0.8125rem] font-normal text-ink-3">от</span> : null}
            {price(card.minPrice)}
          </p>
          {!soldOut && !many ? <QuickAdd product={cardProduct} className="relative z-[1]" /> : null}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ cards, eager = 0 }: { cards: Card[]; eager?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {cards.map((c, i) => (
        <li key={c.product.sku}>
          <ProductCard card={c} priority={i < eager} />
        </li>
      ))}
    </ul>
  );
}
