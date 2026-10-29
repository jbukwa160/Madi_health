import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { IconPharmacist } from "@/components/Icons";
import { Breadcrumbs } from "@/components/listing/Listing";
import { allPosts, type Block, getPost, postDate, readingMinutes, type Segment } from "@/lib/blog";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, images: [post.image.src], publishedTime: post.date },
  };
}

function Text({ segs }: { segs: Segment[] }) {
  return (
    <>
      {segs.map((s, i) => (s.b ? <strong key={i}>{s.t}</strong> : <span key={i}>{s.t}</span>))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2>
          <Text segs={block.segs} />
        </h2>
      );
    case "h3":
      return (
        <h3>
          <Text segs={block.segs} />
        </h3>
      );
    case "p":
      return (
        <p>
          <Text segs={block.segs} />
        </p>
      );
    default: {
      const List = block.type;
      return (
        <List>
          {block.items.map((item, i) => (
            <li key={i}>
              <Text segs={item} />
            </li>
          ))}
        </List>
      );
    }
  }
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const more = allPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: `${SITE.url}${post.image.src}`,
    publisher: { "@type": "Organization", name: SITE.name },
  };
  return (
    <div className="shell pt-6 md:pt-8">
      <Breadcrumbs items={[{ href: "/", label: "Начало" }, { href: "/blog", label: "Блог" }, { label: post.title }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <p className="text-[0.875rem] text-ink-3">
          <time dateTime={post.date}>{postDate(post.date)}</time> · {readingMinutes(post)} мин. четене
        </p>
        <h1 className="display mt-2 text-[1.9rem] sm:text-[2.4rem]">{post.title}</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-2">{post.description}</p>
        <div className="relative mt-7 overflow-hidden rounded-2xl bg-tile-deep" style={{ aspectRatio: `${post.image.w} / ${post.image.h}` }}>
          <Image src={post.image.src} alt="" fill priority sizes="(min-width: 48rem) 48rem, 100vw" className="object-cover" />
        </div>
        <div className="prose-arfa mt-8">
          {post.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </div>
        <Link
          href="/konsultatsia"
          className="mt-10 flex items-center gap-4 rounded-2xl border border-mint/30 bg-mint-soft p-5 transition-colors duration-150 hover:bg-[#d3f2ea]"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-mint-deep">
            <IconPharmacist size={26} />
          </span>
          <span>
            <span className="block font-semibold text-ink">Имате въпрос по темата?</span>
            <span className="block text-[0.875rem] text-ink-2">Попитайте магистър-фармацевт — отговаряме до 1 час, безплатно.</span>
          </span>
        </Link>
        <p className="mt-6 text-[0.8125rem] text-ink-3">Статията е с информационна цел и не замества консултацията с лекар.</p>
      </article>
      {more.length ? (
        <section className="mt-16">
          <h2 className="text-[1.5rem]">Още от блога</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
