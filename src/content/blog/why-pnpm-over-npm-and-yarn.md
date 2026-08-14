---
title: "Why I use pnpm instead of npm or Yarn"
description: "npm copies packages, Yarn Classic hoists them, pnpm hard-links a content-addressable store. Why that model is faster, stricter, and my default."
pubDate: 2026-08-13
tags: [JavaScript, Tooling]
minutes: 4
---

Three clients install the same `package.json`. They do not leave the same `node_modules` on disk, and they do not fail in the same ways. I standardized on pnpm because of how it stores files, how it lays out the tree, and what that prevents.

## What each client actually writes

**npm** (since v3) flattens the tree. Shared packages bubble up to the root of `node_modules`. You save some duplication versus the old nested layout, but the directory is messy, and any package sitting at the root is importable — even if it is not in _your_ `package.json`.

**Yarn Classic** hoists the same way. Yarn Berry takes a different bet: Plug'n'Play and zero-installs, with a `.pnp.cjs` map instead of a traditional tree. That is coherent, but it is also a second runtime for Node and for tooling.

**pnpm** keeps a global **content-addressable store**. Each package version is stored once. Project `node_modules` is mostly **hard links** into that store, plus a small set of **symlinks** so only _direct_ dependencies appear at the root. Same bytes on disk, many projects.

If a new version of a package changes one file out of a hundred, the store adds that one file. It does not clone the other ninety-nine.

## Why installs feel faster

A classic install is resolve, fetch, write. pnpm still resolves, then it **links**. If the tarball is already in the store, there is nothing to download and almost nothing to unpack. The third stage is hard-linking into `node_modules/.pnpm`, not copying megabytes per project.

That is why a warm laptop with several Node repos feels instant, and why a cold CI cache still behaves like npm — there is no magic without a store.

Hard links only work when the store and the project live on the **same volume**. If they do not, pnpm copies, and you lose the disk and speed win. Keep the store on the disk where you clone.

## Phantom dependencies

Hoisted trees leak. `inspectpack` once imported `babel-traverse` without declaring it; npm and Yarn still resolved it because something else had hoisted it. The next install, or a different lockfile, and the import explodes.

pnpm's default layout makes that class of bug loud: if it is not in `package.json`, it is not in the root of `node_modules`, so `require` fails in development instead of in production three months later.

pnpm also refuses to `add` a package without saving it. Extraneous modules are the exception, not the workflow. `pnpm prune` then removes orphans; you do not pass it a shopping list.

## What pnpm still has that I use

Workspaces (`pnpm -r`) are first-class. Peers can auto-install. `pnpm dlx` covers one-shot binaries. The lockfile is `pnpm-lock.yaml`. Overrides, patches, catalogs, and an install-time side-effects cache exist when a monorepo needs them.

You can still flatten if a tool cannot follow symlinks: `nodeLinker: hoisted`. That is an escape hatch, not the default. The default is the strict tree.

## When I would not pick it

Yarn Berry's PnP and zero-installs are a real design if your whole toolchain is on board. npm is already on every machine that has Node. If a generator or a native addon assumes a flat `node_modules` and you cannot patch it, hoist or stay on npm for that repo.

For everything else — this site included — pnpm is the default: less disk, stricter imports, same Node resolution model. `pnpm add` is the command I type.
