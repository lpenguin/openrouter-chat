// Entry point for backend API (TypeScript)
import express from 'express';
import cors from 'cors';
import authApi from './api/authApi';
import settingsApi from './api/settingsApi';
import chatsApi from './api/chatsApi';
import attachmentsApi from './api/attachmentsApi';

const app = express();

// Configure CORS for Railway deployment
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev port
  process.env.FRONTEND_URL, // Custom frontend URL
  process.env.RAILWAY_PUBLIC_DOMAIN, // Railway auto-generated domain
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', authApi);
app.use('/api/settings', settingsApi);
app.use('/api', chatsApi);
app.use('/api', attachmentsApi);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
