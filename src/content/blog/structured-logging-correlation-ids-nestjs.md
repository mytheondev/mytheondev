---
title: "Structured logging and correlation IDs in NestJS: debug without noise or leaks"
description: "How to add structured logs and correlation IDs in NestJS so incidents are searchable, without dumping secrets or drowning in noise."
pubDate: 2026-04-13
tags: [NestJS, API, Observability]
minutes: 3
---

When a production request fails, you need one ID that follows it across gateways, services, and jobs. Unstructured `console.log` lines will not get you there, and dumping the full request body will leak credentials.

## One JSON line per event

Use a structured logger (Pino via `nestjs-pino` is a solid default). Every line should be JSON with at least `level`, `msg`, `time`, and `requestId`.

```ts
LoggerModule.forRoot({
  pinoHttp: {
    autoLogging: true,
    redact: ["req.headers.authorization", "req.body.password"],
  },
});
```

Redact secrets at the logger, not in each handler. If a field can hold a token, treat it as a token.

## Correlation IDs

Accept an incoming `x-request-id` when present. If the client omitted it, generate a UUID and put it on the response.

```ts
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.header("x-request-id") ?? crypto.randomUUID();
    req.headers["x-request-id"] = requestId;
    res.setHeader("x-request-id", requestId);
    next();
  }
}
```

Bind that ID to the logger bindings so every subsequent line inherits it. Downstream HTTP calls should forward the same header.

## What not to log

Do not log access tokens, cookies, passwords, or full payment payloads. Do not log every successful health check at `info`. Keep `debug` for local work and sample high-volume success paths.

The goal is a quiet stream you can grep by `requestId` at 3 a.m., not a firehose that hides the incident.
