# CI/CD Pipeline Setup

This guide explains how to set up the GitHub Actions CI/CD pipeline for automated testing and deployment to Render.

## Overview

The CI/CD pipeline consists of three jobs:

1. **Frontend Tests** - Runs Vitest tests for React application
2. **Backend Tests** - Runs pytest tests with PostgreSQL database
3. **Deploy to Render** - Triggers deployment only if all tests pass

## Pipeline Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Push to main                         │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Frontend Tests  │    │ Backend Tests   │
│                 │    │ (PostgreSQL)    │
│ - npm ci        │    │ - uv sync       │
│ - npm test      │    │ - migrations    │
│ - npm build     │    │ - pytest        │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
              ✅ All tests pass
                    │
                    ▼
         ┌──────────────────────┐
         │  Deploy to Render    │
         │                      │
         │  - Trigger deploy    │
         │  - Monitor status    │
         └──────────────────────┘
```

## Setup Instructions

### Step 1: Get Render Deploy Hooks

Deploy hooks are simpler and more secure than API keys. You need one for each service.

**For Backend Service:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **backend service** (codeinterview-api)
3. Go to "Settings" tab
4. Scroll to "Deploy Hook" section
5. Click "Create Deploy Hook"
6. Copy the webhook URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

**For Frontend Service:**

1. Go to your **frontend service** (codeinterview-frontend)
2. Go to "Settings" tab
3. Scroll to "Deploy Hook" section
4. Click "Create Deploy Hook"
5. Copy the webhook URL

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `RENDER_DEPLOY_HOOK_BACKEND` | Backend deploy hook URL from Step 1 | Triggers backend deployment |
| `RENDER_DEPLOY_HOOK_FRONTEND` | Frontend deploy hook URL from Step 1 | Triggers frontend deployment |

**Security Note:** Deploy hooks are scoped to a single service and can be revoked independently, making them more secure than API keys.

### Step 3: Enable GitHub Actions

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `RENDER_API_KEY` | Your Render API key from Step 1 | Used to authenticate with Render API |
| `RENDER_SERVICE_ID` | Your backend service ID from Step 2 | Identifies which service to deploy |

### Step 4: Enable GitHub Actions

1. Go to your repository → "Actions" tab
2. If prompted, click "I understand my workflows, go ahead and enable them"
3. The workflow will run automatically on the next push to `main`

### Step 5: Test the Pipeline

**Option A: Push a change**
```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

**Option B: Manually trigger**
1. Go to "Actions" tab
2. Select "CI/CD Pipeline" workflow
3. Click "Run workflow" → "Run workflow"

## Monitoring the Pipeline

### View Workflow Runs

1. Go to "Actions" tab in your repository
2. Click on the latest workflow run
3. You'll see the three jobs:
   - ✅ Frontend Tests
   - ✅ Backend Tests
   - 🚀 Deploy to Render (only if tests pass)

### View Logs

Click on any job to see detailed logs:

**Frontend Tests:**
```
✓ src/test/services/api.service.test.js (13 tests)
✓ src/test/services/session.service.test.js (12 tests)
✓ src/test/services/collaboration.service.test.js (18 tests)
...
Test Files  8 passed (8)
Tests  84 passed (84)
```

**Backend Tests:**
```
tests/test_sessions.py::test_create_session PASSED
tests/test_sessions.py::test_get_session PASSED
tests/test_websocket.py::test_websocket_connection PASSED
...
18 passed in 2.34s
```

**Deploy:**
```
🚀 Triggering Render deployment...
✅ Deployment triggered successfully!
```

## Workflow Configuration

The workflow is defined in `.github/workflows/ci-cd.yml`:

### Triggers

```yaml
on:
  push:
    branches: [main]      # Runs on push to main
  pull_request:
    branches: [main]      # Runs on PRs to main
```

### Jobs

**1. Frontend Tests**
- Runs on: `ubuntu-latest`
- Node.js: 18
- Steps: Install deps → Run tests → Build

**2. Backend Tests**
- Runs on: `ubuntu-latest`
- Python: 3.12
- PostgreSQL: 15 (service container)
- Steps: Install uv → Sync deps → Migrate → Test

**3. Deploy**
- Runs on: `ubuntu-latest`
- Depends on: Frontend + Backend tests
- Only runs: On push to `main` (not PRs)
- Steps: 
  - Trigger backend deployment via deploy hook
  - Trigger frontend deployment via deploy hook

## Customization

### Change Test Commands

Edit `.github/workflows/ci-cd.yml`:

