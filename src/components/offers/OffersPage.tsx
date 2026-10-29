import Link from "next/link";
import { IconArrowRight } from "@/components/Icons";
import { Breadcrumbs, Listing } from "@/components/listing/Listing";
import { countFor, list, type ListResult } from "@/lib/catalog";
import type { Filters } from "@/lib/filters";
import type { CollectionId } from "@/lib/taxonomy";

type Props = { tag: Extract<CollectionId, "promotsii" | "srochni">; path: string; title: string; intro: string; emptyText: string; filters: Filters };

/** /promotsii and /srochni-produkti: the business's own offers (data/promotions.csv, data/short-dated.csv). */
export function OffersPage({ tag, path, title, intro, emptyText, filters }: Props) {
  const crumbs = [{ href: "/", label: "Начало" }, { label: title }];
  if (countFor(`#${tag}`) === 0) {
    return (
      <div className="shell pt-6 md:pt-8">
        <Breadcrumbs items={crumbs} />
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-line bg-surface px-6 py-12 text-center">
          <h1 className="text-[1.75rem]">{title}</h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{emptyText}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/kolektsii/novo" className="btn btn-ink">
              Нови продукти <IconArrowRight size={18} />
            </Link>
            <Link href="/kategorii" className="btn btn-line">
              Категории
            </Link>
          </div>
        </div>
      </div>
    );
  }
  const result: ListResult = list({ tag }, filters);
  return <Listing crumbs={crumbs} title={title} intro={intro} result={result} filters={filters} basePath={path} showCategories />;
}
