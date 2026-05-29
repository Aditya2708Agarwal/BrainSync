# BrainSync — Study Room App

A lightweight study-room app for focused sessions, realtime chat, and activity tracking.

Core principles: keep it simple, private by default, and focused on functionality rather than bells.

## Features
- Authentication (signup / login)
- Study room management (create, join, invite)
- Session timer (start / pause / end)
- Room chat (live messages)
- Realtime room updates (Socket.IO)
- Activity dashboard (recent joins, leaves, sessions)

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Realtime: Socket.IO
- Styling: Tailwind CSS

## Repo layout

- `client/` — Vite + React app (UI, pages, components)
- `server/` — Express API, Socket.IO, models, controllers

## Quick start (development)

1. Clone the repo:

```bash
git clone <your-repo-url>
cd study room proj
```

2. Prepare environment files

Copy example env files and fill values (do NOT commit real secrets):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Typical server env variables (placeholders in `server/.env.example`):

- `PORT` — port for the API (e.g. 4000)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing auth tokens
- `CLIENT_URL` — allowed origin for CORS / socket connections

Typical client env variables (placeholders in `client/.env.example`):

- `VITE_API_URL` — base URL for API requests (e.g. http://localhost:4000)

3. Install dependencies

Open two terminals.

Terminal 1 — server:

```bash
cd server
npm install
# or: yarn
npm run dev  # or npm start
```

Terminal 2 — client:

```bash
cd client
npm install
npm run dev
```

Open the client app at the address Vite prints (usually http://localhost:5173) and the API at the server `PORT`.

## Running both with a single command (optional)

If you prefer a single terminal, use a process manager such as `concurrently`:

```bash
# from repo root
npm install -g concurrently
concurrently "npm --prefix server run dev" "npm --prefix client run dev"
```

## Environment & Secrets

- Keep real secrets out of the repo. Add `.env` to `.gitignore` (already included).
- Store only templates or examples in `*.example` files.
- If a secret was accidentally committed, rotate it immediately and remove the file from git history.

## Tests & linting

- There are no automated tests included by default. Use the existing ESLint config in `client/`.
- Run basic lint checks in the client:

```bash
cd client
npx eslint src/**/*.{js,jsx}
```

## Deployment notes

- Build the client and serve it from a static host or behind the API reverse proxy.
- Ensure `MONGODB_URI` and `JWT_SECRET` are set in the production environment.
- Use HTTPS and restrict CORS to authorized origins.

## Contributing

- Keep UI copy short and plain — the project avoids marketing-style text and decorative elements.
- Keep components small and focused. Follow existing file structure conventions.
- Open issues for bugs and feature requests. Send a PR for changes.

## Security

- Do not commit `.env` or any files containing secrets.
- Review third-party packages before upgrading.

## License

This project does not include a license file by default. Add an appropriate license (MIT, Apache-2.0, etc.) if you plan to publish the code.

---

