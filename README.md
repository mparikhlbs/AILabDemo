# Job Description Quiz App

A local-first full-stack web app that generates 5-question MCQ quizzes from pasted job descriptions and lets users review results and history.

## Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Express + NeDB (`nedb-promises`) + JWT + bcrypt
- AI integration: Anthropic Claude Messages API

## Project Structure

- `client/` React app
- `server/` Express API

## Backend Setup

1. `cd server`
2. Install dependencies (`npm install` in your local environment)
3. Copy `.env.example` to `.env` and fill values:
   - `CLAUDE_API_KEY`
   - `JWT_SECRET`
   - `PORT` (default `3001`)
   - `CLIENT_ORIGIN` (default `http://localhost:5173`)
4. Start API: `npm run dev`
5. Optional for persistent local DB path: set `DATA_DIR` (defaults to `./data`)

## Frontend Setup

1. `cd client`
2. Install dependencies (`npm install`)
3. Start frontend: `npm run dev`

The Vite dev server proxies `/api` to `http://localhost:3001`.

## Implemented Features

- Signup/login/logout with JWT auth
- Password reset via security question
- Protected quiz and history routes
- Quiz generation endpoint with Claude retry + schema validation
- Quiz taking flow with submit-on-complete behavior
- Results page with correct/wrong explanations and learning summary
- History and per-quiz review pages
- Global error toasts, loading states, and empty states
- Security basics: `helmet`, CORS, input sanitization, route protection, rate limits

## Notes

- Server persists data in local NeDB files under `server/data/` by default (or `DATA_DIR` if set).
- Quiz generation requires a valid Anthropic API key.
- In this environment, package installation/runtime verification was not possible because `npm` was unavailable on PATH.
