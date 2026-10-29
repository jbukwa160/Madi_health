import { BrandWall, type BrandTile, CategoryGrid, ConsultBanner, FeatureTiles, type FeatureTile, Hero, PharmacyBlock, Promises, Welcome } from "@/components/home/HomeSections";
import { ProductRail } from "@/components/ProductRail";
import { Reveal } from "@/components/Reveal";
import { brandLogo } from "@/lib/brand-logos";
import { allBrands, allProducts, cardKey, coverFor, featured, navCategories, newest, productCount } from "@/lib/catalog";
import type { Brand, Product } from "@/lib/types";

/** Categories of the new-products rail (not stationery or household). */
const PHARMACY = new Set(["zdrave", "kozmetika", "dobavki-i-sport", "mama-i-bebe", "meditsinski-izdeliya"]);
/** Categories whose brands lead the brand wall, with the dermocosmetics brands: what a pharmacy is known for. */
const PHARMACY_BRANDS = new Set(["zdrave", "dobavki-i-sport", "mama-i-bebe", "meditsinski-izdeliya"]);

export default function Home() {
  const used = new Set<string>();
  const take = (cards: ReturnType<typeof featured>, n: number) => {
    const out = cards.filter((c) => !used.has(cardKey(c.product))).slice(0, n);
    for (const c of out) used.add(cardKey(c.product));
    return out;
  };
  const one = (opts: Parameters<typeof featured>[1]): Product | undefined => take(featured(12, { minSide: 600, perBrand: 1, ...opts }), 1)[0]?.product;

  const stills = [
    one({ tags: ["dermokozmetika"], categories: ["kozmetika"] }),
    one({ subs: ["vitamini", "multivitamini", "omega", "minerali"] }),
    one({ categories: ["mama-i-bebe"], subs: ["bebeshka-kozmetika", "hranene"] }),
  ].filter((p): p is Product => Boolean(p));

  const categories = navCategories().map((category) => ({ category, cover: coverFor(category.id) }));

  const features: FeatureTile[] = [
    {
      href: "/kolektsii/dermokozmetika",
      eyebrow: "Дермокозметика",
      title: "Аптечна грижа за кожата",
      text: "Bioderma, Eucerin, La Roche-Posay и още марки, създадени с дерматолози.",
      tone: "mint" as const,
      products: take(featured(8, { tags: ["dermokozmetika"], minSide: 500, perBrand: 1 }), 2).map((c) => c.product),
    },
    {
      href: "/dobavki-i-sport",
      eyebrow: "Витамини и минерали",
      title: "Ежедневна подкрепа",
      text: "Витамини, минерали и омега — за имунитета, енергията и тонуса.",
      tone: "brand" as const,
      products: take(featured(8, { subs: ["vitamini", "minerali", "multivitamini", "omega"], minSide: 500, perBrand: 1 }), 2).map((c) => c.product),
    },
    {
      href: "/mama-i-bebe",
      eyebrow: "Мама и бебе",
      title: "От първия ден",
      text: "Бебешка козметика, храни, пелени и всичко за хранене.",
      tone: "sky" as const,
      products: take(featured(8, { categories: ["mama-i-bebe"], minSide: 500, perBrand: 1 }), 2).map((c) => c.product),
    },
  ].filter((f) => f.products.length > 0);

  const fresh = take(newest(40).filter((c) => PHARMACY.has(c.product.category)), 12);
  const season = take(featured(30, { subs: ["nastinka-i-grip", "imunitet"], perBrand: 2 }), 12);
  const derma = take(featured(30, { tags: ["dermokozmetika"], perBrand: 2 }), 12);
  const supplements = take(featured(30, { categories: ["dobavki-i-sport"], perBrand: 1 }), 12);

  return (
    <div className="space-y-14 md:space-y-20">
      <div className="space-y-4 md:space-y-5">
        <Hero products={productCount()} brands={allBrands().length} stills={stills} />
        <Promises />
      </div>
      <CategoryGrid items={categories} />
      <FeatureTiles items={features} />
      <Reveal>
        <ProductRail eyebrow="Току-що добавени" title="Нови продукти" href="/kolektsii/novo" cards={fresh} />
      </Reveal>
      <Reveal>
        <ProductRail eyebrow="Есен и зима" title="Настинка, грип и имунитет" href="/zdrave/nastinka-i-grip" linkLabel="Към настинка и грип" cards={season} />
      </Reveal>
      <ConsultBanner />
      <Reveal>
        <ProductRail eyebrow="Препоръчано от дерматолози" title="Дермокозметика" href="/kolektsii/dermokozmetika" cards={derma} />
      </Reveal>
      <Reveal>
        <ProductRail eyebrow="Хранителни добавки" title="Витамини и добавки" href="/dobavki-i-sport" cards={supplements} />
      </Reveal>
      <BrandWall brands={pharmacyBrands(24)} />
      <PharmacyBlock />
      <Welcome products={productCount()} />
    </div>
  );
}

/** The brands with the most products in the pharmacy's own categories and in dermocosmetics, with their icons. */
function pharmacyBrands(limit: number): BrandTile[] {
  const counts = new Map<string, number>();
  for (const p of allProducts()) {
    if (p.brandSlug && (PHARMACY_BRANDS.has(p.category) || p.tags.includes("dermokozmetika"))) counts.set(p.brandSlug, (counts.get(p.brandSlug) ?? 0) + 1);
  }
  const bySlug = new Map(allBrands().map((b) => [b.slug, b]));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => bySlug.get(slug))
    .filter((b): b is Brand => Boolean(b))
    .slice(0, limit)
    .map((b) => ({ ...b, logo: brandLogo(b.slug) }));
}
