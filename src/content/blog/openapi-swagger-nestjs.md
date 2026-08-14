---
title: "OpenAPI and Swagger in NestJS: a clear contract in dev and production"
description: "Set up OpenAPI and Swagger in NestJS so the API contract stays accurate in development and stays locked down in production."
pubDate: 2026-04-12
tags: [NestJS, API, OpenAPI]
minutes: 2
---

A NestJS API without a contract will drift. Controllers change, DTOs grow optional fields, and clients guess. OpenAPI is the cheapest way to keep that contract honest.

## Generate the document from code

Use `@nestjs/swagger` and decorate DTOs, not a hand-written YAML file that nobody updates.

```ts
const config = new DocumentBuilder()
  .setTitle("Mytheon API")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
```

`class-validator` decorators should match the Swagger ones. If a field is required in the validator, it is required in the document.

## Dev vs production

Serve Swagger UI in development. In production, either disable the UI or protect it.

```ts
if (process.env.NODE_ENV !== "production") {
  SwaggerModule.setup("docs", app, document);
}
```

Still emit the JSON spec in CI so clients and contract tests can consume it without a browser. Treat a broken spec as a failed build.

## Contracts are for humans and machines

A clear OpenAPI file lets frontend teams generate types, lets QA write checks against status codes, and lets you catch accidental breaking changes. If the UI is the only source of truth, you do not have a contract — you have a demo.
