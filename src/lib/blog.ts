import posts from "@/content/blog.json";

// Blog articles of arfa7.bg (the pharmacy's own texts), brought over as structured blocks by a one-off extraction;
// cover pictures are in public/blog/. To add an article, add an entry to src/content/blog.json.

/** A run of text; `b` for bold. */
export type Segment = { t: string; b?: boolean };
export type Block = { type: "p" | "h2" | "h3"; segs: Segment[] } | { type: "ul" | "ol"; items: Segment[][] };

export type Post = {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  description: string;
  /** The article on arfa7.bg. */
  source: string;
  image: { src: string; w: number; h: number };
  blocks: Block[];
};

const ALL = (posts as Post[]).slice().sort((a, b) => b.date.localeCompare(a.date));

export const allPosts = (): Post[] => ALL;
export const getPost = (slug: string) => ALL.find((p) => p.slug === slug);

export function postDate(date: string): string {
  return new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

/** Reading time in minutes (200 words a minute). */
export function readingMinutes(p: Post): number {
  const text = p.blocks.map((b) => ("segs" in b ? b.segs : b.items.flat()).map((s) => s.t).join(" ")).join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
