---
title: "When to build a monolith, and when you actually need microservices"
description: "Microservices are not the required upgrade from a monolith. How to choose by domain, team, scale, and operational maturity — and what each choice actually costs."
publishedAt: "2026-08-17T09:00:00Z"
updatedAt: "2026-10-07T09:00:00Z"
tags: [Architecture]
prerequisites:
  - Web application architecture
related:
  - trace-id-is-not-transaction-id
  - google-cloud-pubsub-how-to-use-it-correctly
---

The catalog team wants to ship on Friday. Payments is frozen until Monday because a schema change lives in the same artifact. Nobody is wrong. The architecture is.

Teams treat microservices as the grown-up form of a monolith, the way they treat Kubernetes as the grown-up form of a VM. Architecture is not a career ladder.

**Microservices are not the required evolution of a monolith.**

Choose by the problems you have to solve: domain complexity, team size and structure, how uneven the load is, how often you deploy, how independently components must change, availability and isolation, infrastructure cost, DevOps maturity, observability, operational complexity, and what the business needs this quarter. Fashion is not on that list.

Most organizations start with one deployable application. Some later extract services. Some never should. The interesting question is not "which architecture is better." It is:

> When should I build a monolith, and when do I actually need microservices?

## What a monolith actually is

A monolith is a system delivered as **one deployable unit**. User management, orders, payments, and inventory can live in the same codebase, the same process, and usually the same release. "Monolith" describes the deployment and process boundary. It does not describe code quality.

```mermaid
flowchart TD
  subgraph Monolith
    Users
    Orders
    Payments
    Inventory
  end
  Monolith --> Database[(Database)]
```

Inside that process, modules talk with function calls. They share memory, a runtime, and typically one primary database. A request enters a controller, walks through services and repositories, and either commits or rolls back in one transaction. There is no network hop between "orders" and "payments" unless you put one there.

A messy Rails app is a monolith. A carefully modular NestJS, Spring, or .NET application with explicit module APIs is also a monolith. Martin Fowler is explicit: in the microservices conversation, "monolith" means an application built as a single unit, not an insult for tangled code.

Three shapes get collapsed into one word:

- **Traditional monolith** — one codebase, weak internal boundaries, packages organized by technical layer. Anything can call anything.
- **Modular monolith** — still one deployable, but domains own their code and data access. Orders talks to Payments through a public module API, not by reaching into Payment's tables.
- **Well-designed monolith** — modular boundaries plus inversion of dependencies: domain logic does not depend on HTTP, the ORM, or the message broker. Hexagonal / ports-and-adapters and Clean Architecture are the usual names for that discipline.

The modular monolith is the version worth defending. Shopify's engineering team defined it as a system where all of the code powers a single application and there are strictly enforced boundaries between domains. You keep one test pipeline, one deploy, and in-process calls. You give up the fantasy that "one repo" means "no design."

## Why a monolith is often the correct first system

**Problem:** you need a working product, not a platform. **Constraint:** a small team, an unfinished domain, and a budget that does not include a platform group. **Trade-off:** the monolith concentrates change risk later; microservices concentrate operational risk now. **Decision:** start modular and together — you do not yet know the boundaries you would be freezing into network contracts.

| Concern     | In a monolith                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Development | One repo, one runtime, one set of types. A new engineer follows a request without opening four services. |
| Testing     | Boot the app and a database; assert payment and inventory in one process.                                |
| Debugging   | A stack trace is a stack trace. You do not need a trace backend to answer "which function threw."        |
| Deployment  | One artifact, one health check, one rollback. Fowler notes some orgs ship a monolith many times a day.   |
| Calls       | A local jump. It fails if the process fails — not because DNS expired or TLS timed out.                  |
| Cost        | One service plus one database. Vogels: a five-engineer startup may choose this because it is operable.   |

