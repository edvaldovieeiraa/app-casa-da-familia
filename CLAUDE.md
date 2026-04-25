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

### Route structure

```
app/
  (auth)/login/          → unauthenticated entry point
  (auth)/magic-link/     → passwordless login
  (auth)/callback/       → Supabase OAuth callback (route handler)
  (app)/layout.tsx       → auth guard + BottomNav + InstallPrompt
  (app)/page.tsx         → Home, module grid
  (app)/imoveis/         → Imóveis module (red #E53935)
  (app)/documentos/      → Documentos module (yellow #F5C842)
  (app)/contatos/        → Contatos module (green #4CAF50)
  (app)/feiras/          → Feiras module (blue #2196F3)
  (app)/contas/          → Contas module (gradient #E53935→#F5C842)
  (app)/familia/         → Família module (purple #9C27B0)
  (app)/pets/            → Pets module (orange #FF6F00)
  (app)/config/          → Settings (dark #1A1A2E)
proxy.ts                 → Supabase session refresh + auth redirect guard
```

All modules are fully implemented. Module metadata (id, label, color, icon, href) lives in `lib/modules.ts` as the `MODULES` array — import `getModule(id)` to look up by id.

### Module pattern

Every module follows the same shape: `hooks/use[Module].ts` for Supabase CRUD (returns `{ data, loading, error }` + mutation fns) → `page.tsx` list → `novo/page.tsx` create → `[id]/page.tsx` details → `[id]/editar/page.tsx` edit → `components/modules/[module]/[Module]Card.tsx` + `[Module]Form.tsx`.

Hooks are always `"use client"` and call `createClient()` from `@/lib/supabase/client`. All writes inject `user_id` from `supabase.auth.getUser()`.

### Tailwind tokens (globals.css)

Module colors are exposed as CSS custom properties via `@theme inline` and usable as Tailwind classes: `bg-imoveis`, `text-documentos`, `bg-contatos`, `bg-feiras`, `bg-config`. Design tokens `--radius-card` (16px), `--radius-button` (12px), `--radius-input` (10px) and `--font-sans` (Nunito) are defined there.

### Supabase auth in Next.js 16

- Server Components / route handlers: `await createClient()` from `@/lib/supabase/server` — internally awaits `cookies()`.
- Client Components: `createClient()` from `@/lib/supabase/client` (no await).
- Session refresh and auth redirect guard live in `proxy.ts` (v16 replacement for `middleware.ts`).

## Skills Disponíveis

Skills oficiais da Anthropic em `skills/`. Referencie conforme a tarefa:

| Skill | Arquivo | Quando usar |
|-------|---------|-------------|
| frontend-design | @skills/frontend-design.md | UI, componentes, layouts, design system |
| canvas-design | @skills/canvas-design.md | Gráficos canvas, visualizações |
| theme-factory | @skills/theme-factory.md | Temas, paletas, tokens de design |
| web-artifacts-builder | @skills/web-artifacts-builder.md | Protótipos HTML/CSS/JS standalone |
| webapp-testing | @skills/webapp-testing.md | Testes de interface e fluxos |
| claude-api | @skills/claude-api.md | Integração com API Claude/Anthropic |
| mcp-builder | @skills/mcp-builder.md | Construção de MCP servers |
| skill-creator | @skills/skill-creator.md | Criar ou melhorar skills |
| pdf | @skills/pdf.md | Geração/leitura de PDFs |
| docx | @skills/docx.md | Documentos Word |
| xlsx | @skills/xlsx.md | Planilhas Excel |
| pptx | @skills/pptx.md | Apresentações PowerPoint |
| doc-coauthoring | @skills/doc-coauthoring.md | Coautoria de documentos |
| algorithmic-art | @skills/algorithmic-art.md | Arte generativa e algoritmos visuais |
| brand-guidelines | @skills/brand-guidelines.md | Diretrizes de marca e identidade visual |
| internal-comms | @skills/internal-comms.md | Comunicações internas |
| slack-gif-creator | @skills/slack-gif-creator.md | GIFs para Slack |
