# Deploying to Render

This guide walks you through deploying the CodeInterview application to Render cloud platform.

## Prerequisites

- Render account (free tier available at [render.com](https://render.com))
- GitHub repository with your code
- Git installed locally

## Architecture

The deployment consists of three Render services:
1. **PostgreSQL Database** - Managed database for session storage
2. **Backend Web Service** - FastAPI application (Docker)
3. **Frontend Static Site** - React application (Vite build)

## Quick Deploy (Recommended)

### Option 1: Using render.yaml (Infrastructure as Code)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Wait for Deployment**
   - Database will be created first
   - Backend service will build and deploy (includes migrations)
   - Frontend will build and deploy
   - Total time: ~10-15 minutes

4. **Get Your URLs**
   - Backend API: `https://codeinterview-api.onrender.com`
   - Frontend: `https://codeinterview-frontend.onrender.com`
   - API Docs: `https://codeinterview-api.onrender.com/docs`

### Option 2: Manual Deployment

If you prefer manual setup or need to customize:

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Configure:
   - **Name**: `codeinterview-db`
   - **Database**: `codeinterview`
   - **User**: `codeinterview`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
3. Click "Create Database"
4. **Copy the Internal Database URL** (you'll need this for backend)

#### Step 2: Deploy Backend

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `codeinterview-api`
   - **Environment**: Docker
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Docker Command**: (leave default, uses Dockerfile)

4. **Environment Variables**:
   Click "Advanced" → "Add Environment Variable":
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste Internal Database URL from Step 1 |
   | `CORS_ORIGINS` | `["https://codeinterview-frontend.onrender.com","http://localhost:3000"]` |
   | `SESSION_EXPIRATION_HOURS` | `24` |
   | `ENVIRONMENT` | `production` |

5. Click "Create Web Service"
6. Wait for deployment (~5-10 minutes)
7. **Note the service URL** (e.g., `https://codeinterview-api.onrender.com`)

#### Step 3: Deploy Frontend

1. Go to Render Dashboard → "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `codeinterview-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://codeinterview-api.onrender.com` |
   | `VITE_WS_BASE_URL` | `wss://codeinterview-api.onrender.com` |

5. **Configure SPA Routing (IMPORTANT)**:
   
   After the static site is created:
   
   a. Go to your static site → "Redirects/Rewrites" tab
   
   b. Click "Add Rule" and configure:
   
   | Source | Destination | Type |
   |--------|-------------|------|
   | `/*` | `/index.html` | Rewrite |
   
   c. Click "Save"
   
   **Why this is needed:** React Router uses client-side routing. Without this rule, direct navigation to routes like `/interview/abc123` will return 404. This rewrite rule tells Render to serve `index.html` for all routes, allowing React Router to handle the routing.

6. Click "Create Static Site"
7. Wait for deployment (~3-5 minutes)

#### Step 4: Update Backend CORS

1. Go to Backend Service → "Environment"
2. Update `CORS_ORIGINS` to include your frontend URL:
   ```
   ["https://codeinterview-frontend.onrender.com","http://localhost:3000"]
   ```
3. Save (this will trigger a redeploy)

## Verification

### 1. Test Backend API

```bash
# Health check
curl https://codeinterview-api.onrender.com/api/v1/health

# Expected response:
# {"status":"ok","timestamp":1234567890}
```

### 2. Test Frontend

1. Visit your frontend URL (e.g., `https://codeinterview-frontend.onrender.com`)
2. Click "Create Interview Session"
3. Verify session is created
4. Copy the session link
5. Open in a new browser/device
6. Join the session
7. Test real-time collaboration

### 3. Check Logs

**Backend Logs:**
- Go to Backend Service → "Logs"
- Look for:
  - "Database connection successful"
  - "Running database migrations"
  - "Starting Uvicorn server"

**Database Logs:**
- Go to Database → "Logs"
- Verify connections from backend

## Environment Variables Reference

### Backend Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `CORS_ORIGINS` | Yes | Allowed frontend origins (JSON array) | `["https://app.onrender.com"]` |
| `SESSION_EXPIRATION_HOURS` | No | Session TTL in hours | `24` |
| `ENVIRONMENT` | No | Environment name | `production` |
| `FRONTEND_URL` | No | Frontend URL | `https://app.onrender.com` |

### Frontend Static Site

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | Yes | Backend API URL (HTTP) | `https://api.onrender.com` |
| `VITE_WS_BASE_URL` | Yes | Backend WebSocket URL (WSS) | `wss://api.onrender.com` |

## Troubleshooting

### Backend Won't Start

**Symptom**: Service shows "Deploy failed" or keeps restarting

**Solutions**:
1. Check logs for specific error
2. Verify `DATABASE_URL` is set correctly
3. Ensure database is running and accessible
4. Check Python version in Dockerfile matches requirements

**Common Errors**:
```
# Error: Connection refused
→ Database not ready yet. Wait 1-2 minutes and redeploy.

# Error: Permission denied for schema public
→ Database user doesn't have permissions. Check DATABASE_URL.

# Error: Module not found
→ Dependencies not installed. Check Dockerfile and pyproject.toml.
```

### Frontend Can't Connect to Backend

**Symptom**: Network errors, "Failed to fetch", CORS errors

**Solutions**:
1. Verify `VITE_API_BASE_URL` is correct (no trailing slash)
2. Check `VITE_WS_BASE_URL` uses `wss://` (not `ws://`)
3. Verify backend CORS_ORIGINS includes frontend URL
4. Check backend is deployed and healthy
5. Clear browser cache and hard refresh

**Test Backend Directly**:
```bash
curl https://your-api.onrender.com/api/v1/health
```

### Database Connection Errors

**Symptom**: "Too many connections", "Connection timeout"

**Solutions**:
1. Use **Internal Database URL** (not External)
2. Check database is in same region as backend
3. Verify database plan supports enough connections
4. Add connection pooling configuration

### WebSocket Connection Fails

**Symptom**: Real-time collaboration doesn't work

**Solutions**:
1. Verify `VITE_WS_BASE_URL` uses `wss://` protocol
2. Check WebSocket endpoint: `wss://your-api.onrender.com/ws/sessions/{id}`
3. Ensure backend WebSocket handler is working
4. Check browser console for specific WebSocket errors

### Slow Cold Starts

**Symptom**: First request takes 30+ seconds

**Explanation**: Render free tier spins down services after 15 minutes of inactivity.

**Solutions**:
1. Upgrade to paid plan ($7/month) for always-on service
2. Use a uptime monitor to ping your service every 10 minutes
3. Accept cold starts for development/demo purposes

## Monitoring

### Health Checks

Render automatically monitors your services:
- **Backend**: Checks `/api/v1/health` endpoint every 30 seconds
- **Frontend**: Checks HTTP 200 response

### Logs

Access real-time logs:
1. Go to Service → "Logs"
2. Filter by severity (Info, Warning, Error)
3. Search for specific terms
4. Download logs for analysis

### Metrics

View service metrics:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

## Updating Your Deployment

### Automatic Deploys

By default, Render auto-deploys when you push to `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect the push
2. Build new Docker image (backend) or static files (frontend)
3. Run health checks
4. Switch traffic to new version
5. Keep old version running until new one is healthy

### Manual Deploys

To deploy manually:
1. Go to Service → "Manual Deploy"
2. Select branch
3. Click "Deploy"

### Rollback

If deployment fails:
1. Go to Service → "Deploys"
2. Find previous successful deploy
3. Click "Redeploy"

## Database Migrations

Migrations run automatically on backend deployment via `start.sh`:

```bash
# Migrations are run before starting the server
uv run alembic upgrade head
```

### Manual Migration

To run migrations manually:

1. **Connect to your service**:
   ```bash
   # Get shell access
   render shell codeinterview-api
   ```

2. **Run migration**:
   ```bash
   uv run alembic upgrade head
   ```

3. **Check status**:
   ```bash
   uv run alembic current
   ```

### Rollback Migration

```bash
# Rollback one migration
uv run alembic downgrade -1

# Rollback to specific version
uv run alembic downgrade <revision>
```

## Cost Optimization

### Free Tier Limits

- **Web Services**: 750 hours/month (enough for 1 service)
- **Static Sites**: Unlimited
- **PostgreSQL**: Free for 90 days, then $7/month
- **Bandwidth**: 100 GB/month

### Recommendations

**For Development/Demo**:
- Use free tier
- Accept cold starts
- Use free PostgreSQL for 90 days

**For Production**:
- Upgrade backend to Starter ($7/month) for always-on
- Upgrade database to Starter ($7/month) for persistence
- Total: $14/month

## Custom Domain (Optional)

1. Go to Service → "Settings" → "Custom Domain"
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: app
   Value: <your-service>.onrender.com
   ```
4. SSL certificate automatically provisioned

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Only allow specific origins, not `*`
3. **HTTPS**: Always use HTTPS/WSS in production
4. **Database**: Use internal URL, not external
5. **Secrets**: Rotate database credentials periodically
6. **Rate Limiting**: Add rate limiting to API endpoints

## Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

## Next Steps

After successful deployment:

1. **Add Custom Domain** (optional)
2. **Set up Monitoring** (Sentry, LogRocket)
3. **Add Analytics** (Google Analytics, Plausible)
4. **Implement Authentication** (JWT, OAuth)
5. **Add Rate Limiting** (prevent abuse)
6. **Set up CI/CD** (GitHub Actions)
7. **Add E2E Tests** (Playwright, Cypress)

## Summary

✅ **Backend**: FastAPI + PostgreSQL on Render  
✅ **Frontend**: React static site on Render  
✅ **Database**: Managed PostgreSQL with automatic backups  
✅ **Migrations**: Automatic on deployment  
✅ **CORS**: Configured for production  
✅ **WebSocket**: Real-time collaboration working  
✅ **Monitoring**: Health checks and logs  
✅ **Cost**: $0-14/month depending on plan  

Your application is now live and accessible worldwide! 🎉
