import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).min(1).max(4),
  minutes: z.number().optional(),
  prerequisites: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
});

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: import.meta.env.DEV ? "**/*.md" : ["**/*.md", "!**/*.es.md"],
    generateId: ({ entry }) => {
      if (entry.endsWith(".es.md")) {
        return `es/${entry.slice(0, -".es.md".length)}`;
      }
      return entry.replace(/\.md$/, "");
    },
  }),
  schema: blogSchema,
});

export const collections = { blog };