A function call is not a remote procedure. Remote procedures are slow relative to in-process calls, and they can fail even when both codepaths are correct. Fowler treats that as the first cost of playing the distribution card, not as an advanced topic you get to later.

## The problems that appear later

"The monolith does not scale" is the least useful diagnosis in this debate. Plenty of monoliths scale vertically and horizontally just fine. The failures that actually show up are more specific.

**High coupling.** Shipping rates call tax rates because both functions were in scope. Shopify described the result: a change in tax calculation could change shipping, and it was not obvious why.

**Changes that cannot be isolated.** A one-line fix in inventory still goes through the full test suite and the full release train.

**A full deploy for a small change.** You wanted to tweak a catalog ranking. You shipped payments again.

**Scale-the-whole-app.** Catalog is hot. Reports are cold. You add instances of everything.

**Blast radius.** A memory leak in reporting can starve checkout threads in the same process. Isolation is a process boundary. You did not buy one.

**Dependency upgrades.** The payments library needs a runtime the catalog module is not ready for. Everyone upgrades together, or nobody does.

**Large-team friction.** Onboarding requires the whole map. Shopify's 2016 tripwire: a new engineer on shipping also had to understand orders and payments.

**A shared database that became the real API.** Every module reads every table. The schema is a public contract with no versioning and no owner.

**Big Ball of Mud.** Boundaries existed on a whiteboard. In the repo they are comments. Fowler notes that sneaking around a module barrier is a useful tactical shortcut — and that done widely, it trashes productivity.

> The problem is not that the application is monolithic. The problem is that its internal boundaries are wrong, unenforced, or both.

If you extract services from a Big Ball of Mud without first drawing those boundaries, you get a distributed Big Ball of Mud. AWS's reliability guidance has a name for that failure mode: the microservice _Death Star_.

## What microservices actually are

James Lewis and Martin Fowler described microservices as independently deployable services organized around business capabilities, communicating over the network, and usually owning their own data. Microsoft's Azure Architecture Center uses the same shape: small, autonomous services, each implementing a single business capability inside a bounded context, deployed independently, talking through APIs or events.

```mermaid
flowchart TD
  Gateway[API / Gateway] --> UsersSvc[Users Service]
  Gateway --> OrdersSvc[Orders Service]
  Gateway --> PaymentsSvc[Payments Service]
  UsersSvc --> DbUsers[(DB Users)]
  OrdersSvc --> DbOrders[(DB Orders)]
  PaymentsSvc --> DbPayments[(DB Payments)]
```

This diagram is conceptual. **A database per service is a frequent practice for reducing coupling. It is not a law.** What the style actually requires is that other services do not reach into your tables. If two "services" share a schema and deploy on a coordinated schedule, you have cut a monolith into processes without buying independence.

## The problems they try to solve

Microservices are a response to specific operational and organizational pressure. They are not a cleaner way to write a CRUD app.

**Independent scaling.** Catalog takes browse traffic. Payments takes checkout. Those curves are not the same. This is **scalability**, not **performance**: splitting a call into three network hops usually makes a single request slower. You scale out a bottleneck. You do not make the function call faster.

**Independent deployment.** Payments can release a fraud rule without opening a change window for catalog. That only holds if the contract is stable. If every release still requires a lockstep deploy, you paid the distributed tax and kept the monolith's release train.

**Fault isolation.** A crash in reporting should not take down checkout. Azure is careful: an unavailable microservice does not disrupt the whole application **as long as upstream services handle the fault**. Isolation is a property you implement: timeouts, retries only for idempotent work, circuit breakers, bulkheads, queues (see [how to use Pub/Sub correctly](/blog/google-cloud-pubsub-how-to-use-it-correctly/) when the caller does not need an answer in the same request), dead-letter queues, and rate limiting. Without those, you have a distributed monolith that fails in more interesting ways.

## Advantages — and what each one costs

