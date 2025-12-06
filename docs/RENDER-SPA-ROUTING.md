# Render Static Site - SPA Routing Configuration

## Quick Fix for 404 Errors on Direct Navigation

If you're getting 404 errors when navigating directly to routes like `/interview/abc123`, you need to configure Render to handle Single Page App (SPA) routing.

## Steps

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Select your static site (e.g., `codeinterview-frontend`)

2. **Open Redirects/Rewrites**
   - Click on the "Redirects/Rewrites" tab

3. **Add Rewrite Rule**
   - Click "Add Rule"
   - Configure as follows:

   | Field | Value |
   |-------|-------|
   | **Source** | `/*` |
   | **Destination** | `/index.html` |
   | **Type** | `Rewrite` |

4. **Save**
   - Click "Save" button
   - Changes take effect immediately (no redeploy needed)

## Why This Works

**The Problem:**
- React Router uses client-side routing
- When you visit `/interview/abc123` directly, Render looks for a file at that path
- Since the file doesn't exist, Render returns 404

**The Solution:**
- The rewrite rule tells Render: "For ANY route (`/*`), serve `index.html`"
- React app loads and React Router handles the routing
- User sees the correct page instead of 404

## Verification

After configuring, test:

1. **Create a session** on your app
2. **Copy the session link** (e.g., `https://your-app.onrender.com/interview/abc123`)
3. **Open in new browser tab** (or incognito)
4. **Should load correctly** instead of showing 404

## Alternative: _redirects File

You can also use a `_redirects` file in your `public` folder:

```
/*    /index.html   200
```

However, the dashboard method is more reliable and doesn't require code changes.

## Common Issues

**Q: I added the rule but still getting 404**
- Clear browser cache and try again
- Make sure the rule is saved (check Redirects/Rewrites tab)
- Verify Source is `/*` (not `/` or `*`)
- Verify Type is `Rewrite` (not `Redirect`)

**Q: Do I need to redeploy?**
- No! Redirect rules take effect immediately

**Q: Will this affect my API calls?**
- No! This only affects routes served by the static site
- API calls to your backend are not affected

## Resources

- [Render Redirects Documentation](https://render.com/docs/redirects-rewrites)
- [React Router Documentation](https://reactrouter.com)
