// Downloads a square icon for each brand in data/brand-domains.json (brand slug → the brand's website) into
// public/brands/<slug>.png and lists them in data/brand-logos.json. The shop serves the files itself.
//
//   npm run logos              (only brands without an icon yet)
//   npm run logos -- --again   (download every icon again)
//
// Sources, best first: the icons the brand's home page links (apple-touch-icon, icon with sizes), Google's favicon
// service at 256 px, /apple-touch-icon.png. Any format is turned into a 256 px PNG. Icons smaller than 96 px are
// skipped; those brands keep the lettered tile on the home page.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import sharp from "sharp";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "brands");
const LIST = path.join(ROOT, "data", "brand-logos.json");
const MIN = 96;
const again = process.argv.includes("--again");

type Logo = { file: string; w: number; h: number; domain: string };

const UA = { "user-agent": "Arfa7CatalogBot/1.0 (brand icons for the brand list)" };

async function get(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: UA });
    if (!res.ok || !/^image\//.test(res.headers.get("content-type") ?? "")) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/** Icon links of the brand's home page, largest first. */
async function linkedIcons(domain: string): Promise<string[]> {
  for (const base of [`https://www.${domain}/`, `https://${domain}/`]) {
    try {
      const res = await fetch(base, { signal: AbortSignal.timeout(15_000), headers: UA, redirect: "follow" });
      if (!res.ok) continue;
      const html = (await res.text()).slice(0, 400_000);
      const found: { url: string; size: number }[] = [];
      for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
        const rel = /rel=["']?([^"'>]+)/i.exec(tag)?.[1]?.toLowerCase() ?? "";
        if (!/icon/.test(rel)) continue;
        const href = /href=["']?([^"'\s>]+)/i.exec(tag)?.[1];
        if (!href) continue;
        const sizes = Number(/sizes=["']?(\d+)/i.exec(tag)?.[1] ?? 0);
        const size = sizes || (/apple-touch/.test(rel) ? 180 : /\.svg/i.test(href) ? 512 : 32);
        found.push({ url: new URL(href.replace(/&amp;/g, "&"), res.url).href, size });
      }
      return found.sort((a, b) => b.size - a.size).map((f) => f.url);
    } catch {
      // try the other address
    }
  }
  return [];
}

/** A square 256 px PNG of the icon, or null when it is too small or not a picture. */
async function normalise(buf: Buffer | null): Promise<Buffer | null> {
  if (!buf) return null;
  try {
    const s = imageSize(buf);
    const vector = s.type === "svg";
    if (!vector && (!s.width || !s.height || Math.min(s.width, s.height) < MIN)) return null;
    return await sharp(buf, { density: vector ? 300 : undefined })
      .resize(256, 256, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

async function main() {
  const domains = JSON.parse(readFileSync(path.join(ROOT, "data", "brand-domains.json"), "utf8")) as Record<string, string>;
  const logos: Record<string, Logo> = existsSync(LIST) ? JSON.parse(readFileSync(LIST, "utf8")) : {};
  mkdirSync(OUT, { recursive: true });
  for (const [slug, domain] of Object.entries(domains)) {
    if (!again && logos[slug]?.domain === domain && existsSync(path.join(OUT, logos[slug].file))) continue;
    let found: { buf: Buffer; size: { w: number; h: number } } | null = null;
    const urls = [...(await linkedIcons(domain)), `https://www.google.com/s2/favicons?domain=${domain}&sz=256`, `https://${domain}/apple-touch-icon.png`];
    for (const url of urls) {
      const png = await normalise(await get(url));
      if (png) {
        found = { buf: png, size: { w: 256, h: 256 } };
        break;
      }
    }
    if (!found) {
      delete logos[slug];
      console.log(`  ${slug}: no icon of ${MIN}+ px on ${domain}`);
      continue;
    }
    writeFileSync(path.join(OUT, `${slug}.png`), found.buf);
    logos[slug] = { file: `${slug}.png`, ...found.size, domain };
    console.log(`  ${slug}: ${found.size.w}×${found.size.h}`);
  }
  writeFileSync(LIST, JSON.stringify(logos, null, 2) + "\n");
  console.log(`✓ ${Object.keys(logos).length} brand icons in public/brands/`);
}

main();
