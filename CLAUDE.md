## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Editorial north star

Blog articles prioritize **clarity → usefulness → correctness → depth → completeness**.

Optimize for information density and reader outcome, not word count. A developer should understand the problem and make a better engineering decision after reading.

Article creation, structure, translation, sources, and maintenance rules live in [`src/content/blog/AGENTS.md`](src/content/blog/AGENTS.md).

## Article filenames, slugs, and URLs

Use kebab-case for filenames, slugs, URLs, and internal links:

```text
trace-id-is-not-transaction-id
structured-logging-transaction-id-nestjs
access-token
api-key
```

Do not concatenate words (`traceid`, `transactionid`, `apikey`).

Inside article body, code, variables, APIs, and identifiers, keep official technical names (`transactionId`, `traceId`, `accessToken`).

Each English article `article.md` has a Spanish pair `article.es.md`. Spanish files are authored for local review; production routing currently publishes English only.

## Frontmatter dates

Articles use `publishedAt` (original publication) and `updatedAt` (last substantial content change). See [`src/content/blog/AGENTS.md`](src/content/blog/AGENTS.md) for when to change `updatedAt`.

When renaming a slug, add a permanent HTTP 301 in `vercel.json`, update internal links and `related` slugs, and rename the matching OG asset in `src/assets/`. Never leave the old slug as a duplicate page.
