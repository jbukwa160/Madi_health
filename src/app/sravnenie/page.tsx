import type { Metadata } from "next";
import { CompareTable } from "@/components/compare/CompareTable";
import { Breadcrumbs } from "@/components/listing/Listing";

export const metadata: Metadata = { title: "Сравнение на продукти", robots: { index: false } };

export default function ComparePage() {
  return (
    <div className="shell pt-6 md:pt-8">
      <Breadcrumbs items={[{ href: "/", label: "Начало" }, { label: "Сравнение" }]} />
      <h1 className="display mt-6 text-[2rem] sm:text-[2.4rem]">Сравнение на продукти</h1>
      <CompareTable />
    </div>
  );
}
