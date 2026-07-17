# Prompt Library — Production Technical Specification

**Audience:** Junior engineering team
**Author:** Senior Engineer (zero-to-MVP experience)
**Status:** Draft v1.0 — for team review
**Date:** 2026-07-17

---

## 0. Context & Framing (read this first)

Right now our prompt library is a single-page app that runs **entirely in the browser** and stores everything in `localStorage`. That was the right call for an MVP: zero backend cost, instant load, no accounts. But it has hard ceilings:

- Data lives on **one device**. No team, no sync, no "my teammate's prompt."
- **No backups** beyond manual JSON export.
- **No multi-user** — "teams can use it" is impossible today.
- **No governance** — no ownership, no sharing, no audit.

Moving to "production-ready for teams" is not a refactor — it's a **platform build**. The good news: our data model is tiny and stable (a prompt = title + model + content + isCode + tags + timestamps). That simplicity is our biggest asset. We will not over-engineer this.

This doc gives you my **opinionated** recommendations. Where I say "use X," I mean "start with X; revisit at the scale where it breaks." Below every recommendation I explain the *why* so you can push back with evidence, not vibes.

---

## 1. System Architecture Document

### 1.1 Data Persistence Strategy

**Recommendation: PostgreSQL (managed, e.g. AWS RDS / Neon / Supabase) as the system of record. Firebase / DynamoDB only if we hit a scale problem that Postgres causes — which we won't for years.**

We are evaluating three options. Let's be honest about what each is for:

| Option | Best at | Wrong for us because |
|---|---|---|
| **PostgreSQL** | Relational data, complex queries, transactions, JSONB for flexible fields, mature tooling, cheap to run | Nothing significant. It's the boring, correct default. |
| **DynamoDB** | Massive write throughput at single-digit-ms latency, predictable cost at extreme scale | Forces you to design your access patterns *upfront*; queries are rigid; the "single-table design" learning curve will slow a junior team. Overengineered for our read-heavy, small-record workload. |
| **Firebase (Firestore)** | Fastest path to a backend for a small team, real-time built-in, auth included | Vendor lock-in, query limitations, pricing that surprises you at scale, and we'd be betting the company on Google's product decisions. Good for a hackathon, risky for a product. |

**Why Postgres wins here specifically:**

1. Our core entity is relational: `users` → `teams` → `prompts` → `tags` → `shares`. That's literally what relational DBs are for.
2. We need **transactions** (e.g. "add prompt to team AND log audit event" must be atomic). DynamoDB does this but clumsily; Firestore has limits.
3. Our records are small (a prompt is ~2KB). We will never be I/O-bound on Postgres until we're at millions of users with heavy traffic.
4. **JSONB** gives us schema flexibility for `metadata` without losing relational integrity. We keep the rigid fields (title, model, owner_id) as columns and shove free-form stuff in JSONB.
5. Every junior engineer knows SQL. Every managed provider supports it. Hiring and onboarding cost matters.

**Concrete schema shape (starter):**

```
users(id uuid pk, email, name, created_at)
teams(id uuid pk, name, created_at)
team_members(team_id, user_id, role, pk(team_id,user_id))
prompts(
  id uuid pk,
  team_id uuid fk,
  owner_id uuid fk,
  title text,
  model text,
  content text,
  is_code bool,
  tags text[],
  metadata jsonb,      -- flexible, future-proof
  created_at, updated_at,
  version int          -- for optimistic concurrency / collab
)
prompt_versions(id, prompt_id, content_snapshot, edited_by, created_at)
```

**Managed vs self-host:** Use **managed Postgres** (Neon / Supabase / RDS). Do not run your own Postgres on an EC2 box at this stage — you will spend your life on backups and patching. PgBounner connection pooling comes free-ish with these.

**My call:** Postgres + JSONB. Revisit only if we cross ~5k writes/sec sustained, which our product does not do.

---

### 1.2 Authentication Approach

**Recommendation: Email magic links (passwordless) as primary, OAuth (Google/GitHub) as convenience, and API keys for the programmatic/integration use case. Do NOT roll your own auth.**

Let's separate two distinct things:

1. **Human login** (a person opening the app)
2. **Machine login** (a script, CI job, or integration calling our API)

**For human login:**
- **Magic links** are the best UX for a tool like this: no password to forget, no reset flow, lower support load, and they're inherently phishing-resistant (there's no password to steal). We send a one-time link, they click, they're in.
- **OAuth (Google, GitHub)** is a nice add-on because prompt-library users are technical and already logged into one of those. It reduces friction to first prompt.
- **Avoid plain password auth** as the default — it's a liability (breach risk, reset support, hashing complexity). If we add passwords, do it last and via a battle-tested library.

