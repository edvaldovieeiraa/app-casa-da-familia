# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint (uses `eslint` directly, not `next lint`)
```

No test runner is configured yet.

## Stack Versions — Breaking Changes Apply

- **Next.js 16.2.4** + **React 19.2.4** — read `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` before writing any route, layout, or middleware code
- **Tailwind CSS v4** — configured via `@theme` blocks in CSS (`globals.css`), not `tailwind.config.ts`; uses `@import "tailwindcss"` and the `@tailwindcss/postcss` PostCSS plugin
- **@supabase/ssr ^0.10** — use `createBrowserClient` / `createServerClient` from this package

### Critical Next.js 16 differences from training data

- `cookies()`, `headers()`, `draftMode()` are **fully async** — synchronous access is removed. Always `await` them.
- Route segment `params` in `layout.tsx`, `page.tsx`, `route.ts` etc. are **Promises** — destructure after `await params`.
- `middleware.ts` is **deprecated** — renamed to `proxy.ts`. The `proxy` runtime is Node.js only; use `middleware.ts` if you need `edge` runtime.
- `revalidateTag` now requires a second `cacheLife` argument; single-argument form is deprecated.

### Critical Tailwind v4 differences from training data

- No `tailwind.config.ts` for theme customization — define tokens inside `@theme { }` in `globals.css`
- Directives `@tailwind base/components/utilities` are gone; replaced by `@import "tailwindcss"`
- Custom colors, fonts, spacing go in `@theme inline { --color-*: ...; --font-*: ...; }` blocks

## Architecture

The app is a mobile-first PWA for family management. See `C:\VibeCoding\CLAUDE.md` (parent workspace file, always in context) for the full design system, module colors, UX rules, database schema, and folder conventions.

### Route structure (planned, not yet built)

```
app/
  (auth)/login/          → unauthenticated entry point
  (auth)/magic-link/     → passwordless login
  (auth)/callback/       → Supabase OAuth callback (route handler)
  (app)/layout.tsx       → auth guard + BottomNav
  (app)/page.tsx         → Home, module grid
  (app)/imoveis/         → Imóveis module (red #E53935)
  (app)/documentos/      → Documentos module (yellow #F5C842)
  (app)/contatos/        → Contatos module (green #4CAF50)
  (app)/feiras/          → Feiras module (blue #2196F3)
  (app)/contas/          → Contas module (gradient)
  (app)/config/          → Settings (dark #1A1A2E)
proxy.ts                 → Supabase session refresh (replaces middleware.ts in v16)
```

### Module pattern

Every module follows the same shape: `hooks/use[Module].ts` for Supabase CRUD → `page.tsx` list → `novo/page.tsx` create → `[id]/page.tsx` details → `[id]/editar/page.tsx` edit → `components/modules/[module]/[Module]Card.tsx` + `[Module]Form.tsx`.

### Supabase auth in Next.js 16

Use `@supabase/ssr` with `createServerClient` in Server Components and route handlers (cookies must be awaited first). Use `createBrowserClient` in Client Components. Session refresh belongs in `proxy.ts` (the v16 replacement for `middleware.ts`).
