import Link from "next/link";
import { IconPharmacist } from "@/components/Icons";
import { coverFor, navCategories } from "@/lib/catalog";
import { priceShort } from "@/lib/format";
import { SHIPPING, SITE } from "@/lib/site";
import { Wordmark } from "../Wordmark";
import { Announcements } from "./Announcements";
import { HeaderActions } from "./HeaderActions";
import { MegaNav, type MenuCategory } from "./MegaNav";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";

export function Header() {
  const menu: MenuCategory[] = navCategories().map((c) => {
    const cover = coverFor(c.id);
    return {
      id: c.id,
      name: c.name,
      short: c.short,
      count: c.count,
      subs: c.subs.map((s) => ({ id: s.id, name: s.name, group: s.group ?? "", count: s.count })),
      cover: cover ? { src: cover.image, iw: cover.iw, ih: cover.ih, alt: "" } : null,
    };
  });
  const messages = [
    `Безплатна доставка над ${priceShort(SHIPPING.freeFrom)}`,
    "Консултация с магистър-фармацевт",
    "Плащане при получаване",
  ];
  return (
    <>
      <Announcements messages={messages} />
      <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/88">
        <div className="shell flex h-16 items-center gap-2 lg:h-[4.75rem] lg:gap-8">
          <MobileMenu categories={menu} />
          <Link href="/" className="mr-auto shrink-0 rounded-md lg:mr-0" aria-label={`${SITE.name} — начало`}>
            <Wordmark className="text-[1.6rem] lg:text-[1.85rem]" tagline />
          </Link>
          <div className="hidden max-w-[44rem] flex-1 lg:block">
            <SearchBox />
          </div>
          <Link
            href="/konsultatsia"
            className="ml-auto hidden items-center gap-2.5 rounded-xl px-2 py-1 text-left transition-colors duration-150 hover:bg-mint-soft xl:flex"
          >
            <span className="grid size-10 place-items-center rounded-full bg-mint-soft text-mint-deep">
              <IconPharmacist size={21} />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.75rem] text-ink-3">Въпрос към фармацевт?</span>
              <span className="block text-[0.875rem] font-semibold text-ink">Отговаряме до 1 час</span>
            </span>
          </Link>
          <HeaderActions />
        </div>
        <div className="shell pb-3 lg:hidden">
          <SearchBox compact />
        </div>
        <MegaNav categories={menu} />
      </header>
    </>
  );
}
