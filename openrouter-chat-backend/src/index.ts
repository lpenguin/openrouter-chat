// Entry point for backend API (TypeScript)
import express from 'express';
import cors from 'cors';
import authApi from './api/authApi';
import settingsApi from './api/settingsApi';
import chatsApi from './api/chatsApi';
import attachmentsApi from './api/attachmentsApi';

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/api', authApi);
app.use('/api/settings', settingsApi);
app.use('/api', chatsApi);
app.use('/api', attachmentsApi);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
