# Production Deployment Fixes

## Issues Fixed

### 1. 404 Error on Direct Navigation to Interview Sessions

**Problem:**
- Navigating directly to `/interview/16ae4aad` returns 404
- Works when navigating from home page
- Issue only occurs in production (Render static site)

**Root Cause:**
Render's static site hosting doesn't know how to handle client-side routing. When you visit `/interview/16ae4aad` directly, Render looks for a file at that path and returns 404.

**Solution:**

React Router requires the server to always serve `index.html` for ALL non-static routes.

**Option 1: Render Dashboard Configuration (Recommended)**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **Static Site** (codeinterview-frontend)
3. Go to "Redirects/Rewrites" tab
4. Click "Add Rule"
5. Configure the rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: `Rewrite`
6. Click "Save"

This forces all routes to load the React app, and React Router handles what to render.

**Option 2: _redirects File (Alternative)**

Create `frontend/public/_redirects` with:
```
/*    /index.html   200
```

> **Note**: This file is included in the project but may not work automatically on all Render configurations. The dashboard method (Option 1) is more reliable.

**Files Changed:**
- `frontend/public/_redirects` (included for reference)
- Render Dashboard configuration (manual setup required)

---

### 2. Participant Count Always Shows Zero

**Problem:**
- Participant count in UI always shows 0
- Works locally but not in production

**Root Cause:**
The `InterviewRoom` component was only setting participants from the initial session data, but:
1. The session response might not include participants
2. Participants joining via WebSocket weren't being reflected in the count
3. No polling or fetching of participants from the API

**Solution:**
Updated `InterviewRoom.jsx` to:
1. Fetch participants from API endpoint when session loads
2. Poll for participants every 5 seconds to keep list updated
3. Merge WebSocket events with API data

**Files Changed:**
- `frontend/src/components/InterviewRoom.jsx` (MODIFIED)

---

## Deployment Instructions

1. **Configure Render Static Site (One-time setup):**
   
   Go to Render Dashboard → codeinterview-frontend → Redirects/Rewrites:
   
   | Source | Destination | Type |
   |--------|-------------|------|
   | `/*` | `/index.html` | Rewrite |
   
   This enables Single Page App (SPA) routing.

2. **Commit changes:**
   ```bash
   git add frontend/src/components/InterviewRoom.jsx PRODUCTION-FIXES.md
   git commit -m "Fix: Fetch participants from API with polling"
   git push origin main
   ```

3. **Verify deployment:**
   - GitHub Actions will run tests
   - If tests pass, deploys to Render automatically
   - Wait ~5 minutes for deployment

4. **Test fixes:**
   - **Routing:** Copy a session link and paste directly in new browser tab
   - **Participants:** Create session, join from another browser, verify count updates

---

## Technical Details

### _redirects File

The `_redirects` file is a Render-specific configuration for static sites. It uses the following format:

```
[source]    [destination]    [status_code]
```

Our configuration:
- `/*` = Match all routes
- `/index.html` = Serve index.html
- `200` = Return 200 OK status (not a redirect)

This is similar to:
- Netlify's `_redirects`
- Vercel's `vercel.json` rewrites
- Apache's `.htaccess` rewrite rules

### Participant Fetching

The updated logic:
1. **Initial load:** Set participants from session data
2. **API fetch:** Fetch fresh participants from `/api/v1/sessions/{id}/participants`
3. **Polling:** Re-fetch every 5 seconds
4. **WebSocket:** Still handle real-time join/leave events

This ensures the UI stays in sync even if:
- WebSocket connection is lost
- User refreshes the page
- Multiple tabs are open

---

## Alternative Solutions Considered

### For Routing Issue:

1. **Hash Router** - Use `HashRouter` instead of `BrowserRouter`
   - ❌ Ugly URLs (`#/interview/123`)
   - ❌ Not SEO friendly
   - ✅ Works without server configuration

2. **Server-side Rendering** - Use Next.js or similar
   - ❌ Major refactor required
   - ❌ More complex deployment
   - ✅ Better SEO and performance

3. **_redirects file** (chosen)
   - ✅ Simple one-line fix
   - ✅ Clean URLs
   - ✅ No code changes
   - ✅ Standard practice

### For Participant Count:

1. **WebSocket only** - Rely solely on WebSocket events
   - ❌ Doesn't work if connection drops
   - ❌ Doesn't work on page refresh
   - ✅ Real-time updates

2. **API polling** (chosen)
   - ✅ Works even if WebSocket fails
   - ✅ Survives page refreshes
   - ✅ Simple implementation
   - ❌ Slight delay (5 seconds)

3. **Hybrid approach** (implemented)
   - ✅ Best of both worlds
   - ✅ Real-time via WebSocket
   - ✅ Fallback via polling
   - ❌ Slightly more complex

---

## Verification Checklist

After deployment, verify:

- [ ] Direct navigation to interview session works
- [ ] Participant count shows correctly
- [ ] Participant count updates when users join
- [ ] Participant count updates when users leave
- [ ] Works across multiple browsers/devices
- [ ] Works after page refresh
- [ ] WebSocket connection status shows correctly

---

## Monitoring

Watch for these metrics:
- 404 errors (should drop to zero)
- Participant API calls (should see regular polling)
- WebSocket connections (should remain stable)

Check Render logs:
```bash
# Backend logs
render logs codeinterview-api

# Frontend logs (build only)
render logs codeinterview-frontend
```

---

## Future Improvements

1. **Optimize polling** - Use exponential backoff or WebSocket-only when connected
2. **Add reconnection UI** - Show when WebSocket is reconnecting
3. **Cache participants** - Reduce API calls with smart caching
4. **Server-sent events** - Alternative to polling for participant updates
