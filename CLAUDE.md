# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Dossier Etudiant" is a **Level 1 vibe-coding template**: a deliberately
minimal skeleton (FastAPI backend + React/Vite/TS/Tailwind frontend) handed
to teenage students starting their first coding project. There is barely
any logic in it yet — the student's job is to describe features in plain
language and have Claude Code build them.

Subdirectories have their own `CLAUDE.md` with role-specific guidance —
read them when working in that half:
- `backend/CLAUDE.md` — FastAPI conventions, structure
- `frontend/CLAUDE.md` — React/Vite/Tailwind conventions, structure

The rules that matter most (repeated from both): the student does not
write code — implement real, working features directly, no `TODO`
placeholders left for a human. Keep scope to exactly what was asked (no
extra auth, DB, pages, or "nice to haves"). Favor the simplest working
implementation over professional-grade abstraction. Keep code comments in
French for the target audience.

## Commands

Run everything together from the repo root:

```bash
./start.sh   # fast local dev: installs deps if needed, runs backend (uvicorn --reload)
             # and frontend (vite) together, Ctrl+C stops both
./stop.sh    # safety net if a server is left running on port 8000/5173 after start.sh
./local.sh   # docker compose up --build — slower, but mirrors the Railway deploy
```

Backend and frontend can also be run independently — see the commands in
their respective `CLAUDE.md`.

## Architecture

Two independently deployed halves that only talk over HTTP:

- **`backend/`** (the "brain") — single-file FastAPI app (`main.py`). Owns
  any secrets/API keys, read via `os.environ`.
- **`frontend/`** (the "face") — React SPA. Never calls the backend by
  absolute URL; it always calls relative `/api/...` paths, and something
  else rewrites those to the real backend:
  - **Local dev** (`start.sh`): Vite's dev server proxy (`vite.config.ts`)
    forwards `/api` → `http://localhost:8000`.
  - **Docker/Railway**: nginx (`frontend/nginx.conf.template`, templated
    with `envsubst` at container start) serves the built static files and
    proxies `/api` → `$BACKEND_URL`.

This is why a working feature always touches both `main.py` (add/modify an
`/api/...` endpoint) and `App.tsx` (call it with `fetch`) — never hardcode
`localhost:8000` in frontend code.

Deployment target is Railway, as **two separate services** from the same
repo, each with its own `railway.toml` and Root Directory (`backend` /
`frontend`); the frontend service needs a `BACKEND_URL` env var pointing
at the deployed backend service.

Secrets: copy `.env.example` → `.env` (root and/or `backend/`); never
touch `.gitignore`'s exclusion of `.env` files.
