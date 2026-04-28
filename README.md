# FakeScope

## Czym jest FakeScope?

Wtyczka do Chromium która sprawdza wiarygodność artykułów na podstawie lokalnie postawionego LLM'a, ale też opinii użytkowników. Istnieje także funkcja cache'owania pobranych już wyników aby przyspieszyć działanie wtyczki.

## Tech Stack

**Frontend**: React.js + Vite (TypeScript), Tailwind CSS

**Backend**: Node.js + Fastify (TypeScript), Handmade Redis Mockup (caching), SupaBase (SQL)

**LLM**: Ollama na serwerze domowym Pawełka<3, model3.2

**Zewnętrzne API**: URLhaus (keyless) do walidacji wiarygodności URLi

## API Contract

Wszystkie endpointy zwracają JSON. Backend działa na `http://localhost:3000`.

---

### `POST /analyze`

Analizuje artykuł i zwraca score wiarygodności. Wynik jest cache'owany w Redis przez 1h (klucz: SHA-256 z URL).

**Rate limit:** 5 req / minutę

**Request body:**
```json
{
  "url": "https://example.com/article",   // wymagane
  "force": false                           // opcjonalne — pomija cache
}
```

**Response:**
```json
{
  "url": "https://example.com/article",
  "final_score": 72,          // 0–100, wyważona agregacja
  "cached": false,
  "generated_at": "2026-04-28T12:00:00.000Z",
  "llm": {
    "score": 80,
    "verdict": "Probably credible",
    "red_flags": ["sensational_headline"],
    "positive_signals": ["cites_sources"],
    "summary": "..."
  },
  "domain": {
    "domain": "example.com",
    "domain_score": 90,
    "flags": []              // np. "no_https", "suspicious_tld:xyz", "urlhaus_listed"
  },
  "community": {
    "up": 12,
    "down": 3,
    "community_score": 80    // null gdy brak głosów
  }
}
```

**Wzór score:** `final = llm×0.6 + domain×0.25 + community×0.15` (bez głosów: `llm×0.7 + domain×0.3`)

---

### `GET /domain?url=<url>`

Sprawdza domenę pod kątem HTTPS, TLD, wieku i URLhaus.

**Response:**
```json
{
  "domain": "example.com",
  "domain_score": 75,
  "flags": ["young_domain:3mo"]
}
```

Możliwe flagi: `no_https`, `suspicious_tld:<tld>`, `young_domain:<n>mo`, `unknown_age`, `urlhaus_listed`, `invalid_url`

---

### `GET /votes?url=<url>`

Zwraca aktualny wynik głosowania dla artykułu.

**Response:**
```json
{ "up": 12, "down": 3 }
```

---

### `POST /votes`

Oddaje głos (lub aktualizuje istniejący). Unikalność głosu opiera się na zahashowanym IP + User-Agent.

**Request body:**
```json
{ "url": "https://example.com/article", "vote": 1 }
```

`vote`: `1` (za) lub `-1` (przeciw)

**Response:**
```json
{ "ok": true }
```

## Team

**@mxkolvj (Full Stack)**: setup repo, iterowanie promptu do LLM'a, końcowe integracje, README

**@oskarkrzysztofek (Frontend)**: cały katalog /extension, vite config, extension UI

**@Igorzysko1 (Backend)**: endpoint /analyze i /votes, poprawne liczenie final score

**@niejajestem (Backend)**: setup LLM'a, debugowanie backendu razem z Igorem
