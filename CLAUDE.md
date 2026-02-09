# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

博弈圆桌 (Negotiation Arena) -- Second Me A2A Hackathon project. A user's SecondMe AI agent negotiates against an LLM-powered opponent over 3 rounds, with real-time SSE streaming and structured consensus analysis.

Single-stack Next.js 16 app (TypeScript, React 19, Tailwind CSS v4) in `negotiation-table/`.

## Commands

All commands run from `negotiation-table/`:

```bash
npm install          # install dependencies
npm run dev          # dev server at localhost:3000
npm run build        # production build
npm run start        # run production build
npm run lint         # ESLint -- run before every commit
```

No test framework. `npm run lint` is the validation gate.

## Environment

Copy `.env.example` to `.env.local`:
- `SECONDME_CLIENT_ID` / `SECONDME_CLIENT_SECRET` (required) -- SecondMe OAuth credentials
- `LLM_API_KEY` (required) -- API key for DeepSeek LLM
- `LLM_BASE_URL` (optional, default: `https://newapi.deepwisdom.ai/v1`)
- `LLM_MODEL` (optional, default: `deepseek-chat`)

## Architecture

### Data Flow

```
Homepage (/) -> OAuth login -> /negotiate/new (setup form)
  -> POST /api/negotiate        (create session, return config)
  -> POST /api/negotiate/{id}/stream  (SSE stream with session config in body)
     -> runNegotiation()        (3 rounds: A via SecondMe Chat API, B via DeepSeek LLM)
     -> generateSummary()       (structured JSON consensus analysis)
  -> Frontend renders chat bubbles + result card via SSE callbacks
```

### Key Modules (src/lib/)

- **auth.ts** -- SecondMe OAuth2 flow. Login URL generation, code exchange, user info fetch, cookie-based session (base64 JSON, httpOnly, 2h TTL). CSRF via state cookie.
- **negotiation.ts** -- Core engine. `runNegotiation()` orchestrates the 3-round loop with round-aware system prompts (Observe-Explore-Plan from NeurIPS 2024 LLM-Deliberation). `restoreSession()` handles serverless cross-instance recovery. `generateSummary()` produces structured JSON.
- **secondme.ts** -- SecondMe API client. `chatWithSecondMeOAuth()` for authenticated chat (SSE), `actWithSecondMe()` for structured output, `chatWithInstance()` for public API.
- **llm.ts** -- OpenAI-compatible LLM client for Agent B and summary generation.
- **api.ts** -- Frontend client. Persists session config in `sessionStorage` for serverless recovery, streams via `@microsoft/fetch-event-source`.
- **types.ts** -- Shared interfaces: `NegotiationSession`, `NegotiationMessage`, `NegotiationSummary`.

### Serverless Recovery

Vercel serverless functions don't share memory across instances. Session config is persisted client-side in `sessionStorage` and sent as POST body to the stream endpoint, which calls `restoreSession()` to reconstruct if not in memory.

### SSE Protocol

Server emits: `session_info`, `status` (thinking), `message` (turn), `summary` (JSON), `done`, `error`. Client uses `@microsoft/fetch-event-source` with retry prevention (`onclose` throws, `onerror` throws, `finished` flag suppresses errors after `done`).

### Prompt Engineering

- Positions wrapped in `---BEGIN POSITION---` / `---END POSITION---` to prevent injection
- Round-aware strategy: R1 state position, R2 progressive concession, R3 final proposal with【达成一致】marker
- Each round builds on accumulated multi-turn history per agent

## API Routes

- `GET /api/auth/login` -- Initiate SecondMe OAuth
- `GET /api/auth/callback` -- OAuth code exchange + set session cookie
- `GET /api/auth/logout` -- Clear session
- `GET /api/auth/me` -- Current user info (JSON)
- `GET /api/instances` -- Proxy for SecondMe instance list
- `POST /api/negotiate` -- Create session (returns ID + config)
- `POST /api/negotiate/[id]/stream` -- SSE negotiation stream (accepts session config in body)

## Coding Conventions

- TypeScript strict mode. `@/*` path alias for src imports.
- 2-space indent, double quotes, semicolons.
- Components: `PascalCase.tsx`. Lib: `camelCase.ts`.
- Instance IDs: regex `^[a-zA-Z0-9_-]+$`. Topic max 200 chars, position max 500 chars.

## Deployment

Deployed on Vercel at https://negotiation-table.vercel.app. Use `vercel --prod` to deploy. Environment variables set via `vercel env add` (use `printf` to avoid trailing newlines).
