import { getCollection, type CollectionEntry } from "astro:content";
import type { MarkdownHeading } from "astro";

export type BlogPost = CollectionEntry<"blog">;

const WORDS_PER_MINUTE = 220;
const SPANISH_PREFIX = "es/";

export function isSpanishPost(id: string) {
  return id.startsWith(SPANISH_PREFIX);
}

export function canonicalSlug(id: string) {
  return slugFromId(isSpanishPost(id) ? id.slice(SPANISH_PREFIX.length) : id);
}

function localeFromId(id: string) {
  return isSpanishPost(id) ? "es" : "en";
}

function localizedId(id: string, locale: "es" | "en") {
  const slug = canonicalSlug(id);
  return locale === "es" ? `${SPANISH_PREFIX}${slug}` : slug;
}

export async function getEnglishPosts() {
  return getCollection("blog", ({ id }) => !isSpanishPost(id));
}

export async function getRoutablePosts() {
  if (import.meta.env.DEV) return getCollection("blog");
  return getEnglishPosts();
}

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

function sameLocalePosts(current: BlogPost, all: BlogPost[]) {
  const locale = localeFromId(current.id);
  return all.filter((post) => localeFromId(post.id) === locale);
}

export function relatedPosts(current: BlogPost, all: BlogPost[]) {
  const locale = localeFromId(current.id);
  const peers = sameLocalePosts(current, all);
  const byId = new Map(peers.map((post) => [post.id, post]));
  const manual = current.data.related ?? [];

  if (manual.length > 0) {
    return manual
      .map((id) => byId.get(localizedId(id, locale)))
      .filter((post): post is BlogPost => Boolean(post) && post?.id !== current.id)
      .slice(0, 3);
  }

  return peers
    .filter((post) => post.id !== current.id)
    .map((post) => ({
      post,
      score: post.data.tags.filter((tag) => current.data.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || b.post.data.publishedAt.valueOf() - a.post.data.publishedAt.valueOf(),
    )
    .slice(0, 3)
    .map((entry) => entry.post);
}

export function adjacentPosts(current: BlogPost, all: BlogPost[]) {
  const ordered = [...sameLocalePosts(current, all)].sort(
    (a, b) => a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf(),
  );
  const index = ordered.findIndex((post) => post.id === current.id);
  return {
    older: index > 0 ? ordered[index - 1] : undefined,
    newer: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

export function slugFromId(id: string) {
  return id.replace(/\/$/, "");
}
