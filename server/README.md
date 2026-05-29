# Server Auth Setup

This server uses Express, MongoDB, and JWT auth.

## Environment

Create a `.env` file in `server/` with:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/study-room
JWT_SECRET=replace-this-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

## Run

```bash
npm install
npm start
```

## Auth routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
