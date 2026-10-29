"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconPhone } from "@/components/Icons";
import { SITE } from "@/lib/site";

/**
 * The navy strip above the header: the pharmacy's promises on the left, help links and the phone on the right. On
 * phones one promise at a time, crossfading (opacity only, so reduced motion keeps it).
 */
export function Announcements({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || messages.length < 2) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setI((n) => (n + 1) % messages.length);
    }, 4800);
    return () => clearInterval(id);
  }, [messages.length]);
  const tel = SITE.phone.replace(/\s/g, "");
  return (
    <div className="bg-deep text-[0.8125rem] text-white/85">
      <div className="shell flex h-9 items-center justify-between gap-6">
        <ul className="hidden items-center gap-6 whitespace-nowrap lg:flex">
          {messages.map((m, n) => (
            <li key={m} className={`items-center gap-2 ${n >= 3 ? "hidden 2xl:flex" : n >= 2 ? "hidden xl:flex" : "flex"}`}>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-mint" />
              {m}
            </li>
          ))}
        </ul>
        <div className="relative h-full flex-1 lg:hidden" aria-live="off">
          {messages.map((m, n) => (
            <p
              key={m}
              aria-hidden={n !== i}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 sm:justify-start ${n === i ? "opacity-100" : "opacity-0"}`}
            >
              {m}
            </p>
          ))}
        </div>
        <ul className="hidden items-center gap-5 whitespace-nowrap sm:flex">
          <li>
            <Link href="/info/dostavka" className="link text-white/85 hover:text-white">
              Доставка и плащане
            </Link>
          </li>
          <li className="hidden md:block">
            <Link href="/info/kontakti" className="link text-white/85 hover:text-white">
              Контакти
            </Link>
          </li>
          <li>
            <a href={`tel:${tel}`} className="flex items-center gap-1.5 font-semibold text-white">
              <IconPhone size={15} className="text-mint" /> {SITE.phone}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
