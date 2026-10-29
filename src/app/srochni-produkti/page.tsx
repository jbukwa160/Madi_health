import type { Metadata } from "next";
import { OffersPage } from "@/components/offers/OffersPage";
import { parseFilters } from "@/lib/catalog";
import { listingMeta, type SearchParams } from "@/lib/seo";

const TITLE = "Срочни продукти";
const INTRO = "Продукти с наближаващ срок на годност на по-ниска цена. Срокът е отбелязан на всеки продукт.";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return listingMeta("/srochni-produkti", TITLE, INTRO, parseFilters(await searchParams));
}

export default async function ShortDatedPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <OffersPage
      tag="srochni"
      path="/srochni-produkti"
      title={TITLE}
      intro={INTRO}
      emptyText="В момента няма срочни продукти. Когато има продукти с наближаващ срок на годност на намалена цена, ще ги намерите тук."
      filters={parseFilters(await searchParams)}
    />
  );
}
