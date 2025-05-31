# Railway Project Structure

This project is configured as a monorepo with two services:

## Services

### 1. Backend Service
- **Path**: `openrouter-chat-backend/`
- **Type**: Node.js API server
- **Port**: Auto-detected from `process.env.PORT`
- **Health Check**: `/health`

### 2. Frontend Service  
- **Path**: `openrouter-chat-frontend/`
- **Type**: Static site (Vite build)
- **Port**: Auto-detected from `process.env.PORT`
- **Serves**: Production build from `dist/`

## Environment Variables Required

### Backend
```
DATABASE_URL=<auto-provided-by-railway-postgres>
JWT_SECRET=<your-secret-key>
ALLOWED_ORIGINS=<frontend-domain>
```

### Frontend
```
VITE_API_URL=<backend-domain>
```

## Deployment Order

1. Deploy backend first to get its Railway domain
2. Deploy frontend with `VITE_API_URL` pointing to backend
3. Update backend's `ALLOWED_ORIGINS` with frontend domain

## Railway CLI Commands

```bash
# Login to Railway
railway login

# Link project (if deploying manually)
railway link

# Set environment variables
railway variables set JWT_SECRET=your-secret-key
railway variables set VITE_API_URL=https://backend-xxx.railway.app

# Deploy
railway up
```
