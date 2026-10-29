import type { MetadataRoute } from "next";
import { allProducts } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Same split as app/sitemap.ts: file 0 has the pages, the rest the products (40,000 each).
  const files = 1 + Math.ceil(allProducts().length / 40_000);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/poruchka", "/lyubimi", "/tarsene", "/tovaritelnitsa"] },
    sitemap: Array.from({ length: files }, (_, id) => `${SITE.url}/sitemap/${id}.xml`),
  };
}