```yaml
# Frontend tests
- name: Run tests
  working-directory: ./frontend
  run: npm test -- --run --coverage  # Add coverage

# Backend tests
- name: Run tests
  working-directory: ./backend
  run: uv run pytest -v --cov  # Add coverage
```

### Add Deployment Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ Deployment successful!"
      }
```

### Deploy Multiple Services

The workflow already deploys both backend and frontend using separate deploy hooks:

```yaml
- name: Deploy Backend to Render
  env:
    RENDER_DEPLOY_HOOK_BACKEND: ${{ secrets.RENDER_DEPLOY_HOOK_BACKEND }}
  run: |
    curl -X POST "$RENDER_DEPLOY_HOOK_BACKEND"

- name: Deploy Frontend to Render
  env:
    RENDER_DEPLOY_HOOK_FRONTEND: ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}
  run: |
    curl -X POST "$RENDER_DEPLOY_HOOK_FRONTEND"
```

To add more services, just add another deploy hook secret and step.

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Frontend:**
- Check Node.js version matches (18)
- Ensure all dependencies in `package.json`
- Check for environment-specific code

**Backend:**
- Check Python version matches (3.12)
- Verify PostgreSQL version (15)
- Check DATABASE_URL format

### Deployment Not Triggered

**Check:**
1. Tests passed (both frontend and backend)
2. Push was to `main` branch (not PR)
3. Deploy hook secrets are set correctly
4. Deploy hook URLs are valid

**View logs:**
```yaml
- name: Debug
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "Backend hook set: ${{ secrets.RENDER_DEPLOY_HOOK_BACKEND != '' }}"
    echo "Frontend hook set: ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND != '' }}"
```

### Render Deployment Fails

**Check Render Dashboard:**
1. Go to your service → "Events"
2. Look for deployment errors
3. Check build logs

**Common issues:**
- Build timeout (increase in Render settings)
- Environment variables not set
- Database migration errors

## Best Practices

### 1. Branch Protection

Enable branch protection for `main`:
1. Settings → Branches → Add rule
2. Require status checks to pass:
   - ✅ Frontend Tests
   - ✅ Backend Tests
3. Require pull request reviews

### 2. Test Coverage

Add coverage reporting:

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### 3. Caching

Speed up builds with caching:

```yaml
# Frontend
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Already enabled

# Backend
- name: Cache uv
  uses: actions/cache@v3
  with:
    path: ~/.cache/uv
    key: ${{ runner.os }}-uv-${{ hashFiles('**/uv.lock') }}
```

### 4. Deployment Approval

Require manual approval for production:

```yaml
deploy:
  environment:
    name: production
    url: https://codeinterview-api.onrender.com
  # Requires approval in GitHub Settings → Environments
```

### 5. Rollback Strategy

Add rollback capability:

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    # Trigger rollback to previous version
    curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys" \
      -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
      -d '{"clearCache": true}'
```

## Security

### Secrets Management

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate API keys regularly
- ✅ Use least-privilege access

### API Key Permissions

Render API keys have full account access. Consider:
- Creating a separate Render account for CI/CD
- Using deploy hooks instead of API keys (see below)

### Alternative: Deploy Hooks

Instead of API keys, use Render deploy hooks:

1. Go to service → Settings → "Deploy Hook"
2. Copy the webhook URL
3. Add as GitHub secret: `RENDER_DEPLOY_HOOK`
4. Update workflow:

```yaml
- name: Deploy to Render
  run: |
    curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
```

**Advantages:**
- No API key needed
- Scoped to single service
- Can be revoked independently

## Monitoring

### GitHub Actions Status Badge

Add to README.md:

```markdown
![CI/CD](https://github.com/PatrickCmd/online-coding-interviews/actions/workflows/ci-cd.yml/badge.svg)
```

### Metrics

Track pipeline metrics:
- Average run time
- Success rate
- Test coverage trends
- Deployment frequency

## Cost

GitHub Actions free tier:
- 2,000 minutes/month for private repos
- Unlimited for public repos

Typical usage:
- Frontend tests: ~2 minutes
- Backend tests: ~3 minutes
- Deploy: ~1 minute
- **Total: ~6 minutes per run**

## Next Steps

1. ✅ Set up GitHub secrets
2. ✅ Enable branch protection
3. ✅ Add status badge to README
4. ✅ Configure deployment notifications
5. ✅ Set up test coverage reporting
6. ✅ Create staging environment

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render API Documentation](https://render.com/docs/api)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
