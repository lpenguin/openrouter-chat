# OpenRouterChat — Architecture & Technical Overview

---

## 🧱 Stack Overview

- **Frontend**: React + ShadCN UI + Tailwind CSS (in `/openrouter-chat-frontend`)
- **Backend**: Node.js + Express (REST API, in `/openrouter-chat-backend`)
- **Language**: TypeScript (both frontend and backend)
- **Monorepo Structure**: Each of `/openrouter-chat-frontend` and `/openrouter-chat-backend` contains its own `src/` and `package.json`
- **Database**: Supabase (PostgreSQL + Auth)
- **Auth**: OpenRouter OAuth (via Supabase)
- **Hosting**: Vercel

---

## 🔄 Message Flow (No Streaming)

1. User sends a message
2. Backend calls OpenRouter completion API
3. Assistant response is returned immediately
4. Both user and assistant messages are saved
5. Frontend re-renders updated chat history

---

## 🗃️ Supabase Schema

### `users`
| Field | Type |
|-------|------|
| id | UUID |
| created_at | Timestamp |

### `chats`
| Field | Type |
|-------|------|
| id | UUID |
| user_id | UUID |
| created_at | Timestamp |

### `messages`
| Field | Type |
|-------|------|
| id | UUID |
| chat_id | UUID |
| role | Enum: `user` or `assistant` |
| content | Text |
| created_at | Timestamp |

### `user_settings`
| Field | Type |
|-------|------|
| user_id | UUID |
| default_model | Text |

---

## 🌐 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages` | Get chat history |
| `POST` | `/api/send-message` | Send a message, return assistant reply |
| `GET/POST` | `/api/user-settings` | Get/set default model |
