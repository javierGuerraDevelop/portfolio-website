# API reference

Frozen contract for the portfolio frontend. Canonical sources:

- `backend/openapi.yaml` — machine-readable contract (public endpoints only).
- `backend/src/schemas/` — zod schemas and inferred TypeScript types (runtime source of truth).
- `docs/frontend-analysis.md` — how the frontend consumes each endpoint.

Changing a frozen shape means updating `openapi.yaml`, the zod schemas, this document, and any
frontend types in the same change, and requires owner sign-off.

Base URLs:

- Production: `https://guerrajavierswe.com` — nginx serves the SPA and proxies `/api/` to the
  backend (same origin, no CORS).
- Local: `http://localhost:8080` — the frontend points at it with `VITE_API_URL`; the backend
  must allow the dev origin via `FRONTEND_ORIGIN`.

JSON only. All public endpoints use the envelopes below.

## Envelopes

Success:

```json
{ "success": true, "message": "optional notice", "data": { } }
```

Error:

```json
{ "success": false, "error": "human-readable message", "message": "optional context" }
```

Status codes: `400` validation, `404` unknown route, `429` rate limit, `502` GitHub upstream
failure with no cached data, `500` unexpected error.

## GET /api/health

Ops probe; unused by the UI.

```json
{ "success": true, "data": { "status": "ok" } }
```

## GET /api/profile

Static typed content module (D-006). Shape: `Profile` —
`name`, `title`, `email`, `location`, `bio`, `shortBio`, `skills[]`, `socialLinks[]`,
`experience[]`, `education[]` (exact fields in `openapi.yaml`).

## GET /api/repos

Pinned repositories of the configured account, in pinned order; no query parameters. The UI
filters client-side.

```json
{ "success": true, "data": [ /* Repository[19 fields] */ ] }
```

When GitHub is unavailable or rate-limited, the API serves a stale cached copy with HTTP 200
and a `message` such as `"Serving cached results; GitHub is currently unavailable"`. When no
cache exists: `502`.

## POST /api/contact

Body:

```json
{ "name": "Jane Doe", "email": "jane@example.com", "subject": "", "message": "Hello!" }
```

Validation (frozen in D-015):

| Field | Rules |
| --- | --- |
| `name` | required, 1–100 chars after trim |
| `email` | required, valid email, ≤ 254 chars |
| `subject` | optional, may be empty, ≤ 150 chars |
| `message` | required, 1–5000 chars after trim |
| `website` | optional honeypot, ≤ 200 chars; when filled the API returns a silent success without sending |

Success: `{ "success": true, "data": null }`. Validation failure: `400` with the error
envelope. Spam protection: `429` with the error envelope.

## Internal

Not part of the public contract (`openapi.yaml`); raw responses, **not** the envelopes.
Implemented last (D-010, Phase 6), exact parity with the Go reference.

### GET /api/parking/guests

`{ "guests": ["Name A", "Name B"] }` — names sorted.

### POST /api/parking/register/:name

Mirrors the upstream HOA status with body
`{ "hoa_status": 200, "hoa_body": "<raw upstream body string>" }`. Unknown guest:
`400 { "error": "unknown guest: <name>" }`.

> **Danger:** registration calls a live third-party service and creates a real parking pass.
> Never invoke it in tests, CI, or local development. The owner verifies manually on the VPS.
