// Entry point for backend API (TypeScript)
import express from 'express';
import cors from 'cors';
import authApi from './api/authApi';
import settingsApi from './api/settingsApi';
import chatsApi from './api/chatsApi';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authApi);
app.use('/api/settings', settingsApi);
app.use('/api', chatsApi);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
