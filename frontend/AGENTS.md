# AGENTS.frontend.md — React + Vite frontend (portfolio site)

React SPA for a software engineer's portfolio site. Pages: Home, About, Repos, Contact. All dynamic data comes from the TypeScript backend; the frontend never talks to GitHub itself.

Scope: frontend only. Repo-wide conventions live in the root `AGENTS.md`; backend rules live in `AGENTS.backend.md`. The API contract between the two is frozen in the backend's `openapi.yaml` — frontend and backend change together through the contract.

## Stack

- React 19.x + TypeScript strict, bundled by Vite 8. Runtime: Node.js 24 LTS. If `package.json` pins older majors, `package.json` wins — note the reason in `docs/decisions.md`.
- Package manager: **pnpm 12** (same as the backend; never `npm`/`yarn`).
- Tests: Vitest 5 + Testing Library. Lint/format: ESLint + Prettier.
- Data access: only through the typed API client in `src/api/`, pointed at `VITE_API_URL` (the backend). Never call the GitHub API from the browser.

## Project Structure

- `src/pages/` — Home, About, Repos, Contact.
- `src/components/` — shared UI; keep components presentation-only where possible.
- `src/hooks/` — data-fetching and form hooks used by pages.
- `src/api/` — typed client (`client.ts`), endpoint wrappers, and response types that mirror the frozen contract.
- `src/main.tsx` / `index.html` — Vite entry point and HTML shell.
- `*.test.tsx` — tests co-located next to the code they cover.
- `vite.config.ts`, `tsconfig.json` — build and type config.
- `.env.example` — template for `VITE_`-prefixed client vars.

## Setup

```bash
pnpm install
cp .env.example .env   # Vite exposes only VITE_* vars; never commit .env
```

Set the backend URL, for example `VITE_API_URL=http://localhost:8080` (origin only; the API hook appends `/api/...`). Start the backend too (see `AGENTS.backend.md`).

## Commands

```bash
pnpm dev               # vite dev server (http://localhost:5173)
pnpm build             # tsc -b && vite build -> dist/
pnpm preview           # serve the production build locally
pnpm test              # vitest run
pnpm test:watch        # vitest in watch mode
pnpm lint              # eslint . --max-warnings=0
pnpm format            # prettier --write .
pnpm typecheck         # tsc --noEmit
```

## Code style

- Always use function components + hooks; class components are not allowed.
- Keep components pure; side effects go in `useEffect` or event handlers.
- Components never call `fetch` directly: server state flows through `src/api/` and `src/hooks/`.
- Keep API response types in `src/api/` only; don't redeclare ad-hoc shapes inside components.
- Handle the backend error envelope consistently. Every data view needs loading, empty, and error states; never silently swallow failures.
- Repos page: render exactly what the backend returns and degrade gracefully when GitHub data is unavailable (the backend may serve stale cache — show a subtle notice, never a blank page).
- Contact form: mirror the backend validation rules and never log submitted personal data to the console or analytics.
- Only `VITE_`-prefixed env vars reach the client, so never put secrets in any env var the bundle can read.

Example — a page component with real states:

```tsx
import { useEffect, useState } from "react";
import { fetchRepos, type Repo } from "../api/repos";

export function ReposList() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load repos"));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (repos === null) return <p>Loading…</p>;
  if (repos.length === 0) return <p>No projects to show yet.</p>;
  return (
    <ul>
      {repos.map((repo) => (
        <li key={repo.name}>
          <a href={repo.url}>{repo.name}</a>
        </li>
      ))}
    </ul>
  );
}
```

## Testing

- Co-locate tests as `*.test.tsx`; query by role/text, not test IDs, when possible.
- Mock the `src/api/` layer or use MSW; tests never hit the real backend or GitHub.
- Cover the Repos page states (loading, data, empty, error) and the Contact form (success, validation failure).
- A change is done when `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass.
- Add a failing test first, then make it pass (TDD).

## Git & PRs

1. Branch from `main`: `git switch -c feat/<short-name>`.
2. Conventional Commits (`feat:`, `fix:`, `chore:`).
3. Before pushing: `pnpm lint && pnpm typecheck && pnpm test`.
4. PR description: one-line summary, plus screenshots for UI changes. Do not include "Files touched" or "How to verify" sections.
5. Never commit to `main` directly, never merge a PR, never force-push, never rewrite shared history.

### Commit attribution (strict)

- Commit messages and PR descriptions contain no AI/model attribution of any kind: no "Generated with ...", no "Made with Claude Code", no model names, no robot emoji, no tool footers.
- Never add a `Co-Authored-By:` trailer for an AI or model. Only add it for a real human collaborator I explicitly named.
- If any tooling inserts an attribution footer, strip it before committing.
- Before every push, verify with `git log origin/main..HEAD --format=%B` and remove any attribution line.
- Do not mention the agent, the model, or this file in commit messages or PR descriptions.

## Boundaries

- Always: edit code under `src/**` and call backends through the typed API client in `src/api/`.
- Always: keep `VITE_API_URL` the only switch needed to point at the backend, and document new env vars in `.env.example`.
- Always: keep response types in sync with the frozen backend contract (`openapi.yaml`); change both sides in the same PR or link the backend PR.
- Always: keep secrets server-side and fix lint failures at the source.
- Always: run `pnpm lint && pnpm typecheck && pnpm test` before pushing.
- Ask first: before adding a runtime dependency or changing `vite.config.ts`, `tsconfig.json`, the router, or other build config.
- Ask first: before changing any expected API shape (coordinate the contract update with the backend first).
- Never: call the GitHub API from the browser or ship an API token in a `VITE_*` var.
- Never: hardcode project/repo data that should come from the API.
- Never: disable ESLint inline to pass CI.
- Never: add AI/model attribution to commits or PRs (see Commit attribution).
- Never: commit secrets, including `.env`.

## More

- Component & state conventions: `docs/architecture.md`.
- API contract: backend `openapi.yaml` and `docs/api.md`.
- Frontend contract analysis: `docs/frontend-analysis.md`.
- Backend conventions: `AGENTS.backend.md`.
