# Decisions — Portfolio site

Append-only log. Each entry: decision, context, alternatives considered, outcome.
Dates refer to 2026.

## D-001 — Deploy target: EC2 VPS with Docker Compose (2026-09-30)

- **Decision:** Everything runs on a self-hosted AWS EC2 VPS using the existing `docker-compose.yml` + nginx + Let's Encrypt setup. No Lambda.
- **Context:** The repo already ships compose files and an nginx config that proxies `/api/` to `backend:8080`.
- **Alternatives:** AWS Lambda for the whole API; Lambda for the parking endpoint only; managed PaaS (Fly.io / Railway / Render); split frontend/backend hosting.
- **Outcome:** EC2 VPS chosen. Revisit only if operational burden becomes a problem.

## D-002 — Package layout and package manager (2026-09-30)

- **Decision:** Two independent packages in one repo (`frontend/`, `backend/`), pnpm 12 for both, exactly one lockfile per package.
- **Context:** `AGENTS.*` docs mandate pnpm 12; the frontend currently ships `package-lock.json` and npm-based Dockerfiles.
- **Alternatives:** pnpm workspace at the repo root (single lockfile); npm frontend + pnpm backend; npm for both.
- **Outcome:** Frontend migrates to pnpm in Phase 1 slice 2 (lockfile + Dockerfiles). Backend uses pnpm from scaffold.

## D-003 — API base URL env var: keep `VITE_API_URL` (2026-09-30)

- **Decision:** The frontend keeps `VITE_API_URL`; planning/docs wording is updated to match.
- **Context:** Code (`src/hooks/useApi.ts`), `src/vite-env.d.ts`, `vite.config.ts`, and both compose files already use `VITE_API_URL`; the master plan said `VITE_API_BASE_URL`.
- **Alternatives:** Rename the frontend to `VITE_API_BASE_URL`; accept both names with fallback.
- **Outcome:** Zero code churn; the value points at the origin only (the hook appends `/api/...`).

## D-004 — Repos data source: pinned repos via GraphQL (2026-09-30)

- **Decision:** `GET /api/repos` returns the pinned repositories of `javierGuerraDevelop` in pinned order, fetched with GitHub GraphQL.
- **Context:** The Repos page filters client-side and sends no query params.
- **Alternatives:** REST all non-forks ordered by `pushed_at`; REST ordered by stars; different account.
- **Outcome:** GraphQL pinned list; requires `GITHUB_TOKEN` server-side. GraphQL has no ETag, so caching is TTL + serve-stale-on-failure (noted for Phase 2/3).

## D-005 — Contact delivery: Resend (2026-09-30)

