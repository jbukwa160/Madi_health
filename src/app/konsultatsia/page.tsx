import type { Metadata } from "next";
import Link from "next/link";
import { ConsultForm } from "@/components/consult/ConsultForm";
import { IconClock, IconMail, IconPharmacist, IconPhone, IconShield } from "@/components/Icons";
import { Breadcrumbs } from "@/components/listing/Listing";
import { TOPICS } from "@/lib/consultations";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Консултация с магистър-фармацевт",
  description: `Безплатна консултация с магистър-фармацевт от ${SITE.name}: отговор до 1 час по телефона или по имейл.`,
  alternates: { canonical: "/konsultatsia" },
};

export default function ConsultationPage() {
  const tel = SITE.phone.replace(/\s/g, "");
  return (
    <div className="shell pt-6 md:pt-8">
      <Breadcrumbs items={[{ href: "/", label: "Начало" }, { label: "Консултация с фармацевт" }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
        <div>
          <p className="eyebrow">Безплатно</p>
          <h1 className="display mt-2 text-[2.1rem] sm:text-[2.6rem]">
            Попитайте <em>магистър-фармацевт</em>
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-ink-2">
            Имате въпрос за лекарство, дозировка, съвместимост на добавки или подходящ продукт? Опишете го накратко — ще ви отговорим до 1 час в
            работното време на аптеката.
          </p>
          <div className="mt-8 max-w-2xl">
            <ConsultForm topics={TOPICS} />
          </div>
        </div>
        <aside className="space-y-4 lg:pt-14">
          <div className="rounded-2xl bg-brand p-6 text-white">
            <IconPharmacist size={30} className="text-mint" />
            <p className="mt-3 text-[1.125rem] font-semibold">Предпочитате да говорите?</p>
            <a href={`tel:${tel}`} className="mt-3 flex items-center gap-2 text-[1.25rem] font-bold">
              <IconPhone size={20} className="text-mint" /> {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="link mt-2 flex w-fit items-center gap-2 text-white/80 hover:text-white">
              <IconMail size={18} className="text-mint" /> {SITE.email}
            </a>
            <p className="mt-4 flex items-start gap-2 text-[0.875rem] text-white/75">
              <IconClock size={18} className="mt-0.5 shrink-0 text-mint" />
              <span>
                {SITE.pharmacy.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.time}
                  </span>
                ))}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 text-[0.875rem] leading-relaxed text-ink-2">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <IconShield size={18} className="text-mint-deep" /> Важно
            </p>
            <p className="mt-2">
              Консултацията не замества прегледа при лекар. При остри или тежки симптоми потърсете лекар или се обадете на 112.
            </p>
            <p className="mt-2">
              Лекарства по лекарско предписание не продаваме онлайн — можете да ги получите в аптеката ни на {SITE.pharmacy.address.replace(/^гр\. София \d+, /, "")}.{" "}
              <Link href="/info/kontakti" className="font-semibold text-brand underline decoration-line-strong underline-offset-2">
                Как да ни намерите
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
