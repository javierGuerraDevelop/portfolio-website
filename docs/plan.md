# Plan — Portfolio site (React frontend + TypeScript backend)

Working plan for the repo. Status legend: ✅ done · ▶ in progress · ☐ pending.
Last updated: 2026-09-30.

## Phase 0 — Discovery and plan ✅ (approved 2026-09-30)

- Frontend inventory completed with the explore pass (framework, router, package manager, API calls, env config, build tooling).
- Clarifying questions answered; decisions recorded in `decisions.md` (D-001 … D-010).
- Confirmed conventions: EC2 VPS + Docker Compose; pnpm 12 for both packages; `VITE_API_URL`; pinned repos via GraphQL; Resend for contact; static profile content; parking as regular backend endpoints.

### Contract summary (frontend is authoritative; formalized in Phase 2)

- Envelope for all normal endpoints: `{ success: boolean; message?: string; data?: T; error?: string }`.
- `GET /api/profile` → `Profile` (name, title, email, location, bio, shortBio, skills[], socialLinks[], experience[], education[]).
- `GET /api/repos` → `Repository[]` (pinned order; 19 fields exactly as in `frontend/src/types/index.ts`).
- `POST /api/contact` → `null`; body `{ name, email, subject, message }`.
- `GET /api/health` → ops probe (unused by the UI).
- Parking (Phase 6, raw responses, not the envelope): `GET /api/parking/guests` → `{ guests: string[] }`; `POST /api/parking/register/:name` → `{ hoa_status: number, hoa_body: string }`.

## Phase 1 — Repo hygiene and landing the frontend as PRs ✅

Slices (one branch/PR at a time; owner merges before the next starts):

1. ✅ `chore/repo-hygiene` — `.gitignore` (root + packages), root `AGENTS.md`, seed `docs/`, commit existing AGENTS/compose/prettier files. No app code. Merged (PR #1).
2. ✅ `chore/frontend-tooling` — pnpm migration, ESLint, Vitest + Testing Library, scripts (`test`, `test:watch`, `typecheck`, `format`), `.env.example`. `src/` untouched. Merged (PR #2).
3. ✅ `feat/app-shell-home` — Vite shell, layout, UI kit, hooks/types, Home page + smoke test. Merged (PR #3).
4. ✅ `feat/about-contact` — About + Contact pages, Contact form tests. Merged (PR #4).
5. ✅ `feat/repos-parking` — Repos + RepoCard + hidden ParkingPage; Repos state tests. Parking page lands unchanged; no parking API invocation anywhere. Merged (PR #5).
6. ✅ `chore/polish` *(approved subset)* — Prettier sweep, heading a11y fixes, unused code/asset/dependency removal, responsive audit, `nginx.conf`. Merged (PR #6). Deferred: stale-cache notice, Home error notice, `VITE_GITHUB_USERNAME` cleanup (D-012).

Definition of done: frontend fully tracked via merged PRs; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green in `frontend/`; `implementation_instructions.md` and `backend/parking_endpoint_go/` never staged; no attribution in any commit or PR. ✅ Met.

## Phase 2 — Freeze the API contract ✅

- `openapi.yaml` in the backend package; zod schemas + shared TypeScript types as the single source of truth.
- One success envelope and one error envelope; statuses 400 (validation), 404 (not found), 429 (rate limit), 502 (GitHub upstream failure).
- `docs/frontend-analysis.md`, `docs/api.md` skeleton.

Definition of done: owner signs off; contract frozen; later changes update contract docs first and require sign-off. ✅ Met.

## Phase 3 — Backend implementation ▶

- Fastify 5 scaffold with scripts exactly per `backend/AGENTS.md`; `src/lib/env.ts` + `.env.example` (fail fast, no real values committed).
- `GET /api/health`; GitHub service (pinned repos via GraphQL, in-memory TTL cache, serve stale on failure, rate-limit handling, fixtures for tokenless dev/tests); `GET /api/repos`; `GET /api/profile` (static typed content module); `POST /api/contact` (zod, honeypot, rate limiting, Resend).
- Cross-cutting: CORS allowlist, security headers, pino request logging, graceful shutdown.
- Tests: unit + integration (`app.inject()`), explicit rate-limit and stale-cache tests.

Definition of done: `pnpm lint && pnpm typecheck && pnpm test` green; STOP with evidence.

## Phase 4 — Integration and end-to-end verification ☐

- Point the frontend at the backend using only `VITE_API_URL`; no other frontend change without owner approval.
- Page-by-page checklist with screenshots (Home, About, Repos incl. loading/empty/error, Contact success + validation).
- Verify no token or secret in API responses, network payloads, logs, or the built `dist/`.
- Document exact local run steps (frontend + backend, env vars) in the README.

Definition of done: all four pages work end-to-end against the local backend; screenshots captured.

## Phase 5 — CI, docs, handoff ☐

- GitHub Actions per package: typecheck, lint, test, build on every PR.
- README: <10-minute setup, env var table, API docs link, EC2 deploy instructions, how the frontend talks to the backend.
- Mark phases complete here; update `AGENTS.*.md` if commands or structure changed.

Definition of done: CI green; a new developer can run everything in under 10 minutes.

## Phase 6 — Parking endpoints (TypeScript port), last milestone ☐

- Port `backend/parking_endpoint_go/` to `backend/src/services/parking.ts` + `backend/src/routes/parking.ts`; wire into `buildApp()`.
- Exact parity: API paths, HOA endpoint URL, device ID byte-identical, payload fields, 15s upstream timeout, `{ guests: string[] }` sorted, `{ hoa_status, hoa_body }` with mirrored upstream status, 400 for unknown guest.
- Runtime values (guest roster, address, device ID) from `PARKING_*` env vars; `resident_pin` and `unit_number` stay blank as provided; `.env.example` holds placeholders only.
- No automated tests, no invocation in dev/CI (live calls create a real parking pass); owner verifies manually on the VPS.
- Go reference files stay gitignored.

Definition of done: typecheck/lint/build green; owner confirms the parking pass flow manually.

## Open items / risks

- `ALLOWED_ORIGINS` (compose) vs `FRONTEND_ORIGIN` (`backend/AGENTS.md`) naming — resolve in Phase 2/3; proposal: align compose to `FRONTEND_ORIGIN` with a comma-separated list, with owner approval.
- Stale-cache notice UI does not exist in the frontend; backend will carry an optional `message`; small frontend change proposed in Phase 4 (owner approval required).
- Home ignores fetch errors; Contact checks the envelope but not HTTP status; GET errors render generic status text. Contract accommodates this; no frontend changes planned.
- Parking endpoints will be publicly reachable once deployed (the hidden route is visible in the public repo); hardening options to be considered at Phase 6 — owner decision.
- Vitest 5 compatibility with Vite 7 to be verified in slice 2; fall back to the nearest compatible version and record it in `decisions.md`.
- Root `.env` holds a live-looking `GITHUB_TOKEN`; it is gitignored and must stay so; consider rotating after the GitHub integration is verified.
