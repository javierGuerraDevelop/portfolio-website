# AGENTS.backend.md — TypeScript + Node.js backend (portfolio site)

Backend for a software engineer's portfolio site. It serves the Home, About, Repos, and Contact pages. The frontend is the source of truth for API shapes: this backend adapts to it, never the reverse.

Scope: backend only. Repo-wide conventions live in the root `AGENTS.md`; frontend work follows the frontend's own rules.

## Stack

- Node.js 24 LTS, TypeScript 7.x (strict). Use 6.x only if a dependency lags behind; never below.
- Package manager: **pnpm 12** (use `pnpm`, never `npm`/`yarn`).
- HTTP framework: **Fastify 5** (stay on 5.x; 6.x is alpha).
- Validation: **zod** at every request boundary and for shared response types.
- GitHub data: Octokit (`@octokit/graphql` for pinned repos, `@octokit/rest` otherwise). Server-side only.
- Contact delivery: email/SMTP provider SDK chosen in Phase 0; isolate it behind `src/services/contact.ts`.
- Cache: in-memory TTL + ETag (GitHub responses). No external cache unless asked.
- Test runner: Vitest 5. Lint/format: ESLint + Prettier. Logging: pino (Fastify default).

## Setup

```bash
pnpm install           # install deps
cp .env.example .env   # local config; never commit .env
```

## Commands

Run these from the backend package root. Agents may execute them, so they must work as-is.

```bash
pnpm dev              # Fastify dev server with watch (tsx watch src/server.ts)
pnpm build            # tsc -p tsconfig.json, emits to dist/
pnpm start            # run the built server (node dist/server.js)
pnpm test             # vitest run (all tests, once)
pnpm test:watch       # vitest in watch mode
pnpm test:integration # vitest run test/integration (uses app.inject(), mocks upstream)
pnpm lint             # eslint . --max-warnings=0
pnpm format           # prettier --write .
pnpm typecheck        # tsc --noEmit
```

Verify a single file fast: `pnpm vitest run src/services/github.test.ts`.

## Project structure

- `src/server.ts` — entrypoint; binds the port.
- `src/app.ts` — `buildApp()`: registers plugins, error handler, and routes; exported so tests can use `app.inject()`.
- `src/routes/` — `health.ts`, `repos.ts`, `contact.ts` (plus `content.ts` only for Home/About data the frontend actually fetches dynamically).
- `src/services/` — `github.ts` (fetch, cache, normalize), `contact.ts` (delivery).
- `src/schemas/` — zod schemas and shared API types; single source of truth for response shapes.
- `src/lib/` — `env.ts` (validated config), `errors.ts` (error envelope), `cache.ts` (TTL store).
- `fixtures/` — seeded GitHub payloads for tokenless dev and tests.
- `openapi.yaml` — frozen contract that the frontend integrates against.
- `docs/` — `frontend-analysis.md`, `decisions.md`, `api.md`, `architecture.md`.
- `dist/` — `tsc` build output (generated; do not edit).

## API contract rules (frontend is authoritative)

- Before changing any endpoint, read `docs/frontend-analysis.md` and `docs/decisions.md`. Match the shapes the frontend expects exactly.
- Update zod schemas, `openapi.yaml`, and `docs/api.md` in the same commit as the route change.
- One error envelope for every failure, with status codes for 400 (validation), 404 (not found), 429 (rate limit), and 502 (GitHub upstream failure). Never return raw upstream errors.
- Never expose `GITHUB_TOKEN`, provider keys, or stack traces in responses.
- CORS allowlist from `FRONTEND_ORIGIN`; no `*` in production.
- The frontend must run against this backend by changing only its API base URL; document that exact command in the README.
- Serve everything under `/api`, JSON only.

## Code style

- Strict TypeScript: no `any`, no non-null `!` unless justified in a comment.
- Prefer named exports; one public concept per file.
- Validate external input with zod at the boundary, then trust types inward.
- Route handlers stay thin (validate → call service → serialize). Business logic lives in `src/services/`.
- Only `src/services/github.ts` may talk to GitHub. Routes, tests, and the frontend never call the GitHub API directly.
- Never hardcode secrets, usernames, or origins; read them from `src/lib/env.ts`.

Example — a validated, thin Fastify route:

```ts
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { listRepos } from "../services/github.js";

const Query = z.object({
  language: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function reposRoutes(app: FastifyInstance) {
  app.get("/api/repos", async (request) => {
    const { language, limit } = Query.parse(request.query);
    return listRepos({ language, limit });
  });
}
```

## Testing

- Co-locate tests as `*.test.ts` next to the code they cover; HTTP-level tests live in `test/integration/` and use `app.inject()`.
- Mock GitHub with fixtures or MSW. Unit tests never hit the live GitHub API.
- A change is done when `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass, and PR CI is green.
- Add a failing test first, then make it pass (TDD).
- Rate-limit handling and stale-cache behavior get explicit tests — they protect the Repos page from breaking for recruiters.

## Git & PRs

1. Branch from `main`: `git switch -c feat/<short-name>`.
2. Keep commits small; use Conventional Commits (`feat:`, `fix:`, `chore:`).
3. Before pushing, run `pnpm lint && pnpm typecheck && pnpm test`.
4. Open a PR with a one-line summary, the test command you ran, and the phase from `docs/plan.md` it belongs to.
5. Never commit to `main` directly, never merge a PR, never force-push, never rewrite shared history.

### Commit attribution (strict)

- Commit messages and PR descriptions contain no AI/model attribution of any kind: no "Generated with ...", no "Made with Claude Code", no model names, no robot emoji, no tool footers.
- Never add a `Co-Authored-By:` trailer for an AI or model. Only add it for a real human collaborator I explicitly named.
- If any tooling inserts an attribution footer, strip it before committing.
- Before every push, verify with `git log origin/main..HEAD --format=%B` and remove any attribution line.
- Do not mention the agent, the model, or this file in commit messages or PR descriptions.

## Boundaries

- Always: edit `src/**` and its co-located `*.test.ts` files freely.
- Always: read `.env.example` to learn required config keys.
- Always: keep `openapi.yaml`, zod schemas, and `docs/api.md` in sync with behavior.
- Always: add a new migration when changing the DB schema (only applies once/if a DB is added for contact storage).
- Always: fix the root cause of lint/type errors instead of suppressing them.
- Ask first: changing `package.json` deps, CI workflows, deploy config, or anything under `infra/`.
- Ask first: any change to frontend files (API base URL wiring only, minimal).
- Ask first: editing `tsconfig.json` compiler options or build output paths.
- Never: commit secrets, `.env`, or real credentials.
- Never: log, return, or embed `GITHUB_TOKEN` or provider API keys.
- Never: break a frozen API shape without updating the contract docs and getting sign-off.
- Never: silence errors with broad `// eslint-disable` or `// @ts-ignore` to pass CI.
- Never: add AI/model attribution to commits or PRs (see Commit attribution).

## More

- Frontend contract: `docs/frontend-analysis.md`.
- Decisions log: `docs/decisions.md`.
- API reference: `docs/api.md` and `openapi.yaml`.
- Architecture & conventions: `docs/architecture.md`.
