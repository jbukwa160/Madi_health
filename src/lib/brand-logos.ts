import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

// Brand icons downloaded by `npm run logos` into public/brands/ (listed in data/brand-logos.json).

let logos: Record<string, { file: string }> | null = null;

/** The public address of the brand's icon, or null when there is none. */
export function brandLogo(slug: string): string | null {
  if (!logos) {
    try {
      logos = JSON.parse(readFileSync(path.join(process.cwd(), "data", "brand-logos.json"), "utf8"));
    } catch {
      logos = {};
    }
  }
  const hit = logos?.[slug];
  return hit ? `/brands/${hit.file}` : null;
}
