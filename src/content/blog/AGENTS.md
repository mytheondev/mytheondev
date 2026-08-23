# Blog editorial policy

Rules for creating, editing, translating, and maintaining articles in this directory. Project-wide conventions (dev server, slug kebab-case, frontmatter field names) live in the root [`AGENTS.md`](../../../AGENTS.md).

**Order of quality:** clarity → usefulness → correctness → depth → completeness.

Optimize for information density and reader outcome, not word count.

## Pairing and language

Every English article `slug.md` has a Spanish pair `slug.es.md`.

The Spanish version is not a literal translation. It should read as if it was written for a Spanish-speaking developer: natural phrasing, usual technical terminology, official product names untranslated, code/URLs/references unchanged, same technical level.

## Frontmatter

```yaml
title: "..."
description: "..."
publishedAt: "YYYY-MM-DDTHH:mm:ssZ"
updatedAt: "YYYY-MM-DDTHH:mm:ssZ"
tags: [Tag1, Tag2]
minutes: 12
prerequisites: []
related:
  - other-article-slug
```

- `publishedAt`: original publication date. Do not change it.
- `updatedAt`: last substantial content change. Required. Equal to `publishedAt` until a substantial edit.
- `related`: English slugs only (no `es/` prefix). Prefer linking instead of repeating another article.

Update `updatedAt` when technical content, code, APIs, recommendations, versions, architecture, security, or decision-relevant facts change. Do not update it for typos, formatting, visual tweaks, or image-only changes.

`minutes` must match the article after a substantial edit. Prefer letting `readingMinutes()` compute it, or set an override that reflects the new length. Do not leave a stale override.

## One primary question

Each article answers one primary question. If it answers several independent questions, shorten to one question or split later. Do not turn every article into an encyclopedia.

Readers must leave knowing: the problem, why it matters, the concepts needed, the decision, when to apply it, when not to, and the main trade-offs.

## Audience

Writable for a Junior without sacrificing Mid/Senior depth.

- **Basic:** what it is, why it exists, the problem it solves, a simple example.
- **Intermediate:** how it works, common decisions, frequent mistakes, trade-offs.
- **Advanced (only when relevant):** edge cases, architecture, scale, security, observability, consistency, operations.

Do not add complexity only to sound advanced.

## Length

| Type                    | Recommended length |
| ----------------------- | -----------------: |
| Concept / explanation   |  1,200–2,000 words |
| Comparison              |  1,500–2,500 words |
| Tutorial                |  1,800–3,000 words |
| Architecture / security |  2,000–3,500 words |
| Deep guide              |  3,000–4,500 words |

Most articles: 6–12 minutes. 15 minutes is the normal ceiling. Beyond 15 minutes or 4,500 words needs a clear reason (for example a justified multi-layer security guide).

Do not shorten an article that still needs depth. Do not pad a short article that has not explained the problem.

## Structure

Use sections that earn their place. A typical shape, not a mandatory outline:

1. Introduction
2. The problem
3. Core concepts
4. How it works
5. Practical example
6. Trade-offs
7. When to use it
8. When not to use it
9. Common mistakes
10. Conclusion
11. Sources

Merge sections that answer the same question. Cut repetition, long intros, conclusions that recap the whole piece, obvious definitions, excess history, and extra case studies that do not serve the primary question.

## Cross-linking

Before adding a long explanation, check whether another article already covers it. Summarize and link. Example: architecture posts that need `traceId` vs `transactionId` should link to `trace-id-is-not-transaction-id` instead of restating it.

## Sources

Back important technical claims. Prefer official docs, RFCs, specs, vendor docs, official projects, then recognized engineering blogs. Do not invent references. Do not use a secondary source when a primary one exists.

## Code and diagrams

Code exists to demonstrate an idea: small focused snippets, no unused boilerplate, no full-file dumps unless the file _is_ the point.

A diagram must answer a concrete question better than the surrounding text. If it does not, remove it.

## Open Graph images

Open Graph images live at `src/assets/{slug}.png` and are provided manually. Do not generate, design, or invent them for new or updated articles. Until the matching PNG exists, the site falls back to the default OG image.

When renaming a published slug, rename the existing OG asset. Do not create a replacement image.

## Filenames vs in-content names

Slugs and URLs: kebab-case (`trace-id`, `transaction-id`, `api-key`).

In prose and code: official names (`transactionId`, `traceId`, `accessToken`). Do not rename identifiers in code to satisfy the slug rule.

When renaming a published slug: rename the Markdown files and OG asset, update canonical-facing links and `related`, and add a 301 in `vercel.json` from the old URL to the new one.

## Quality gate

Before shipping an article:

- The problem is clear in the first minutes, and the main answer arrives soon enough.
- Every section explains, demonstrates, compares, justifies, warns, or helps decide.
- A Junior can follow it; a Senior finds decisions and trade-offs.
- Examples are concrete; theory is not padding; sources are trustworthy; facts are still correct.
- There is one primary question; the reader knows when to use the solution and when not to.
- The article ends before it starts repeating itself.
