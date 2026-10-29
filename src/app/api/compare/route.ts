import { NextResponse, type NextRequest } from "next/server";
import { getBySku, toCard } from "@/lib/catalog";
import { detailsFor } from "@/lib/details";
import { amount } from "@/lib/format";
import { COMPARE_MAX } from "@/lib/site";
import { CATEGORY_BY_ID, findSub } from "@/lib/taxonomy";

/** What /sravnenie shows for each product, from the catalog (never from the browser). */
export function GET(req: NextRequest) {
  const skus = (req.nextUrl.searchParams.get("skus") ?? "").split(",").slice(0, COMPARE_MAX);
  const products = skus
    .map((s) => getBySku(s.trim()))
    .filter((p) => p !== undefined)
    .map((p) => ({
      ...toCard(p),
      iw: p.iw,
      ih: p.ih,
      brandSlug: p.brandSlug,
      category: CATEGORY_BY_ID.get(p.category)?.name ?? "",
      sub: findSub(p.category, p.sub)?.name ?? "",
      amount: amount(p.facts) ?? "",
      ean: p.ean,
      expiry: p.expiry ?? "",
      lead: detailsFor(p.sku)?.copy?.lead ?? "",
    }));
  return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
}
