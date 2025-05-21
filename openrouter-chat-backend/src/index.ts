// Entry point for backend API (TypeScript)
import express from 'express';
import cors from 'cors';
import authApi from './authApi';
import settingsApi from './settingsApi';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authApi);
app.use('/api/settings', settingsApi);

// In-memory message store
let messages = [
  { id: 1, role: 'user', content: 'Hello, assistant!' },
  { id: 2, role: 'assistant', content: 'Hello! How can I help you today?' }
];

// GET /api/messages — returns dummy chat
app.get('/api/messages', (req, res) => {
  res.json({ messages });
});

// POST /api/send-message — accepts message, returns fake assistant reply
app.post('/api/send-message', (req, res) => {
  const { content } = req.body;
  const userMsg = { id: messages.length + 1, role: 'user', content };
  messages.push(userMsg);

  // Fake assistant reply
  const assistantMsg = {
    id: messages.length + 1,
    role: 'assistant',
    content: `You said: "${content}"`
  };
  messages.push(assistantMsg);

  res.json({ reply: assistantMsg });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
