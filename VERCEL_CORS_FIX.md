# Vercel CORS Error - Troubleshooting Guide

## 🐛 Error You're Seeing

```
Access to fetch at 'https://stock-porfolio-perfomance.vercel.app//api/portfolio/default' 
from origin 'https://stock-porfolio-perfomance-s85l.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Two Issues Identified

### 1. ✅ FIXED: Double Slash in URL (`//api/portfolio/default`)

**Cause:** Environment variable had trailing slash: `https://example.com/`

**Fix Applied:** All API URL usages now automatically remove trailing slashes:
- ✅ `frontend/app/lib/portfolioStorage.ts`
- ✅ `frontend/app/page.tsx`
- ✅ `frontend/app/custom/page.tsx`

### 2. ⚠️ CORS Headers Not Present

**Cause:** Backend might not be deployed correctly or not responding with CORS headers.

## 🔧 Solutions

### Step 1: Verify Backend Deployment

Check if your backend is actually deployed and responding:

```bash
# Test if backend is accessible
curl https://stock-porfolio-perfomance.vercel.app/

# Should return: {"message": "Stock Portfolio Performance API"}
```

If you get an error or no response, the backend isn't deployed correctly.

### Step 2: Check Vercel Deployment Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check "Build Logs" and "Function Logs" for errors

Common errors:
- ❌ `Module not found: vnstock` - Dependencies not installed
- ❌ `Timeout` - Function taking too long (>10s on free tier)
- ❌ `Import error` - Python path issues

### Step 3: Verify Environment Variable

In your **frontend** Vercel project:

1. Go to Settings → Environment Variables
2. Check `NEXT_PUBLIC_API_URL` value
3. **Must NOT have trailing slash**: ✅ `https://backend.vercel.app` ❌ `https://backend.vercel.app/`

**To update:**
```bash
# Remove old variable
vercel env rm NEXT_PUBLIC_API_URL production

# Add new variable (without trailing slash)
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://stock-porfolio-perfomance.vercel.app
```

Then redeploy:
```bash
cd frontend
vercel --prod
```

### Step 4: Verify Backend CORS Configuration

The backend is already configured to allow all origins. Verify by checking the deployed function:

```bash
# Test CORS headers
curl -I -X OPTIONS https://stock-porfolio-perfomance.vercel.app/api/portfolio/default \
  -H "Origin: https://stock-porfolio-perfomance-s85l.vercel.app" \
  -H "Access-Control-Request-Method: GET"

# Should include these headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: *
```

If these headers are missing, the backend isn't responding correctly.

## 🚨 Known Vercel Serverless Issues

### Issue: Backend Not Responding

**Symptoms:**
- CORS errors
- Timeout errors
- 404 errors on API endpoints

**Possible Causes:**

1. **Python dependencies too large**
   - Vercel has 250MB limit for serverless functions
   - `vnstock` + `pandas` + dependencies might exceed this

2. **Cold start timeout**
   - First request takes >10 seconds (free tier limit)
   - `vnstock` initialization is slow

3. **File system issues**
   - `default_portfolio.json` won't persist
   - Each request gets fresh file system

### Solution: Deploy Backend to Railway Instead

Railway has no timeout limits and persistent storage:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Get the URL
railway domain
```

Then update frontend environment variable:
```bash
cd ../frontend
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-app.railway.app
vercel --prod
```

## 🎯 Recommended Architecture

For production, use this setup:

| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | Vercel | Optimal for Next.js, fast CDN |
| **Backend** | Railway/Render | Persistent storage, no timeout |
| **Database** | Supabase/MongoDB | If needed for portfolio storage |

## 📋 Quick Checklist

- [ ] Backend deployed and responding at root URL (`/`)
- [ ] Backend returns CORS headers (test with curl)
- [ ] Frontend `NEXT_PUBLIC_API_URL` has NO trailing slash
- [ ] Frontend redeployed after environment variable change
- [ ] Test API endpoint directly in browser
- [ ] Check browser console for actual error details

## 🔍 Debugging Steps

### 1. Test Backend Directly

Open in browser:
```
https://stock-porfolio-perfomance.vercel.app/
```

Should see:
```json
{"message": "Stock Portfolio Performance API"}
```

### 2. Test API Endpoint

Open in browser:
```
https://stock-porfolio-perfomance.vercel.app/api/portfolio/default
```

Should see portfolio JSON or error message.

### 3. Check Browser Console

1. Open frontend in browser
2. Press F12 (Developer Tools)
3. Go to "Network" tab
4. Refresh page
5. Look for failed requests
6. Click on failed request
7. Check "Headers" tab for:
   - Request URL (should NOT have `//`)
   - Response headers (should have CORS headers)

### 4. Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Select backend project
3. Go to "Logs" tab
4. Filter by "Functions"
5. Look for errors when you make requests

## 💡 Quick Fix: Test Locally First

Before debugging Vercel, test locally:

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend (update .env.local)
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Visit http://localhost:3000 and verify everything works.

If it works locally but not on Vercel, the issue is with Vercel deployment.

## 📞 Next Steps

1. **Test backend URL directly** - Verify it's responding
2. **Check environment variable** - Remove trailing slash
3. **Redeploy frontend** - After fixing env var
4. **Check Vercel logs** - Look for backend errors
5. **Consider Railway** - If Vercel backend has issues

## 🆘 Still Having Issues?

If the backend continues to have issues on Vercel, I recommend:

1. **Deploy backend to Railway** (5 minutes, more reliable)
2. **Keep frontend on Vercel** (optimal for Next.js)
3. **Update frontend env var** to point to Railway URL

This is the recommended production setup anyway!

