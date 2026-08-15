import type { CollectionEntry } from "astro:content";
import type { MarkdownHeading } from "astro";

export type BlogPost = CollectionEntry<"blog">;

const WORDS_PER_MINUTE = 220;

export function readingMinutes(body: string | undefined, override?: number) {
  if (override && override > 0) return override;
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function shouldShowToc(headings: MarkdownHeading[], minutes: number) {
  const h2Count = headings.filter((heading) => heading.depth === 2).length;
  return h2Count >= 5 || minutes >= 12;
}

export function tocHeadings(headings: MarkdownHeading[]) {
  return headings.filter((heading) => heading.depth === 2);
}

export function datesDiffer(published: Date, updated?: Date) {
  if (!updated) return false;
  return updated.toISOString().slice(0, 10) !== published.toISOString().slice(0, 10);
}

export function tagHref(tag: string) {
  return `/blog/?tag=${encodeURIComponent(tag)}`;
}

export function relatedPosts(current: BlogPost, all: BlogPost[]) {
  const manual = current.data.related ?? [];
  if (manual.length > 0) {
    const byId = new Map(all.map((post) => [post.id, post]));
    return manual
      .map((id) => byId.get(id))
      .filter((post): post is BlogPost => Boolean(post) && post?.id !== current.id)
      .slice(0, 3);
  }

  return all
    .filter((post) => post.id !== current.id)
    .map((post) => ({
      post,
      score: post.data.tags.filter((tag) => current.data.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
    )
    .slice(0, 3)
    .map((entry) => entry.post);
}

export function adjacentPosts(current: BlogPost, all: BlogPost[]) {
  const ordered = [...all].sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
  const index = ordered.findIndex((post) => post.id === current.id);
  return {
    older: index > 0 ? ordered[index - 1] : undefined,
    newer: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

export function slugFromId(id: string) {
  return id.replace(/\/$/, "");
}
