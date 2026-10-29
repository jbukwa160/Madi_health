import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@/components/Icons";
import { Breadcrumbs } from "@/components/listing/Listing";
import { ProductImage } from "@/components/ProductImage";
import { coverFor, navCategories } from "@/lib/catalog";
import { count } from "@/lib/format";

export const metadata: Metadata = {
  title: "Категории",
  description: "Фармация и здраве, козметика, мама и бебе, хранителни добавки, хигиена, медицински изделия, био продукти и всичко за дома.",
  alternates: { canonical: "/kategorii" },
};

export default function CategoriesPage() {
  const categories = navCategories();
  return (
    <div className="shell pt-6 md:pt-8">
      <Breadcrumbs items={[{ href: "/", label: "Начало" }, { label: "Категории" }]} />
      <h1 className="display mt-6 text-[2.1rem] sm:text-[2.6rem]">Категории</h1>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const cover = coverFor(c.id, undefined, 1);
          const groups = new Map<string, typeof c.subs>();
          for (const s of c.subs) groups.set(s.group ?? "", [...(groups.get(s.group ?? "") ?? []), s]);
          return (
            <li key={c.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
              <Link href={`/${c.id}`} className="group flex items-start gap-4">
                {cover ? (
                  <span className="tile relative size-20 shrink-0 rounded-xl bg-canvas">
                    <ProductImage src={cover.image} alt="" iw={cover.iw} ih={cover.ih} sizes="80px" inset={8} />
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block text-[1.125rem] font-bold leading-tight tracking-[-0.015em] group-hover:text-brand">{c.name}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[0.8125rem] font-medium text-mint-deep">
                    {count(c.count)} продукта <IconArrowRight size={14} />
                  </span>
                </span>
              </Link>
              <div className="mt-4 space-y-3 border-t border-line pt-4">
                {[...groups.entries()].map(([group, subs]) => (
                  <div key={group || "all"}>
                    {group ? <p className="eyebrow mb-1.5">{group}</p> : null}
                    <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {subs.map((s) => (
                        <li key={s.id}>
                          <Link href={`/${c.id}/${s.id}`} className="link text-[0.875rem] text-ink-2 hover:text-brand">
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
