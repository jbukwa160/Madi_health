import type { MetadataRoute } from "next";
import { INFO_SLUGS } from "@/content/pages";
import { allBrands, allProducts, countFor, navCategories } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { COLLECTIONS } from "@/lib/taxonomy";

/** Products per sitemap file (the limit is 50,000 URLs per file). */
const PER_FILE = 40_000;

/** /sitemap/0.xml lists the pages, /sitemap/1.xml and on the products. robots.txt names them all. */
export async function generateSitemaps() {
  return Array.from({ length: 1 + Math.ceil(allProducts().length / PER_FILE) }, (_, id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const u = (path: string) => `${SITE.url}${path}`;
  const now = new Date();
  if (id > 0) {
    return allProducts()
      .slice((id - 1) * PER_FILE, id * PER_FILE)
      .map((p) => ({ url: u(`/produkt/${p.slug}`), changeFrequency: "weekly" as const, priority: p.stock > 0 ? 0.6 : 0.3 }));
  }
  return [
    { url: u("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: u("/kategorii"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: u("/konsultatsia"), changeFrequency: "yearly", priority: 0.5 },
    ...navCategories().flatMap((c) => [
      { url: u(`/${c.id}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
      ...c.subs.map((s) => ({ url: u(`/${c.id}/${s.id}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ]),
    ...COLLECTIONS.filter((c) => countFor(`#${c.id}`) > 0).map((c) => ({ url: u(`/kolektsii/${c.id}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    { url: u("/marki"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...allBrands().map((b) => ({ url: u(`/marki/${b.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...INFO_SLUGS.map((s) => ({ url: u(`/info/${s}`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