- **Decision:** `POST /api/contact` delivers email via Resend.
- **Context:** Needs a provider with a simple API and TypeScript SDK.
- **Alternatives:** SMTP via nodemailer; SendGrid / Postmark / SES; store in a database; log only.
- **Outcome:** Resend; env keys `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. Validation + honeypot + rate limiting still apply.

## D-006 — Profile data: static typed content module (2026-09-30)

- **Decision:** `GET /api/profile` serves a static, typed content module committed in the backend (e.g. `src/content/profile.ts`), validated by zod.
- **Context:** Home, About, and Contact all fetch it; content changes rarely.
- **Alternatives:** SQLite database; env vars + static mix; external CMS.
- **Outcome:** No database. Content updates happen through reviewed PRs.

## D-007 — Version policy for the frontend (2026-09-30)

- **Decision:** Keep the versions pinned by `frontend/package.json` (React 18.3, Vite 7.2, TypeScript 5.9, ESLint 8, Tailwind 3.4) per the "package.json wins" rule; add Vitest 5 + Testing Library in Phase 1 slice 2.
- **Context:** `AGENTS.frontend.md` targets React 19 / Vite 8 for new projects; the provided app pins older majors.
- **Alternatives:** Upgrade everything to doc targets (large, risky, no product value right now).
- **Outcome:** Documented deviation. If Vitest 5 is incompatible with Vite 7, use the nearest compatible version and update this entry.

## D-008 — Public repository: no real personal data in commits (2026-09-30)

- **Decision:** The repository is public; commits contain no real personal data or secrets. `.env` stays gitignored; `.env.example` carries placeholders only.
- **Context:** Deployment config already reads `GITHUB_TOKEN` and parking data from environment variables.
- **Alternatives:** Make the repository private.
- **Outcome:** Keep public; sanitize everything that lands.

## D-009 — Parking Go reference files stay gitignored (2026-09-30)

- **Decision:** `backend/parking_endpoint_go/` is gitignored and stays local-only. It contains real guest names, plates, phone numbers, emails, an address, and a device identifier.
- **Context:** The files are the source for the Phase 6 TypeScript port.
- **Alternatives:** Commit sanitized copies; commit as-is (rejected: public repo, permanent history).
- **Outcome:** Ignored at root and in `backend/.gitignore`; revisit after the port lands.

## D-010 — Parking endpoints: regular Fastify routes, no tests, no Lambda (2026-09-30)

- **Decision:** The parking code is ported to regular Fastify endpoints in the main backend as the last milestone (Phase 6), with exact parity to the Go implementation: same API paths, same HOA endpoint URL, device ID byte-identical, same payload fields, 15s upstream timeout. Guest roster, address, and device ID come from `PARKING_*` env vars; `resident_pin` and `unit_number` are genuinely blank. No automated tests; nothing in dev, tests, or CI may invoke these endpoints.
- **Context:** Parking registration calls a live third-party service and creates a real parking pass. The owner tests it manually.
- **Alternatives:** AWS Lambda handler; tests with a mocked upstream; hardcoding values in source (rejected: public repo + PII).
- **Outcome:** Endpoints live in `backend/src/routes/parking.ts` + `backend/src/services/parking.ts`; a deliberate, documented exception to the TDD rule in `backend/AGENTS.md`.

## D-011 — Commit and PR style: plain Conventional Commits, summary-only PRs (2026-09-30)

- **Decision:** Commit messages and merge messages use plain Conventional Commits with no references to plans, phases, milestones, slices, or "parts". PR descriptions are a one-line summary, plus screenshots when the change affects UI — no "Files touched" or "How to verify" sections. Committed docs still track phases as usual.
- **Context:** PR #1 initially included "Files touched" and "How to verify" sections; the owner removed them manually and set this style for all future work.
- **Alternatives:** Keep the previous PR template (rejected by owner); allow phase/slice references in commit and PR text (rejected).
- **Outcome:** Applies to every commit, merge, and PR from now on; the `AGENTS.md` files were updated to match. No AI/model attribution anywhere.

## D-012 — Frontend cleanup scope: formatting/a11y/cleanup approved, UX proposals deferred (2026-09-30)

- **Decision:** The final frontend cleanup covers Prettier formatting, heading-structure a11y fixes, removal of unused code/asset/dependency, a responsive audit, and committing `nginx.conf`. Two behavior-changing proposals — a stale-cache notice on Repos and an error notice on Home — are deferred. The unused `VITE_GITHUB_USERNAME` config stays as-is.
- **Context:** Every item was listed with evidence and approved selectively by the owner before implementation.
- **Alternatives:** Implement the stale-cache and Home-error notices now (deferred: the backend that would produce the stale `message` does not exist yet); remove the dead `VITE_GITHUB_USERNAME` (skipped: it would also touch both compose files, i.e. deploy config).
- **Outcome:** The UX proposals return in Phase 4 once the backend serves the envelope `message`; Home keeps its fallback-content behavior until then.

## D-013 — API contract: hand-written OpenAPI + zod schemas (2026-09-30)

- **Decision:** The frozen contract consists of `backend/openapi.yaml` (documentation) and zod schemas in `backend/src/schemas/` (runtime source of truth). Shared TypeScript types are inferred from the schemas with `z.infer`; the schemas target zod 4. No code generation.
- **Context:** Four public endpoints with stable shapes; zod is required at request boundaries anyway (`backend/AGENTS.md`). Verified against TypeScript 7 (strict, NodeNext) and a runtime parse smoke in a scratch sandbox.
- **Alternatives:** Generate the OpenAPI document from zod (`zod-to-openapi`); generate zod and client types from `openapi.yaml` (`openapi-typescript`, `openapi-fetch`); JSON Schema as the single source. Rejected: extra toolchain and build steps for a small, rarely changing surface.
- **Outcome:** Contract changes update `openapi.yaml`, the schemas, `docs/api.md`, and frontend types together; Phase 3 adds tests that validate real responses against the schemas.

## D-014 — Parking endpoints excluded from the public OpenAPI document (2026-09-30)

- **Decision:** `backend/openapi.yaml` documents only the public endpoints; the parking endpoints live in `docs/api.md` under "Internal" and keep raw responses instead of the envelope (D-010).
- **Context:** The parking page is a hidden route backed by a live third-party service; the repo is public, but the API surface is not meant for external integration.
- **Alternatives:** Include them in `openapi.yaml` with an `x-internal` marker; keep a separate internal spec file. Rejected: the public contract should describe only the public surface.
- **Outcome:** Phase 6 implements the endpoints; no automated tests; never invoked in dev/test/CI.

## D-015 — Contact validation bounds and honeypot (2026-09-30)

- **Decision:** Server-side validation: `name` 1–100 chars after trim, valid email ≤ 254 chars, `subject` ≤ 150 chars (may be empty), `message` 1–5000 chars after trim, plus an optional `website` honeypot (≤ 200 chars) that returns a silent success when filled; contact requests are rate-limited with `429`.
- **Context:** The frontend form only enforces `required` fields and an email input type; the backend needs explicit bounds for validation, spam resistance, and storage-free delivery (D-005).
- **Alternatives:** Mirror only the browser constraints; stricter caps (for example 1000 chars); CAPTCHA (rejected: third-party friction and privacy cost).
- **Outcome:** Bounds frozen in `openapi.yaml` and `contactRequestSchema`; the frontend may mirror them later, which would be a contract-compatible change.

## D-016 — Backend toolchain: TypeScript 6.0.3, ESLint 10 flat config, zod 4 (2026-09-30)

- **Decision:** The backend uses TypeScript 6.0.3 (strict, NodeNext, ESM with `.js` specifiers), ESLint 10 with a flat config plus `typescript-eslint` 8.71, and zod 4 as already frozen in Phase 2. Fastify stays on 5.x.
- **Context:** `backend/AGENTS.md` mandates TypeScript 7.x but allows 6.x "if a dependency lags behind"; `typescript-eslint` 8.71 peers support `typescript >=4.8.4 <6.1.0`, so TS 7 cannot be linted. Stable 6.0.3 exists. The mandated lint script `eslint . --max-warnings=0` only lints `.ts` files under a flat config, which requires ESLint 9+.
- **Alternatives:** TypeScript 7 with a broken/unsupported lint setup; TypeScript 5.x (violates "never below 6"); ESLint 8 with the same script, which would silently lint nothing; skip `typescript-eslint` (rejected: no type-aware rules).
- **Outcome:** Revisit TypeScript 7 once `typescript-eslint` supports it; the upgrade is otherwise independent of application code.

## D-017 — GitHub cache and rate-limit behavior (2026-09-30)

- **Decision:** Pinned repositories are cached in memory for 10 minutes (`GITHUB_CACHE_TTL_MS`), served stale with the message `Serving cached results; GitHub is currently unavailable` when a refresh fails, and the service blocks upstream calls until `x-ratelimit-reset` after a rate-limit error before returning a typed 429.
- **Context:** D-004 requires TTL + serve-stale because GraphQL has no ETag; recruiters should never see a blank Repos page while a cached copy exists.
- **Alternatives:** No TTL (always hit GitHub); longer/shorter TTLs; retry immediately after a rate-limit error (rejected: burns the remaining budget); no blocking window (rejected: hammering upstream).
- **Outcome:** Covered by unit tests for fresh cache, stale fallback, blocking, 429, and 502; the frontend consumes the stale `message` once its notice ships (D-012).

## D-018 — Contact rate limiting and delivery states (2026-09-30)

- **Decision:** `POST /api/contact` is limited to 5 requests per minute per client, the Resend configuration is all-or-nothing at boot, an unconfigured deployment returns a 500 error envelope for contact requests, and provider failures return 500 `Failed to send the message`. The honeypot returns a silent success.
- **Context:** D-005/D-015 define delivery and validation; the endpoint must resist spam without a captcha and must not break boot for deployments that only serve the public pages.
- **Alternatives:** Global rate limiting (rejected: the other endpoints are cache-backed); requiring Resend keys at boot (rejected: tokenless/local setups could not start); 502 for provider failures (kept 502 reserved for GitHub, D-013).
- **Outcome:** The limit and states are implemented and covered by integration tests.
