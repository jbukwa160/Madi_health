import Link from "next/link";
import { navCategories } from "@/lib/catalog";
import { priceShort } from "@/lib/format";
import { CARRIERS, SHIPPING, SITE } from "@/lib/site";
import { IconCash, IconClock, IconGift, IconMail, IconPharmacist, IconPhone, IconPin, IconReturn, IconTruck } from "./Icons";
import { Wordmark } from "./Wordmark";

const COMPANY = [
  { href: "/info/za-nas", label: "За нас" },
  { href: "/info/kontakti", label: "Контакти и аптека" },
  { href: "/info/obshti-usloviya", label: "Общи условия" },
  { href: "/info/poveritelnost", label: "Политика за поверителност" },
  { href: "/info/biskvitki", label: "Политика за бисквитките" },
  { href: "/info/prava-na-potrebitelite", label: "Права на потребителите" },
  { href: "/info/organi", label: "Органи, регулиращи дейността" },
];
const HELP = [
  { href: "/info/dostavka", label: "Доставка и плащане" },
  { href: "/info/vrashtane", label: "Връщане и отказ от поръчка" },
  { href: "/info/kak-da-porucham", label: "Как да поръчам" },
  { href: "/konsultatsia", label: "Консултация с фармацевт" },
  { href: "/marki", label: "Всички марки" },
];
/** Bodies that license and supervise the pharmacy (the same links arfa7.bg shows). */
const REGULATORS = [
  { href: "https://www.bda.bg/", label: "Изпълнителна агенция по лекарствата" },
  { href: "https://www.bphu.bg/", label: "Български фармацевтичен съюз" },
  { href: "https://www.baap.bg/", label: "Българска асоциация на помощник-фармацевтите" },
  { href: "https://www.mh.government.bg/", label: "Министерство на здравеопазването" },
  { href: "https://kzp.bg/", label: "Комисия за защита на потребителите" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const tel = SITE.phone.replace(/\s/g, "");
  const C = SITE.company;
  return (
    <footer className="mt-20 bg-deep text-white">
      <div className="border-b border-white/10">
        <ul className="shell grid grid-cols-1 gap-x-8 gap-y-5 py-8 text-[0.875rem] sm:grid-cols-2 lg:grid-cols-4">
          <Pledge icon={<IconTruck size={22} />} title={`Безплатна доставка над ${priceShort(SHIPPING.freeFrom)}`} text={`До ${SHIPPING.days} работни дни в цяла България`} />
          <Pledge icon={<IconGift size={22} />} title="Подарък мостра" text="Към всяка поръчка" />
          <Pledge icon={<IconCash size={22} />} title="Плащане при получаване" text="Наложен платеж, без предплащане" />
          <Pledge icon={<IconReturn size={22} />} title={`${SHIPPING.returnDays} дни за връщане`} text="За неразпечатани продукти" />
        </ul>
      </div>

      <div className="shell grid gap-12 py-14 lg:grid-cols-[1.15fr_2fr]">
        <div>
          <Link href="/" aria-label={`${SITE.name} — начало`} className="inline-block rounded-md">
            <Wordmark inverse tagline className="text-[1.9rem]" />
          </Link>
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/70">
            Онлайн аптека за здраве, красота и комфорт: продукти без рецепта, хранителни добавки, дермокозметика и всичко за мама и бебе.
          </p>
          <div className="mt-6 space-y-2.5 text-[0.9375rem]">
            <a href={`tel:${tel}`} className="flex w-fit items-center gap-2.5 font-semibold text-white">
              <IconPhone size={18} className="text-mint" /> {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="link flex w-fit items-center gap-2.5 text-white/85 hover:text-white">
              <IconMail size={18} className="text-mint" /> {SITE.email}
            </a>
            <a href={SITE.pharmacy.mapUrl} target="_blank" rel="noopener" className="link flex w-fit items-start gap-2.5 text-white/85 hover:text-white">
              <IconPin size={18} className="mt-0.5 shrink-0 text-mint" /> {SITE.pharmacy.address}
            </a>
            <p className="flex items-start gap-2.5 text-white/70">
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
          <Link
            href="/konsultatsia"
            className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-white/8 px-4 py-3 text-[0.875rem] font-semibold text-white ring-1 ring-white/12 transition-colors duration-150 hover:bg-white/14"
          >
            <IconPharmacist size={20} className="text-mint" /> Попитайте магистър-фармацевт
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <FooterColumn title="Категории" links={navCategories().map((c) => ({ href: `/${c.id}`, label: c.name }))} />
          <FooterColumn title="Помощ" links={HELP} />
          <FooterColumn title="За компанията" links={COMPANY} />
          <FooterColumn title="Регулаторни органи" links={REGULATORS} external />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 text-[0.8125rem] text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Доставяме с {Object.values(CARRIERS).join(", ")} — до офис, автомат или адрес.</p>
          <p>Цените са в евро с включен ДДС.</p>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/15">
        <div className="shell space-y-2 py-6 text-[0.75rem] leading-relaxed text-white/55">
          <p>
            {SITE.brand} онлайн аптека е лицензирана от Изпълнителната агенция по лекарствата (разрешение за търговия на дребно с лекарствени
            продукти {SITE.pharmacy.licenceNo}).
          </p>
          <p>
            © {year} {C.name} · ЕИК {C.eik}
            {C.vat ? ` · ДДС № ${C.vat}` : ""} · {C.address} · Управител: {C.manager}
          </p>
          <p>
            Проект {SITE.euProject.number} — бенефициент {C.name}, ЕИК {C.eik}. Административен договор по процедура {SITE.euProject.procedure},
            програма {SITE.euProject.programme}, съфинансирана от Европейския съюз.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Pledge({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-center gap-3.5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/8 text-mint">{icon}</span>
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="block text-[0.8125rem] text-white/60">{text}</span>
      </span>
    </li>
  );
}

function FooterColumn({ title, links, external = false }: { title: string; links: { href: string; label: string }[]; external?: boolean }) {
  return (
    <div>
      <p className="text-[0.8125rem] font-semibold text-white">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            {external ? (
              <a href={l.href} target="_blank" rel="noopener" className="link text-[0.875rem] text-white/70 hover:text-white">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="link text-[0.875rem] text-white/70 hover:text-white">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
