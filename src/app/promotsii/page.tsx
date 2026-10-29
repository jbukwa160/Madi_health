import type { Metadata } from "next";
import { OffersPage } from "@/components/offers/OffersPage";
import { parseFilters } from "@/lib/catalog";
import { listingMeta, type SearchParams } from "@/lib/seo";

const TITLE = "Промоции";
const INTRO = "Намалени продукти, докато са налични.";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return listingMeta("/promotsii", TITLE, INTRO, parseFilters(await searchParams));
}

export default async function PromotionsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <OffersPage
      tag="promotsii"
      path="/promotsii"
      title={TITLE}
      intro={INTRO}
      emptyText="В момента няма активни промоции. Следете страницата — новите намаления се появяват тук."
      filters={parseFilters(await searchParams)}
    />
  );
}
