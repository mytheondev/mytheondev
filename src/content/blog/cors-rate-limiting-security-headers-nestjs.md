---
title: "CORS, rate limiting, and security headers in NestJS: a production API checklist"
description: "A short NestJS production checklist for CORS, rate limiting, and security headers so public APIs fail closed instead of leaking defaults."
pubDate: 2026-04-14
tags: [NestJS, API, Security]
minutes: 2
---

A NestJS API that “works on localhost” is not a production API. Before you expose a service, lock down three things that browsers and bots will hit first: CORS, rate limits, and security headers.

## CORS: allow a list, not the world

Enable CORS in `main.ts` with an explicit origin list. Avoid `origin: true` on a public API unless every caller is trusted.

```ts
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(",") ?? [],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
```

If a mobile app or server-to-server client does not need cookies, drop `credentials` and keep the allowlist tight.

## Rate limiting: fail closed

Use `@nestjs/throttler` globally, then relax specific routes. A default of 60 requests per minute per IP is a reasonable starting point for a JSON API.

```ts
ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60_000, limit: 60 }],
});
```

Return `429` with a stable body. Do not leak internal counters or Redis errors in the response.

## Security headers

Helmet is enough for most NestJS services. Set it once after `NestFactory.create`:

```ts
app.use(helmet());
```

Confirm `X-Content-Type-Options`, `Referrer-Policy`, and a conservative `Content-Security-Policy` on any route that serves HTML. For a JSON-only API, still send `X-Content-Type-Options: nosniff`.

Ship this checklist before the first public client. Defaults are convenient; they are also how APIs get scraped and misused.
