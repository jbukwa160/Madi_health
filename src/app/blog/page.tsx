import type { Metadata } from "next";
import { PostCard } from "@/components/blog/PostCard";
import { Breadcrumbs } from "@/components/listing/Listing";
import { allPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Блог",
  description: "Съвети за здраве, имунитет, грижа за кожата и за бебето от фармацевтите на Аптека Арфа 7.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = allPosts();
  return (
    <div className="shell pt-6 md:pt-8">
      <Breadcrumbs items={[{ href: "/", label: "Начало" }, { label: "Блог" }]} />
      <header className="mt-6 max-w-3xl">
        <p className="eyebrow">Съвети от аптеката</p>
        <h1 className="display mt-2 text-[2rem] sm:text-[2.4rem]">Блог</h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink-2">Сезонни съвети за здраве, имунитет, грижа за кожата и за най-малките.</p>
      </header>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <PostCard post={p} priority={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
