import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: ["**/*.md", "!**/*.es.md"] }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1).max(4),
    minutes: z.number().optional(),
    prerequisites: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
