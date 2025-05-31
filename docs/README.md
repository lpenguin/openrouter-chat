# OpenRouterChat

**OpenRouterChat** is a minimalist AI chat application powered by OpenRouter models. Built for simplicity and clarity, it provides an uncluttered interface with just the essential features for one-on-one AI conversations.

---

## ✨ Features

- 🔐 **Authentication**
  - Login via OpenRouter OAuth
  - No user profile or account settings

- 💬 **Chat Experience**
  - Send messages to OpenRouter-powered AI
  - Assistant replies returned instantly
  - Conversations saved automatically
  - No threading, tagging, archiving, or deletion

- ⚙️ **Model Control**
  - Select model from a searchable dropdown
  - Store default model preference

- 📤 **Export**
  - Export full conversation to Markdown

---

## 🧠 Powered By
- OpenRouter for model completions
- Supabase for backend data and authentication
- Node.js + Express backend
- React + Headless UI + Tailwind CSS frontend
- Hosted on Railway/Vercel

---

## 🚀 Deployment

### Quick Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

1. **Fork this repository**
2. **Connect to Railway** and deploy both services
3. **Configure environment variables** (see [Railway Deployment Guide](railway-deployment.md))
4. **Set up database** (PostgreSQL)

For detailed instructions, see [Railway Deployment Guide](railway-deployment.md).

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd openrouter-chat
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd openrouter-chat-backend
   npm install
   
   # Frontend  
   cd ../openrouter-chat-frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend: .env
   DATABASE_URL=your-postgres-url
   JWT_SECRET=your-secret-key
   
   # Frontend: .env
   VITE_API_PROXY=http://localhost:3001
   ```

4. **Start development servers**
   ```bash
   # Backend (terminal 1)
   cd openrouter-chat-backend
   npm run dev
   
   # Frontend (terminal 2)
   cd openrouter-chat-frontend  
   npm run dev
   ```

---

## 🚧 Future Enhancements

- Real-time assistant message **streaming** via SSE
- Mid-stream recovery after page reload
