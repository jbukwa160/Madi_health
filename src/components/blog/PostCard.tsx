import Image from "next/image";
import Link from "next/link";
import { type Post, postDate } from "@/lib/blog";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden bg-tile-deep">
        <Image
          src={post.image.src}
          alt=""
          fill
          sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <time dateTime={post.date} className="text-[0.8125rem] text-ink-3">
          {postDate(post.date)}
        </time>
        <h3 className="mt-2 text-[1.125rem] leading-snug">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        <p className="clamp-3 mt-2 text-[0.875rem] leading-relaxed text-ink-2">{post.description}</p>
        <span className="mt-auto pt-4 text-[0.875rem] font-semibold text-mint-deep">Прочети →</span>
      </div>
    </article>
  );
}
