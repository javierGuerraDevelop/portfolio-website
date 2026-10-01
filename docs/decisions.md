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
