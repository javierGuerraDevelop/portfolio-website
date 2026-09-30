# AGENTS.md — Portfolio site

Repo-wide conventions for this monorepo. Package-specific rules live in:

- `frontend/AGENTS.md` — React + Vite SPA (Home, About, Repos, Contact).
- `backend/AGENTS.md` — Fastify + TypeScript API serving the SPA.

## Layout

- `frontend/` — React 18 + TypeScript + Vite 7 + Tailwind CSS.
- `backend/` — Fastify 5 + TypeScript + zod + pino, Vitest 5 (scaffolded in Phase 3).
- `docs/` — `plan.md` (phases and status) and `decisions.md` (decision log).
- Deploy target: AWS EC2 VPS running `docker-compose.yml` (nginx + Node), per `docs/decisions.md` D-001.

## Packages and tooling

- Package manager: pnpm 12 for both packages. One lockfile per package (`frontend/pnpm-lock.yaml`, `backend/pnpm-lock.yaml`). Never use npm or yarn.
- Node.js 24 LTS is the target runtime. Strict TypeScript everywhere.

## Git and PRs

- Branch from `main`: `feat/<short-name>` or `chore/<short-name>`.
- Never commit to `main`, never merge PRs, never force-push, never rewrite shared history.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- One slice per branch; open the PR with `gh`; the owner reviews and merges before the next slice starts.
- PR descriptions: one-line summary, plus screenshots for UI changes. Do not include "Files touched" or "How to verify" sections.

## Commit attribution (strict)

- No AI/model attribution in commits or PR descriptions of any kind: no "Generated with ...", no model names, no robot emoji, no tool footers, no AI `Co-Authored-By:` trailers.
- If tooling inserts an attribution footer, strip it before committing. Before every push, run `git log origin/main..HEAD --format=%B` and remove any attribution line.

## Secrets and private data

- Never commit `.env` or real credentials. `.env.example` is the committed template; only `VITE_*` values may reach the client, and they must never be secrets.
- This repository is public. Real personal data stays out of commits, including the Go parking reference (`backend/parking_endpoint_go/`) and all parking guest data (see `docs/decisions.md` D-008, D-009).

## Internal planning

- `implementation_instructions.md` is local-only, gitignored, and must never appear in git history.

## Safety — parking endpoints

- Parking registration calls a live third-party service and creates a real parking pass. Never invoke it in tests, CI, or local dev. Do not write automated tests for it; the owner verifies manually (see `docs/decisions.md` D-010).

## Docs upkeep

- Update `docs/plan.md` after each task or phase and `docs/decisions.md` for every decision with alternatives.
