# Troubleshooting Guide

This guide helps you resolve common issues with the note-taking application.

---

## Table of Contents
1. [OpenAI API Issues](#openai-api-issues)
2. [Browser Console Warnings](#browser-console-warnings)
3. [Rate Limiting Issues](#rate-limiting-issues)
4. [Development Server Issues](#development-server-issues)
5. [Build Issues](#build-issues)

---

## OpenAI API Issues

### Error: 429 - Rate limit exceeded

**What you see:**
```
Failed to load resource: the server responded with a status of 429
[WARN] OpenAI API rate limit hit
```

**What this means:**
- Your OpenAI API key has hit **OpenAI's rate limits** (not our app's rate limits)
- This is controlled by OpenAI based on your account tier and usage

**Solutions:**

#### 1. Check Your OpenAI Account Tier
OpenAI has different rate limits based on account tier:

| Tier | Requests/Minute (RPM) | Tokens/Minute (TPM) |
|------|----------------------|---------------------|
| Free | 3 RPM | 40,000 TPM |
| Tier 1 | 500 RPM | 30,000 TPM |
| Tier 2 | 5,000 RPM | 450,000 TPM |

**How to check your tier:**
1. Go to https://platform.openai.com/account/limits
2. Check your current tier and rate limits
3. See your usage at https://platform.openai.com/usage

#### 2. Wait Before Retrying
- OpenAI rate limits reset after 1 minute
- Wait 60 seconds before making another request
- Our app already has a client-side rate limiter (10 req/min) to help prevent this

#### 3. Upgrade Your OpenAI Account
If you need higher limits:
1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Account tier increases automatically with usage
4. Review pricing at https://openai.com/pricing

#### 4. Use a Different API Key
If you have multiple OpenAI accounts:
1. Open Settings in the app
2. Enter a different API key
3. Save and test connection

#### 5. Reduce Request Frequency
- Don't click AI actions repeatedly
- Wait for each request to complete
- Select smaller text portions

---

### Error: 401 - Invalid API key

**What you see:**
```
[SECURITY] Invalid API key used
Invalid API key. Please check your key in settings.
```

**Solutions:**

1. **Verify Your API Key:**
   - Go to https://platform.openai.com/api-keys
   - Check if your key is still active
   - Keys can expire or be revoked

2. **Copy the Key Correctly:**
   - API keys start with `sk-proj-` or `sk-`
   - Must be copied exactly (no spaces)
   - Should be 100+ characters long

3. **Regenerate Your Key:**
   - If key is compromised or lost
   - Go to OpenAI dashboard
   - Create a new secret key
   - Delete the old one
   - Update in app Settings

---

### Error: No API key found

**What you see:**
```
No API key found. Please add your OpenAI API key in settings.
```

**Solutions:**

1. **Add Your API Key:**
   - Click Settings icon (gear icon)
   - Enter your OpenAI API key
   - Click Save
   - Click "Test Connection" to verify

2. **Get an API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (you won't see it again!)
   - Add to app Settings

---

## Browser Console Warnings

### ~~Warning: CSP directive 'frame-ancestors' ignored~~ ✅ FIXED

**Status:** This warning has been fixed in the latest version.

**What happened:**
- Security headers were incorrectly set via `<meta>` tags in HTML
- These headers must be set via HTTP headers instead

**Solution:**
- ✅ Already fixed - headers now set via `vite.config.ts`
- ✅ Refresh your browser to see the fix
- No action needed

---

### ~~Warning: X-Frame-Options may only be set via HTTP header~~ ✅ FIXED

**Status:** This warning has been fixed in the latest version.

**Solution:**
- ✅ Already fixed in `vite.config.ts`
- No action needed

---

### Info: Download React DevTools

**What you see:**
```
Download the React DevTools for a better development experience
```

**What this means:**
- This is just an informational message
- React suggests installing DevTools for debugging

**Solution (optional):**
1. Install React DevTools browser extension:
   - Chrome: https://chrome.google.com/webstore (search "React DevTools")
   - Firefox: https://addons.mozilla.org/firefox/ (search "React DevTools")
2. Or ignore - app works fine without it

---

## Rate Limiting Issues

### Client-Side Rate Limit (Our App)

**What you see:**
```
Rate limit exceeded. Please try again at [time]. (10 requests per minute)
```

**What this means:**
- You've made 10 AI requests in the last minute
- This is our app's protection to prevent excessive API costs

**Solutions:**

1. **Wait for Reset:**
   - Rate limit resets automatically
   - Check the error message for reset time
   - Usually 60 seconds from first request

2. **Check Remaining Requests (Dev Mode):**
   ```javascript
   // In browser console
   window.aiRateLimiter.getRemainingRequests()
   window.aiRateLimiter.getResetTime()
   ```

3. **Manually Reset (Dev Mode Only):**
   ```javascript
   // Only for testing!
   window.aiRateLimiter.reset()
   ```

---

## Development Server Issues

### Port Already in Use

**What you see:**
```
Port 5173 is in use, trying another one...
Port 5174 is in use, trying another one...
```

**What this means:**
- Vite is finding an available port automatically
- Previous dev server instances may still be running

**Solutions:**

1. **Note the New Port:**
   - Check console output for actual port
   - Usually shows: `Local: http://localhost:5176/`
   - Open that URL in your browser

2. **Kill Existing Servers:**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   taskkill /F /PID <PID>

   # Mac/Linux
   lsof -ti:5173 | xargs kill -9
   ```

3. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

---

### HMR Not Working (Hot Module Reload)

**What this means:**
- Changes to code don't appear automatically
- You have to refresh manually

**Solutions:**

1. **Check WebSocket Connection:**
   - Open DevTools → Console
   - Look for WebSocket errors
   - CSP headers now allow `ws://localhost:*`

2. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear cache in DevTools → Network → "Disable cache"

3. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## Build Issues

### Error: Module not found

**What you see:**
```
Error: Cannot find module 'X'
```

**Solutions:**

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Clear Node Modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Import Paths:**
   - Use `.js` extensions in imports (even for `.ts` files)
   - Example: `import { logger } from './logger.js'`

---

### TypeScript Errors

**What you see:**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solutions:**

1. **Run Type Check:**
   ```bash
   npm run build
   ```

2. **Check Recent Changes:**
   - Review files you modified
   - Look for type mismatches
   - Use proper type annotations

3. **Check ESLint:**
   ```bash
   npm run lint
   ```

---

## Input Validation Issues

### Error: Text too long

**What you see:**
```
Text is too long (max 10,000 characters, got X)
```

**What this means:**
- You selected more than 10,000 characters
- This limit prevents excessive API costs

**Solutions:**

1. **Select Smaller Portion:**
   - Select only the paragraph you want to improve
   - Break large documents into sections

2. **Check Text Length:**
   - Current selection shows character count
   - Aim for under 10,000 characters

---

## Data Issues

### Notes Not Saving

**What this means:**
- Auto-save may have failed
- IndexedDB may be full or blocked

**Solutions:**

1. **Check Browser Console:**
   - Open DevTools → Console
   - Look for IndexedDB errors

2. **Check Storage Quota:**
   - DevTools → Application → Storage
   - Clear if needed

3. **Try Manual Save:**
   - Click away from note
   - Select another note
   - Come back to verify save

---

### Notes Disappeared

**What this means:**
- Browser data may have been cleared
- Using different browser profile
- IndexedDB may have been reset

**Solutions:**

1. **Check Browser Data:**
   - DevTools → Application → IndexedDB
   - Look for `note-app-db`

2. **Export Your Data (Prevention):**
   - Currently no export feature
   - Coming in Phase 2
   - Regularly backup important notes elsewhere

3. **Check Browser Profile:**
   - Ensure you're using same browser profile
   - Data is profile-specific

---

## Security Headers in Production

### Deploying to Production

When deploying to hosting platforms, configure these headers:

#### Netlify (_headers file):
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.openai.com; img-src 'self' data: https:; font-src 'self' data:;
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### Vercel (vercel.json):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.openai.com; img-src 'self' data: https:; font-src 'self' data:;"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## Getting More Help

### Logging System (Development)

Access detailed logs in browser console:

```javascript
// View all logs
window.logger.getLogs()

// View only errors
window.logger.getLogs('error')

// View security events
window.logger.getLogs('security')

// Get statistics
window.logger.getStatistics()

// Download logs
window.logger.downloadLogs()
```

### Debugging Checklist

Before reporting an issue:

- [ ] Check browser console for errors
- [ ] Verify API key is valid
- [ ] Check OpenAI account status and limits
- [ ] Try in different browser
- [ ] Clear browser cache
- [ ] Restart dev server
- [ ] Check `window.logger.getLogs('error')`

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 401 | Invalid API key | Check/regenerate key |
| 429 | Rate limit hit | Wait 60 seconds |
| 500 | OpenAI server error | Retry later |
| VALIDATION_ERROR | Input too long | Select less text |
| RATE_LIMIT | Our rate limit | Wait for reset |
| NO_API_KEY | No key configured | Add in Settings |

---

## Need More Help?

1. Check `SECURITY_IMPLEMENTATION.md` for security features
2. Check `PHASE1_COMPLETE.md` for implementation details
3. Review the security audit report
4. Check OpenAI status: https://status.openai.com/

---

**Last Updated:** October 30, 2025
