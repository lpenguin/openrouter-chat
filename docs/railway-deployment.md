# Railway Deployment Guide for OpenRouterChat

This guide explains how to deploy the OpenRouterChat monorepo to Railway with separate frontend and backend services.

## Prerequisites
1. [Railway account](https://railway.app/)
2. Your repository pushed to GitHub
3. Railway CLI installed (optional): `npm install -g @railway/cli`

## 🚀 Quick Deploy Overview

1. **Connect Repository**: Link your GitHub repo to Railway
2. **Deploy Backend**: Create backend service with PostgreSQL database
3. **Deploy Frontend**: Create frontend service
4. **Configure Environment Variables**: Set up cross-service communication
5. **Test**: Verify both services are working

## 📋 Step-by-Step Deployment

### Step 1: Connect Your Repository
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `openrouter-chat` repository

### Step 2: Configure Backend Service
1. Railway will detect the monorepo structure
2. Create a service for the backend:
   - **Root Directory**: `openrouter-chat-backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
3. Railway will automatically assign a domain like `https://backend-xxx.railway.app`

### Step 3: Add Database
1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provide `DATABASE_URL` environment variable to your backend service

### Step 4: Configure Frontend Service
1. Create another service for the frontend:
   - **Root Directory**: `openrouter-chat-frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
2. Railway will automatically assign a domain like `https://frontend-xxx.railway.app`

### Step 5: Set Environment Variables

After both services are deployed, configure the cross-service communication:

#### Backend Service Variables:
```bash
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=(automatically provided by Railway PostgreSQL)
FRONTEND_URL=https://your-frontend-service.railway.app
```

#### Frontend Service Variables:
```bash
VITE_API_URL=https://your-backend-service.railway.app
```

### Step 6: Redeploy Services
After setting environment variables, redeploy both services for changes to take effect.

## 🔧 Environment Variables Reference

### Frontend (`openrouter-chat-frontend`)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://backend-xxx.railway.app` |

### Backend (`openrouter-chat-backend`)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | Auto-provided by Railway |
| `JWT_SECRET` | Yes | Secret for JWT token signing | `your-super-secret-key` |
| `FRONTEND_URL` | Yes | Frontend domain for CORS | `https://frontend-xxx.railway.app` |
| `PORT` | No | Server port (auto-provided) | `3000` |

## 🛠️ Local Development vs Railway

### Local Development
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:3001`
- Uses Vite proxy: `/api` → `http://localhost:3001`

### Railway Production
- Frontend: `https://frontend-xxx.railway.app`
- Backend: `https://backend-xxx.railway.app`
- Direct API calls: `VITE_API_URL` → backend service

## 🔄 How It Works

1. **Build Time**: Vite reads `VITE_API_URL` and embeds it into the JavaScript bundle
2. **Runtime**: Static frontend files make direct API calls to the backend service
3. **CORS**: Backend allows requests from the frontend domain specified in `FRONTEND_URL`

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `FRONTEND_URL` includes your actual frontend domain
2. **API Not Found**: Verify `VITE_API_URL` points to your backend service
3. **Build Failures**: Check that Node.js version is compatible (using Node 20)
4. **Environment Variables Not Working**: Remember `VITE_*` variables are embedded at build time

### Debug Steps:

1. Check Railway deployment logs for both services
2. Verify environment variables are set correctly in Railway dashboard
3. Test API endpoints directly: `https://your-backend.railway.app/health`
4. Check browser network tab for API call URLs
5. Redeploy frontend after changing `VITE_API_URL`

## Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend.railway.app/health`
2. **Frontend Access**: Visit `https://your-frontend.railway.app`
3. **API Connectivity**: Try registering/logging in through the frontend

## 📝 Notes

- Railway automatically provides `PORT` environment variable
- Frontend uses static file serving (Vite preview mode)
- Backend uses Express.js server
- Database migrations run automatically on deployment
- Automatic deployments trigger when you push to your main branch

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Railway Monorepo Guide](https://docs.railway.app/tutorials/deploying-a-monorepo)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