| Advantage                 | Solves                            | Useful when                                    | You pay                                                            |
| ------------------------- | --------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Independent deployment    | Lockstep releases                 | Parts change on different clocks               | Versioned contracts, compatibility windows, many pipelines         |
| Independent scaling       | Uneven load                       | One capability is an order of magnitude hotter | More runtimes, more autoscaling, more ways to be idle or thrashed  |
| Fault isolation           | Shared-fate crashes               | Availability requirements differ               | Partial failure as a product decision                              |
| Team autonomy             | Coordination overhead             | Teams already own domains                      | Conway's Law in both directions                                    |
| Clearer domain boundaries | "Who owns this table"             | Bounded contexts are already visible           | A wrong boundary is expensive to move across a network             |
| Technology diversity      | A measured runtime/datastore need | The constraint is real, not "we wanted Rust"   | Hiring, shared libraries, security baselines, multilingual on-call |

## The price of going distributed

A call that used to be `A → B` in-process can now fail because of a timeout, a dropped packet, DNS, TLS, a load balancer, a saturated instance, or the other service simply not being there. You still have bugs. You also have a new class of bugs named after the network.

Once a request leaves the process, logs without a shared identity are three opinions about three different events. You need a **transactionId** for the business operation, a **traceId** and **spanId** for the execution, structured logs, distributed tracing, and metrics that name the service, the route, and the dependency.

```mermaid
flowchart TD
  Request["Request TX-123"] --> Gateway[API Gateway]
  Gateway --> Orders[Orders Service]
  Orders --> Payments[Payments Service]
  Payments --> Bank[External Bank API]
```

Those identifiers let you reconstruct the path. They are not the same identifier. A checkout can keep `TX-123` across a retry that opens a second trace. If your team is about to split a process, read [traceId is not transactionId](/blog/trace-id-is-not-transaction-id/) before you invent a house header. Azure lists centralized logging, OpenTelemetry, and distributed tracing as part of the architecture, not as optional polish.

A purchase is no longer one transaction:

```mermaid
flowchart TD
  Created[Order Created] --> Payment
  Payment --> Inventory
  Inventory --> Shipping
```

Payment succeeds. Inventory fails. You now have money and no stock, or you retry inventory and decrement twice. Distributed transactions are possible and usually the wrong tool. The usual design is **eventual consistency**, a **saga** that can compensate, and **idempotent** handlers that survive **duplicate messages**. At-least-once delivery is the common broker guarantee. Exactly-once business effects are your problem. A monolith can hide this behind a single commit. A distributed system forces the conversation: what does the customer see, what do we refund, and how do we detect the inconsistency after the window has closed?

## When a monolith is the right call

**MVP.** You are still finding out whether anyone wants the product. A poorly designed successful system is a better problem than a beautifully distributed unused one. Microservices add cycle time when cycle time is the only advantage you have.

**Internal system.** Fifty employees, office hours, a known peak. You have a delivery problem, not a scale problem. A modular monolith with a boring database will outlive a service mesh nobody on-call understands.

**Small team.** Three to five developers. Vogels uses almost the same example. Every service you add is a service those same five people deploy, watch, and wake up for.

**Tightly coupled domain.** Checkout that must decrement stock, take money, and write the order in one business decision. If the business cannot tolerate "paid but not reserved" even for a few seconds, a distributed saga is a product defect. Keep the consistency boundary inside one process until the domain tells you it has split.

**Low scale.** A few requests per second, or a few hundred, on a predictable shape of traffic. Distribution will not create headroom you need. It will create failure modes you do not have staff to operate.

## When microservices earn their complexity

**Uneven scale.** Catalog at 100 requests/sec, reports at 2. Extract the hot, independently cacheable, independently owned piece first — not the whole map.

**Independent teams.** When teams already own domains and ship on different clocks, service boundaries can match ownership. Fowler's module-boundary argument is mostly an org argument. If you have one team and four services, you invented a coordination problem.

