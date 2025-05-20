# OpenRouterChat — Architecture & Technical Overview

---

## 🧱 Stack Overview

- **Frontend**: React + Headless UI + Tailwind CSS (in `/openrouter-chat-frontend`)
- **Backend**: Node.js + Express (REST API, in `/openrouter-chat-backend`)
- **Language**: TypeScript (both frontend and backend)
- **Monorepo Structure**: Each of `/openrouter-chat-frontend` and `/openrouter-chat-backend` contains its own `src/` and `package.json`
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom JWT-based authentication (users table, email+password, JWT issued by backend)
- **Hosting**: Vercel

---

## 🔄 Message Flow (No Streaming)

1. User sends a message
2. Backend calls OpenRouter completion API
3. Assistant response is returned immediately
4. Both user and assistant messages are saved
5. Frontend re-renders updated chat history

---

## 🗃️ Database Schema

### `users`
| Field         | Type      |
|-------------- |-----------|
| id            | integer   |
| email         | text      |
| password_hash | text      |
| created_at    | timestamp |

> **Note:** The `chats`, `messages`, and `user_settings` tables are planned for future implementation, but are not present in the current schema.

---

## 🔐 Authentication Flow

- User registers or logs in with email and password via `/api/register` or `/api/login`.
- Backend issues a JWT (valid for 7 days) on successful login/register.
- Frontend stores JWT in localStorage and includes it as a Bearer token in all API requests.
- Backend protects endpoints using JWT Bearer authentication middleware.
- `/api/me` returns the current user info if the JWT is valid.
- Logout is handled by clearing localStorage and reloading the app.

---

## 🌐 API Overview

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| POST   | `/api/register`  | Register new user, returns JWT     |
| POST   | `/api/login`     | Login, returns JWT                 |
| GET    | `/api/me`        | Get current user info (auth req'd) |
| GET    | `/api/messages`  | Get chat history (auth req'd)      |
| POST   | `/api/send-message` | Send a message, return assistant reply (auth req'd) |
| GET/POST | `/api/user-settings` | Get/set default model (auth req'd) |

---

## Notes
- All protected endpoints require `Authorization: Bearer <JWT>` header.
- JWT is stored in localStorage and managed by the frontend.
- The users table is managed by the backend, not Supabase Auth.
- This architecture supports easy migration to other auth providers if needed.
