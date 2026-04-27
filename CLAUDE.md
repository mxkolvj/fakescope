# FakeScope

Chrome MV3 extension that scores news article credibility using a local LLM (Ollama),
Wayback Machine history, domain reputation, and community votes. Backend in Fastify.

## Layout
- `backend/` — Fastify API. Owners: Igor (analyze + wayback), Paweł (domain + votes + supabase).
- `extension/` — React + Vite MV3 extension. Owner: Oskar.
- `packages/shared/` — TypeScript types shared between backend and extension. Owner: Mikołaj.

## Run

```bash
# 1. Infra
docker compose up -d                 # Redis on :6379
ollama run llama3.1:8b               # warm the model

# 2. Install
pnpm install

# 3. Configure
cp backend/.env.example backend/.env # fill in SUPABASE_URL + SUPABASE_KEY

# 4. Dev
pnpm dev:backend                     # http://localhost:3000
pnpm dev:extension                   # builds extension/dist (load unpacked in Chrome)
```

## API contract
- `POST /analyze` `{ url, title, text }` → `AnalyzeResponse` (see `packages/shared`)
- `GET /domain?url=…` → `{ domain_score, flags[] }`
- `GET /votes?url=…` → `{ up, down }`
- `POST /votes` `{ url, vote: 1 | -1, voter_id }` → `{ ok: true }`

## Score formula
`final = llm*0.5 + domain*0.25 + wayback*0.15 + community*0.1` — clamped 0–100.

## Conventions
- TypeScript strict mode everywhere.
- All cross-boundary types live in `packages/shared`.
- Services must never throw — return a typed fallback so `/analyze` always responds.
- Cache `/analyze` results in Redis for 1h, keyed by SHA-256 of the URL.