**Different availability.** Payments must stay up. Reports can wait. AWS's reliability pillar uses this as a reason to segment: you invest availability where the customer actually needs it.

**Different deploy cadence.** Identity ships weekly because it is careful. Catalog ships several times a day because merchandising will not wait. If they share a release, the careful team becomes the bottleneck and the fast team becomes the risk.

**Separated domains.** A bounded context has its own model and language. "Order" in billing is not "Order" in warehouse. When those models are stable and the teams can own them, a service is a reasonable physical expression of the context. When the model is still moving, a module is cheaper to rename.

## Two documented cases

**Netflix — a monolith that had to become a distributed system.** The cloud migration began in 2008; streaming ran on AWS by 2010, and billing, a SOX-sensitive system tied to Oracle in their datacenter, finished the move on 4 January 2016. The driver was scale, global expansion, and an environment where instances fail as a normal event, not a preference for microservices. Their "Rambo Architecture" required each system to succeed on its own: if recommendations are down, the site shows popular titles; Chaos Monkey kills instances so failure handling is exercised before a real outage. They also paid the distributed bill immediately: chatty APIs that a datacenter tolerated had to be redesigned for AWS latency, and they built Eureka and Ribbon because the cloud-native toolbox did not exist yet. Copy the problem, not the logo: at Netflix's scale the microservice premium was the cheaper bill.

**Shopify — a monolith that stayed a monolith on purpose.** One of the largest Rails codebases in existence (over 2.8 million lines by 2020, more than a thousand developers) had no real internal boundaries in 2016: shipping changes broke unrelated tests, and a new engineer on shipping also had to learn orders and payments. Instead of microservices, Shopify built a **modular monolith**: Componentization reorganized ~6,000 classes by domain, and Packwerk rejects pull requests that break the dependency graph. The payoff they reported was clearer ownership and the ability to swap a legacy tax engine, a change they had called nearly impossible. Their problem was modularity, not a need for independent runtimes.

Werner Vogels, writing after Prime Video documented a monitoring tool built as a monolith, repeated that there is no mandated style: components that always contribute to the same response, share scaling needs, and are owned by one team can be simpler together. Amazon itself moved from a monolith toward services, and S3 grew from a few microservices to more than 300. Both directions are documented. Neither is a religion.

## An e-commerce path from one deployable to a hybrid

Start here. The domain is unfinished. The team is one team. Checkout, catalog, and payments share a transaction more often than they don't.

This is a good decision. You can ship a cart. You can write one integration test for "pay and decrement stock." You can change the meaning of "order" without a versioned API.

Traffic arrives, and it is not even: catalog 80%, orders 15%, payments 5%. Catalog is read-heavy, cacheable, and owned by a merchandising-facing team that wants to deploy ranking changes without touching charges. Payments is still tightly bound to orders and still wants a strong consistency story.

**Problem:** catalog load and catalog change rate dominate. **Constraint:** you cannot scale or release catalog without dragging payments. **Decision:** extract catalog only. **Justification:** it is the one capability with demonstrated independent scale, independent cadence, and a boundary you can already point to in the modular monolith.

```mermaid
flowchart TD
  Mono[Monolith] --> Orders
  Mono --> Payments
  CatalogSvc[Catalog Service]
  Mono -.->|extract| CatalogSvc
```

You now have a hybrid. That is not an incomplete migration. It is an architecture that spent complexity where a metric appeared. Orders and payments can stay together until a second metric appears.

Fowler's strategy, in one line: **start with a modular monolith and extract services when there is a demonstrated need.** Almost every successful microservice story he had heard started as a monolith that got too big; almost every system built as microservices from scratch ended in serious trouble. Microservices only work with stable boundaries. Refactoring a package is cheap. Refactoring a service boundary is a migration. That is YAGNI applied to process boundaries — once.