**For machine login:**
- **API keys** (per-team, scoped, revocable). This is how Zapier, CI pipelines, and our own future webhooks will authenticate. Magic links can't work for a server.

**Implementation:** Use a managed auth provider — **Supabase Auth**, **Auth0**, or **Clerk**. The rule is simple: **never implement auth crypto yourself.** Session management, JWT verification, refresh tokens — these are where teams get owned. Pay the SaaS tax; it's cheaper than a breach.

**My call:** Supabase Auth (gives us Postgres + auth + RLS in one bill). Magic link + Google/GitHub OAuth for humans; scoped API keys for machines.

---

### 1.3 Real-time Collaboration Requirements

**Recommendation: Start with "last-write-wins + soft locks," NOT full CRDT/OT co-editing. Add true real-time only when users actually complain about stepping on each other.**

Be careful here. "Real-time collaboration" sounds like Google Docs live cursors, but that is the **most expensive thing** on this list. For a prompt library, here's what users actually need:

- **See prompts appear when a teammate adds them** (presence / live list refresh).
- **Not lose work when two people edit the same prompt** (conflict handling).
- **Know who changed what** (audit + version history).

That is **not** the same as simultaneous character-by-character co-editing.

**Phased plan:**

- **Phase 1 (MVP):** Polling or lightweight websocket for "list changed" events. Optimistic concurrency via the `version` column — if you save and `version` moved since you loaded, we show "Someone edited this, here's the diff" and let you merge or overwrite. Cheap, robust, good enough for 95% of teams.
- **Phase 2 (if demanded):** WebSocket presence (show "Alex is viewing") + server-pushed invalidation (no polling). Use Supabase Realtime or a small Socket.IO service.
- **Phase 3 (probably never):** True collaborative editing (Yjs CRDT). Only if we become a writing surface, which a *prompt library* is not.

**My call:** Version-column optimistic concurrency now. Do not build CRDT co-editing until a customer hands us money and demands it.

---

### 1.4 Rate Limiting and Abuse Prevention

**Recommendation: Token-bucket rate limiting at the API gateway, per-API-key and per-IP. Add basic abuse heuristics. Treat free tier as hostile by default.**

Prompt libraries are low-risk targets, but "free text input + an API" attracts: spammers seeding SEO junk, scrapers cloning libraries, and people abusing any LLM-proxy features. Defense in layers:

1. **Rate limiting (token bucket):**
   - Authenticated API key: e.g. 1,000 requests/min per key (tunable per plan).
   - Unauthenticated/IP: 60 req/min, strict.
   - Use **Redis** as the counter store (or Cloudflare/AWS WAF if behind them). Don't count in Postgres — that's a write storm.
2. **Payload limits:** Enforce `content` max (e.g. 10KB server-side, not just the 2KB client limit), reject oversized JSON.
3. **Auth abuse:** Magic-link endpoints are a spam vector — rate-limit link generation per-email and per-IP, and use a CAPTCHA/Silent CAPTCHA on the request form.
4. **Quota enforcement:** Per-team prompt counts and storage caps per plan tier (see §3).
5. **Audit logging:** Every mutating action logged (who/what/when) for abuse investigation and compliance.

**My call:** Redis-backed token bucket at the edge + per-plan quotas + audit log. Don't build a ML fraud model — you don't have the volume to need one yet.

---

### 1.5 Search Infrastructure

**Recommendation: PostgreSQL full-text search (tsvector) as the primary search for v1. Add vector embeddings ONLY for "semantic / find similar prompts" as a Phase 2 feature.**

Don't reach for a vector database on day one. Here's the split:

- **Keyword / full-text search** ("find my 'ELI5' prompt", filter by tag `python`): This is **90% of search need**. Postgres `tsvector` + `tsquery` with GIN indexes handles this beautifully, supports ranking, typo-tolerance-ish via trigram (`pg_trgm`), and needs **zero new infrastructure**. Keep it in the same DB.
- **Semantic / vector search** ("show me prompts similar in *meaning* to this one"): This needs embeddings (e.g. `text-embedding-3-small`) stored in a `vector` column (pgvector extension) and ANN search. Genuinely useful for a *prompt library* — "find prompts like this" is a real use case — but it's a **Phase 2 delight**, not a v1 requirement.

