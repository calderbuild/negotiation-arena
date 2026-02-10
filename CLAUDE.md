# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

博弈圆桌 (Negotiation Arena) -- Second Me A2A Hackathon project. A user's SecondMe AI agent negotiates against an LLM-powered opponent over 3 rounds, with real-time SSE streaming and structured consensus analysis.

Single-stack Next.js 16 app (TypeScript, React 19, Tailwind CSS v4).

## Commands

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
  -> POST /api/negotiate            (create session, return config)
  -> POST /api/negotiate/{id}/stream (SSE: 3 rounds of messages, then done)
     -> runNegotiation()            (A via SecondMe Chat API, B via DeepSeek LLM)
  -> POST /api/negotiate/summary    (separate request after stream completes)
     -> generateSummary()           (structured JSON consensus analysis)
  -> Frontend renders chat bubbles + result card
```

Summary generation is a separate request from the SSE stream. This avoids Vercel's 60s serverless function timeout -- the stream handles 6 API calls (~40-50s), then the client fires a second request for the summary with its own 60s budget.

### Key Modules (src/lib/)

- **auth.ts** -- SecondMe OAuth2 flow. Login URL generation, code exchange, user info fetch, cookie-based session (base64 JSON, httpOnly, 2h TTL). CSRF via state cookie. SecondMe base URL: `https://app.mindos.com/gate/lab`.
- **negotiation.ts** -- Core engine. `runNegotiation()` orchestrates the 3-round loop with round-aware system prompts. `restoreSession()` handles serverless cross-instance recovery. `generateSummary()` produces structured JSON. In-memory session store uses `globalThis` to survive Turbopack module re-evaluations.
- **secondme.ts** -- SecondMe API client. `chatWithSecondMeOAuth()` for authenticated chat (SSE), `actWithSecondMe()` for structured output, `chatWithInstance()` for public API.
- **llm.ts** -- OpenAI-compatible LLM client for Agent B and summary generation.
- **api.ts** -- Frontend client. Persists session config in `sessionStorage` for serverless recovery, streams via `@microsoft/fetch-event-source`. `fetchNegotiationSummary()` handles the separate summary request.
- **types.ts** -- Shared interfaces: `NegotiationSession`, `NegotiationMessage`, `NegotiationSummary`.

### Serverless Recovery

Vercel serverless functions don't share memory across instances. Session config is persisted client-side in `sessionStorage` and sent as POST body to the stream endpoint, which calls `restoreSession()` to reconstruct if not in memory.

### SSE Protocol

Stream endpoint emits: `session_info`, `status` (thinking), `message` (complete turn), `done`, `error`. Summary is NOT part of the stream -- it's fetched via a separate POST after `done`.

Client uses `@microsoft/fetch-event-source` with retry prevention: `onclose` throws to stop reconnection, `onerror` throws to stop retrying, `finished` flag suppresses error callbacks after `done` event.

### Prompt Engineering

- Positions wrapped in `---BEGIN POSITION---` / `---END POSITION---` to prevent injection
- Round-aware strategy: R1 state position, R2 progressive concession, R3 final proposal with【达成一致】marker
- Each round builds on accumulated multi-turn history per agent
- Agent A (SecondMe): new session per round so `systemPrompt` takes effect; prior history condensed into message text

## API Routes

- `GET /api/auth/login` -- Initiate SecondMe OAuth
- `GET /api/auth/callback` -- OAuth code exchange + set session cookie
- `GET /api/auth/logout` -- Clear session
- `GET /api/auth/me` -- Current user info (JSON)
- `GET /api/instances` -- Proxy for SecondMe instance list
- `POST /api/negotiate` -- Create session (returns ID + config for client-side persistence)
- `POST /api/negotiate/[id]/stream` -- SSE negotiation stream (accepts session config in body for serverless recovery)
- `POST /api/negotiate/summary` -- Generate consensus analysis (separate from stream to avoid 60s timeout)

## Coding Conventions

- TypeScript strict mode. `@/*` path alias for src imports.
- 2-space indent, double quotes, semicolons.
- Components: `PascalCase.tsx`. Lib: `camelCase.ts`.
- Tailwind CSS v4 (PostCSS-based, no tailwind.config file).
- Instance IDs: regex `^[a-zA-Z0-9_-]+$`. Topic max 200 chars, position max 500 chars.

## Deployment

Deployed on Vercel at https://negotiation-table.vercel.app. Use `vercel --prod` to deploy. Environment variables set via `vercel env add` (use `printf` to avoid trailing newlines).

Key constraint: Vercel Hobby plan has 60s max function execution time. Any single API route must complete within 60s.