To keep the option of evolving, the monolith needs domains as the primary axis, bounded contexts even inside one process, dependency inversion so a module can later become a process, and boundaries that are enforced — Shopify needed Packwerk because convention was not enough. Do not start with microservices unless the team already runs them. When an extraction is justified, use the **Strangler Fig**: add seams, build the new behavior beside the old, route a slice of traffic, repeat. AWS recommends it; a big-bang rewrite is the last option.

## Wrong reasons, real signals

These are not sufficient reasons to split a process:

- **"It is more modern."** Modern is not a requirement. Operable is.
- **"The CTO asked for microservices."** Ask which metric they want to move.
- **"Netflix uses them."** Netflix also spent years building Eureka, Ribbon, Chaos Monkey, and later a mesh, because instance failure and global streaming were the job. You are probably not on that job.
- **"We are using Kubernetes."** Kubernetes runs monoliths. A scheduler is not an architecture.
- **"We want to learn microservices."** Learn them in a sandbox, not in checkout.
- **"We want different languages."** That is a hiring and platform cost. It is rarely a product requirement.
- **"The monolith is ugly."** Ugliness is a modularity problem. Distribution does not remove ugly. It replicates it.

Fowler called the eagerness _Microservice Envy_. Most systems, in his guideline, should be a single application with real modularity.

> The best architecture is not the one with the most services. It is the one that solves the problem with the least necessary complexity.

## Before you extract another service, ask yourself

1. What metric moves if this is a separate process, and what metric gets worse?
2. Is this a stable bounded context, or a package I have not finished naming?
3. Can I enforce this boundary _inside_ the monolith first?
4. Does a different team own this, and do they already ship on a different clock?
5. Can I follow one user request across the new hop with the observability I have today?
6. What happens when the new service is slow, duplicated, or down — in product terms, not in infrastructure terms?
7. Am I solving scale, or am I solving a release-train argument that a module API would also solve?
8. Who is on-call for the space between the services?
9. If this extraction is wrong, how do I put it back?

If you cannot answer "what problem am I solving, and which architecture solves it with the least necessary complexity?", do not split the process. Draw the boundary. Measure. Then decide.

The correct architecture depends on the problem, not on the fashion.

## Sources

- Martin Fowler, [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)
- Martin Fowler, [Microservice Trade-Offs](https://martinfowler.com/articles/microservice-trade-offs.html)
- Martin Fowler, [Microservice Premium](https://martinfowler.com/bliki/MicroservicePremium.html)
- Martin Fowler, [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)
- James Lewis and Martin Fowler, [Microservices](https://martinfowler.com/articles/microservices.html)
- AWS Well-Architected, [REL03-BP01 Choose how to segment your workload](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_service_architecture_monolith_soa_microservice.html)
- AWS, [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)
- Microsoft Azure Architecture Center, [Microservices architecture style](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)
- Google Cloud Architecture Center, [Patterns for scalable and resilient apps](https://docs.cloud.google.com/architecture/scalable-and-resilient-apps)
- Google Cloud, [GKE and Cloud Run](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/gke-and-cloud-run)
- Netflix Technology Blog, [5 Lessons We've Learned Using AWS](https://netflixtechblog.com/5-lessons-weve-learned-using-aws-1f2a28588e4c)
- Netflix Technology Blog, [Netflix Billing Migration to AWS](https://netflixtechblog.com/netflix-billing-migration-to-aws-451fba085a4)
- Netflix Technology Blog, [Zero Configuration Service Mesh with On-Demand Cluster Discovery](https://netflixtechblog.com/zero-configuration-service-mesh-with-on-demand-cluster-discovery-ac6483b52a51)
- Shopify Engineering, [Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)
- Shopify Engineering, [Under Deconstruction: The State of Shopify's Monolith](https://shopify.engineering/shopify-monolith)
- Werner Vogels, [Monoliths are not dinosaurs](https://www.allthingsdistributed.com/2023/05/monoliths-are-not-dinosaurs.html)