**My call:** `pgvector` extension installed from the start (it's just an extension, costs nothing until used), but only wire up semantic search after keyword search ships and we confirm users want "find similar." Don't stand up a separate Pinecone/Weaviate cluster yet.

---

## 2. API Design Specification

### 2.1 RESTful vs GraphQL

**Recommendation: REST (JSON over HTTP) with OpenAPI. Skip GraphQL for v1.**

GraphQL is great when you have many clients with unpredictable, deeply nested read needs (think Facebook's news feed). Our API is the opposite: a small, well-understood set of resources (`prompts`, `teams`, `tags`, `users`).

- **REST pros for us:** Dead-simple caching (HTTP cache, CDN), easy rate limiting per-route, trivial for integrators to use (curl works), great tooling (OpenAPI → SDKs, docs).
- **GraphQL pros:** Flexible queries, no over/under-fetching. But it complicates caching, rate limiting (you must count *query cost*, not requests), and onboarding for a junior team.
- **When GraphQL earns its keep:** If we ship a public integration platform where third parties build arbitrary dashboards. Not now.

**My call:** REST + OpenAPI spec as the source of truth. Generate client SDKs from the spec. Revisit GraphQL at the "public platform" milestone (~100k users), not before.

---

### 2.2 Versioning Strategy

**Recommendation: URL-prefix versioning (`/v1/...`). Date-based or header versioning is cute but worse for debugging and caching.**

- Use **`/v1/prompts`**, `/v2/...` in the path. It's visible in logs, works with any proxy/CDN, and is obvious to integrators.
- **Deprecation policy:** Keep a version live for **minimum 12 months** after a new major version ships. Announce in changelog + email to API-key owners. Return `Deprecation` and `Sunset` headers.
- **Backward-compatible changes** (add a field, add an optional param) do **not** bump the major version. Breaking changes (remove/rename a field, change a type) do.

**My call:** Path versioning, 12-month deprecation window, additive changes never break.

---

### 2.3 Pagination Approach

**Recommendation: Cursor-based (keyset) pagination for list endpoints. Avoid `OFFSET` pagination — it falls over at scale.**

`/v1/prompts?limit=50&cursor=eyJpZCI6Ij...` returns items + `next_cursor`. Why cursors over page numbers:

- `OFFSET 100000` forces the DB to scan and discard 100k rows — gets slower the deeper you page. At 1M users this is a real latency cliff.
- Cursors use an indexed `(created_at, id)` boundary: `WHERE (created_at, id) < (last_seen) ORDER BY created_at DESC, id DESC LIMIT 50`. Constant time, stable even if items are inserted/deleted during paging (no skipping/duplicates like OFFSET has).
- Also support `?sort=updated_at` with a composite cursor on that key.

**My call:** Keyset/cursor pagination everywhere a list can grow. Hard cap `limit` at 100. Never expose raw `OFFSET`.

---

### 2.4 Webhook Events for Integrations

**Recommendation: Async webhooks with signed payloads, retries with exponential backoff, and a self-serve "event subscriptions" UI.**

Teams will want to sync prompts to Slack, Notion, their wiki, CI, etc. Webhooks are how we let them without building each integration.

**Event catalog (v1):**

| Event | Fires when |
|---|---|
| `prompt.created` | A prompt is added to a team |
| `prompt.updated` | Content/metadata changes |
| `prompt.deleted` | Soft or hard delete |
| `prompt.shared` | Shared outside the team |
| `team.member_added` | Invite accepted |

**Delivery design:**
- Payload: `{"event": "...", "prompt_id": "...", "team_id": "...", "occurred_at": "...", "data": {...}}`.
- **Sign every request** with an HMAC-SHA256 signature header (`X-Signature`) so receivers can verify it's us. This is non-negotiable — unsigned webhooks get replayed and spoofed.
- **Retries:** 5 attempts, exponential backoff (1s, 5s, 30s, 2m, 10m). Dead-letter after max attempts; surface failures in dashboard.
- **Idempotency:** Include `event_id`; receivers should dedupe.
- **Async dispatch:** Webhook delivery goes through a **queue** (e.g. SQS / a small worker), never inline in the request — a slow subscriber must not slow our API.

**My call:** Signed, queued, retried webhooks from day one of the "teams" launch. It's the cheapest way to look like an enterprise platform.

---

## 3. Scaling Projections

### 3.1 100 Users → 1M Users: The Path

The discipline that matters: **scale the team and the architecture in steps, not all at once.** Over-provisioning at 100 users is how startups burn cash and add complexity for nobody.

| Stage | Users | What we run | What changes at the next stage |
|---|---|---|---|
| **MVP** | 100 | Single managed Postgres + auth + static frontend on one host/region | — |
| **Early** | 1k–10k | Add Redis (rate limit/cache), CDN for frontend, read replica if needed | Introduce connection pooling, basic monitoring/alerts |
| **Growth** | 10k–100k | Read replicas, background workers for webhooks/embeddings, regional CDN | Introduce caching layer, move heavy jobs off request path |
| **Scale** | 100k–1M | Sharded/multi-tenant partitioning by `team_id`, multi-region read, horizontal API tier | Partitioning, async everything, SLO-based autoscaling |

**Key principles:**
- **Vertical scale first** (bigger managed Postgres) — it's cheaper and simpler than sharding until you genuinely need it (~hundreds of GB + high write QPS).
- **Cache reads** (prompt lists are read-heavy and rarely change — Redis/TTL cache + invalidation on write).
- **Push work off the request path** (webhooks, embeddings, exports → queue + workers).
- **Multi-tenant by `team_id`** from the schema day one, so partitioning later is a migration, not a rewrite.

---

### 3.2 Cost Per User at Different Tiers

*Rough order-of-magnitude, USD/month, managed-cloud pricing as of 2026. Treat as planning ranges, not quotes.*

| Tier | Users | Infrastructure | ~Cost/user/mo | Notes |
|---|---|---|---|---|
| **Free / Dev** | 100 | Shared small Postgres + static hosting | **~$0.05–0.20** | Mostly fixed cost amortized; near-free at this scale |
| **Pro** | 10k | Managed Postgres + Redis + CDN + workers | **~$0.10–0.40** | Economies of scale kick in; cache lowers DB load |
| **Business** | 100k | Replicas + queue + monitoring | **~$0.05–0.20** | Volume discounts; per-team efficiency up |
| **Enterprise** | 1M | Partitioned + multi-region + SLA | **~$0.10–0.50** | Varies wildly with SLA, dedicated infra, support |

**The honest takeaway for juniors:** At low scale, **fixed costs dominate** (you pay for the box whether 1 or 100 users). At high scale, **per-user cost drops** because you've amortized platform investment and caching/partitioning cut marginal DB load. The danger zone is the middle: 10k–100k users where you've outgrown one box but haven't yet optimized. Watch that band carefully.

**Cost levers we control:** cache hit rate, embedding generation frequency (LLM embedding calls cost real money — batch them), storage growth (cap free-tier library size), and egress (CDN + compress JSON).

---

### 3.3 Performance Benchmarks to Maintain

These are our **SLOs** — if we miss them, it's a bug, not a feature.

| Metric | Target (p95) | Why |
|---|---|---|
| API read (`GET /prompts`) | **< 100ms** | List rendering must feel instant |
| API write (`POST /prompts`) | **< 250ms** | Authoring flow shouldn't lag |
| Search query | **< 200ms** | Includes tsquery + ranking |
| Frontend time-to-interactive | **< 1.5s** | Static + CDN; non-negotiable for retention |
| Webhook delivery (first attempt) | **< 5s** | Async; users shouldn't wait on it |
| Auth (magic link → session) | **< 1s** | Login friction = churn |
| Uptime | **99.9%** (3 nines) | Standard for B2B SaaS; 99.95% at Enterprise |

**How we enforce them:**
- **Synthetic monitoring** (Pingdom/Checkly) hitting real endpoints from multiple regions.
- **APMs** (e.g. Sentry/OpenTelemetry) on every request path; alert on p95 regression.
- **Load tests** (k6) in CI at 10x expected peak before any major launch.
- **Budgets:** bundle size budget for frontend; query plan review for any endpoint doing a table scan.

---

## 4. What I'd Build First (MVP Cut Line)

If you take one thing from this doc: **ship the smallest thing that makes "teams" real, then layer.**

1. Managed Postgres + Supabase Auth (magic link + Google/GitHub).
2. `prompts`/`teams`/`team_members` schema with `team_id` multi-tenant key.
3. REST API: CRUD on prompts, cursor pagination, OpenAPI spec.
4. Redis rate limiting + per-plan quotas + audit log.
5. Postgres full-text search (tsvector).
6. Webhooks (signed, queued, retried) for create/update/delete.

**Defer:** vector/semantic search, real-time co-editing, GraphQL, sharding, multi-region. Each has a clear trigger condition (user demand or scale) — not a calendar date.

---

## 5. Open Questions for the Team

- Do we need **soft delete** + retention policy for compliance (GDPR "right to be forgotten")? I lean yes.
- Free tier: cap at **N prompts per team** or **N teams per user**? Pick one; it drives quota code.
- Do we expose the **embedding/semantic search** behind a paid tier to offset LLM embedding cost? Likely yes.

Bring answers to the next planning session. Good spec, now go build the boring 80%.
