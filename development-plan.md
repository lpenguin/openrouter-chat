# OpenRouterChat — Development Plan

---

## 🧪 Phase 0: Monorepo Setup + Mock API + Static UI

### Goals:
- Provide backend placeholders to unblock frontend work
- Set up monorepo structure with TypeScript for both backend and frontend

### Tasks:
- [x] Create `/openrouter-chat-backend` and `/openrouter-chat-frontend` folders, each with `src/` and `package.json`
- [x] Configure TypeScript in both backend and frontend
- [x] `/api/messages` returns dummy chat
- [x] `/api/send-message` accepts message, returns fake assistant reply
- [x] In-memory store for messages (for now)

---

## 💻 Phase 1: Frontend Development

### Goals:
- Build complete UI with mock data

### Tasks:
- [x] Message bubble components
- [ ] Scrollable chat layout
- [ ] Model selector (searchable, stores selection locally)
- [ ] Input + send handler using mock API

---

## 🔐 Phase 2: Backend + Supabase + Export

### Goals:
- Replace mock logic with real data
- Implement actual export to Markdown

### Tasks:
- [ ] Setup Supabase DB + connect auth
- [ ] Save messages to DB
- [ ] Store user model preference in `user_settings`
- [ ] Replace `/api/send-message` with real OpenRouter call
- [ ] Implement `/api/messages` to fetch full chat
- [ ] Add Markdown export (download `.md` file of conversation)

---

## 🔄 Phase 3: Future Streaming Support

### Goals:
- Real-time assistant streaming with page reload recovery

### Tasks:
- [ ] Add SSE endpoint for assistant stream
- [ ] Display assistant message as chunks arrive
- [ ] Handle reload state and wait for completion
