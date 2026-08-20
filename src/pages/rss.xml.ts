import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getEnglishPosts } from "../lib/blog";
import { SITE_DESCRIPTION, SITE_TITLE } from "../lib/site";

export async function GET(context: APIContext) {
  const posts = await getEnglishPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
