import { SITE } from "@/lib/site";

/** The harp of the ARFA7 logo, drawn as a line mark: navy frame, mint strings. */
export function HarpMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 6.6v16M15.5 7.7v9.6M19.5 6.6v5.2" stroke="var(--color-mint)" strokeWidth="2.2" />
      <path d="M7 27.5V6.5c3-3.6 7.2 1.4 11.5-.4 2.3-1 4.6-2.2 7-1.6L9.5 27.5H6" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

/** Logo: harp mark and "Arfa7". `inverse` for dark backgrounds. */
export function Wordmark({ className = "", inverse = false, tagline = false }: { className?: string; inverse?: boolean; tagline?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 leading-none ${inverse ? "text-white" : "text-brand"} ${className}`}>
      <HarpMark className="size-[1.35em] shrink-0" />
      <span className="flex flex-col">
        <span className="font-[750] tracking-[-0.035em]">
          Arfa<span className={inverse ? "text-mint" : "text-mint-deep"}>7</span>
        </span>
        {tagline ? (
          <span lang="bg" className={`mt-[0.28em] text-[0.34em] font-medium tracking-[0.02em] ${inverse ? "text-white/70" : "text-ink-3"}`}>
            онлайн аптека
          </span>
        ) : null}
      </span>
      <span className="sr-only">{SITE.name}</span>
    </span>
  );
}
