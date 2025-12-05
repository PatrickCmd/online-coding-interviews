# Quick Reference: GitHub Secrets Setup

## Required Secrets

Add these two secrets to your GitHub repository:

### 1. RENDER_DEPLOY_HOOK_BACKEND

**How to get it:**
1. Go to Render Dashboard → codeinterview-api service
2. Settings → Deploy Hook → Create Deploy Hook
3. Copy the URL (e.g., `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

**Add to GitHub:**
1. Repo → Settings → Secrets → Actions → New secret
2. Name: `RENDER_DEPLOY_HOOK_BACKEND`
3. Value: Paste the deploy hook URL
4. Click "Add secret"

### 2. RENDER_DEPLOY_HOOK_FRONTEND

**How to get it:**
1. Go to Render Dashboard → codeinterview-frontend service
2. Settings → Deploy Hook → Create Deploy Hook
3. Copy the URL

**Add to GitHub:**
1. Repo → Settings → Secrets → Actions → New secret
2. Name: `RENDER_DEPLOY_HOOK_FRONTEND`
3. Value: Paste the deploy hook URL
4. Click "Add secret"

## Verify Setup

After adding secrets, push to main:

```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Then check:
1. GitHub → Actions tab
2. Watch the workflow run
3. Verify deployments triggered on Render

## Benefits of Deploy Hooks

✅ **Simpler** - No need for API keys or service IDs
✅ **More Secure** - Scoped to single service
✅ **Revocable** - Can revoke without affecting other services
✅ **No Permissions** - Don't need account-level access

## Troubleshooting

**Deployment not triggered?**
- Check secrets are set correctly (no typos)
- Verify deploy hook URLs are complete
- Ensure tests passed before deployment

**How to test deploy hooks manually:**
```bash
curl -X POST "YOUR_DEPLOY_HOOK_URL"
```

You should see deployment start on Render dashboard.
