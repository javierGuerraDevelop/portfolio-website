# Frontend analysis — API contract source of truth

Read-only analysis of the merged frontend (`frontend/`, PRs #1–#6). It is the reference
for the backend contract: the frontend is authoritative for API shapes, the backend adapts.

Sources: `frontend/src/types/index.ts`, `frontend/src/hooks/useApi.ts`,
`frontend/src/pages/*`, `frontend/src/components/shared/*`, `frontend/vite.config.ts`.

## Runtime and data access

- The SPA reads `VITE_API_URL` (origin only, no trailing `/api`) and the hook appends the
  endpoint path, e.g. `http://localhost:8080` + `/api/profile`.
- `useApi<T>(endpoint)` performs a GET and returns `{ data: T | null, loading, error, refetch }`:
  1. Sends `Content-Type: application/json` on the GET (this header makes the browser issue
     a CORS preflight when the request is cross-origin).
  2. Throws `HTTP error! status: <n>` when `response.ok` is false — the body is not parsed.
  3. Parses the success envelope; if `success` is `false`, throws `result.error`.
  4. Maps `result.data ?? null` into state.
- `postApi<T, B>(endpoint, body)` performs a POST with a JSON body and returns the parsed
  envelope **without checking `response.ok`**. Callers must inspect `success`/`error`
  themselves; the Contact page does.
- Development serves the SPA at `http://localhost:5173` (or `127.0.0.1:5173`) while fetching
  `VITE_API_URL` directly, so the backend must allow the dev origin via CORS. In production
  nginx serves the SPA and proxies `/api/` same-origin (no CORS involved).

## Page-by-page behavior

| Page | Endpoint(s) | Loading | Error | Empty | Notes |
| --- | --- | --- | --- | --- | --- |
| Home | `GET /api/profile` | ignored | ignored | n/a | Renders hardcoded fallbacks for name/title/bio/email/location; social links fall back to github.com and the LinkedIn profile |
| About | `GET /api/profile` | spinner | message + retry | n/a | Splits `bio` on blank lines; skills/experience/education sections render only when the arrays are non-empty |
| Repos | `GET /api/repos` | skeleton grid | message + retry | "No repositories found" | Client-side search over name/description/topics plus a language filter built from the response; sends **no query parameters**; an empty filtered result shows a "clear filters" state |
| Contact | `GET /api/profile`, `POST /api/contact` | n/a (profile fetch is non-blocking) | shows envelope `error` | n/a | Success replaces the form with "Message Sent!"; failures keep the form and show the message; no PII is logged |
| Parking (hidden route) | `GET /api/parking/guests`, `POST /api/parking/register/:name` | button spinner | raw text/status | n/a | **Raw responses, not the envelope.** Never invoked by tests or dev tooling; the owner verifies manually (D-010) |

## Exact shapes

`frontend/src/types/index.ts` is copied field-for-field into the zod schemas in
`backend/src/schemas/` and `backend/openapi.yaml`:

- `Profile` — `name`, `title`, `email`, `location`, `bio`, `shortBio`,
  `skills[{category, items[]}]`, `socialLinks[{name, url, icon}]`,
  `experience[{company, position, startDate, endDate, description, highlights[]}]`,
  `education[{institution, degree, field, startYear, endYear}]`.
- `Repository` — exactly 19 fields; `description`, `language`, and `homepage` are nullable.
  Pinned order must be preserved; the UI renders the array as-is (after client-side filters).
- `ContactMessage` — `{ name, email, subject, message }`; `subject` may be empty.
- `APIResponse<T>` — `{ success: boolean; message?: string; data?: T; error?: string }`.

## Implications for the backend

- One success envelope and one error envelope; the UI reads `success`, `data`, `error`, and
  (in the future) `message`.
- The optional success `message` is reserved for notices such as "served from cache"; the UI
  does not display it yet (stale-cache notice deferred, see D-012).
- Repos: no query parameters; serve the pinned list in pinned order; serve stale on GitHub
  failure when a cache exists (200 + `message`), otherwise `502`.
- Contact: the UI enforces only `required` fields and an email input type; server-side bounds
  and the honeypot are defined in D-015. On `success: false` the UI displays `error`.
- Health: not used by the UI.
- Parking: excluded from the public contract; see `docs/api.md` → Internal.
