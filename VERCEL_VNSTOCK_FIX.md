# Fixed: vnstock FileNotFoundError on Vercel

## 🐛 Error Fixed

```
FileNotFoundError: [Errno 2] No such file or directory: '/home/sbx_user1051/.vnstock'
```

## 🔍 Root Cause

The `vnstock` library tries to create a cache directory in the user's home directory (`~/.vnstock`), but:

- **Vercel serverless functions** have a **read-only file system**
- Only `/tmp` directory is writable
- The home directory doesn't exist or isn't writable

## ✅ Solution Applied

I've updated `backend/main.py` to redirect vnstock's cache to `/tmp`:

### Changes Made

**1. Set environment variables before importing vnstock:**

```python
import os
import sys

# Fix for Vercel serverless: vnstock tries to create cache in home directory
# Vercel only allows writes to /tmp directory
if os.environ.get('VERCEL'):
    os.environ['HOME'] = '/tmp'
    os.environ['VNSTOCK_CACHE_DIR'] = '/tmp/.vnstock'
    # Create cache directory if it doesn't exist
    os.makedirs('/tmp/.vnstock', exist_ok=True)

# Now import vnstock - it will use /tmp for cache
from vnstock import Vnstock
```

**2. Updated portfolio file storage:**

```python
# Portfolio storage file
# Use /tmp directory on Vercel (only writable location in serverless)
PORTFOLIO_FILE = "/tmp/default_portfolio.json" if os.environ.get('VERCEL') else "default_portfolio.json"
```

## 🚀 Deploy Again

Now redeploy to Vercel:

```bash
cd backend
vercel --prod
```

## ⚠️ Important Notes

### 1. Portfolio Data Won't Persist

Because we're using `/tmp` on Vercel:
- ✅ The app will work without crashing
- ⚠️ Portfolio data is **ephemeral** (resets on cold starts)
- ⚠️ Each serverless instance has its own `/tmp`

**What this means:**
- Default portfolio will work
- Saving portfolio changes will work temporarily
- But changes will be lost when the function restarts (cold start)

### 2. Cold Starts Still Slow

The vnstock library is heavy:
- First request: 20-50 seconds (may timeout on free tier)
- Subsequent requests: Fast (if function stays warm)

**Vercel limits:**
- Free tier: 10 second timeout
- Pro tier: 60 second timeout

### 3. Function Size Still Large

Your dependencies are ~200-300 MB:
- Close to Vercel's 250 MB limit
- May fail if dependencies grow

## 🎯 Testing

### 1. Test Root Endpoint

```bash
curl https://your-backend.vercel.app/
```

**Expected:**
```json
{"message": "Stock Portfolio Performance API"}
```

### 2. Test Portfolio Endpoint

```bash
curl https://your-backend.vercel.app/api/portfolio/default
```

**Expected:**
```json
{
  "stocks": [
    {"symbol": "VNM", "percentage": 30},
    {"symbol": "VIC", "percentage": 30},
    {"symbol": "HPG", "percentage": 40}
  ]
}
```

### 3. Test Performance Endpoint

```bash
curl "https://your-backend.vercel.app/api/portfolio/performance?days=7"
```

**Expected:** JSON with portfolio performance data

**Note:** This may take 20-50 seconds on first request (cold start)

## 🚨 If It Still Crashes

### Check Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to "Deployments" → Latest deployment
4. Click "Functions" tab
5. Look for error messages

### Common Issues

**1. Timeout Error**
```
Error: Task timed out after 10.00 seconds
```

**Solution:** 
- Upgrade to Vercel Pro ($20/month) for 60s timeout
- OR deploy to Railway (no timeout)

**2. Size Limit Error**
```
Error: Serverless Function size exceeds 250 MB limit
```

**Solution:**
- Deploy to Railway (no size limit)

**3. Memory Error**
```
Error: Function exceeded memory limit
```

**Solution:**
- Already set to max (3008 MB) in vercel.json
- Deploy to Railway for more memory

## 🚂 Still Recommend Railway

Even with these fixes, Railway is still better for this backend:

| Issue | Vercel (with fixes) | Railway |
|-------|---------------------|---------|
| **Cache directory** | ✅ Fixed (uses /tmp) | ✅ Works natively |
| **Portfolio persistence** | ❌ Ephemeral | ✅ Persistent |
| **Cold start timeout** | ⚠️ 10-60s limit | ✅ No limit |
| **Function size** | ⚠️ Near 250 MB limit | ✅ No limit |
| **Cost** | $0 or $20/month | $5/month |
| **Reliability** | ⚠️ May timeout | ✅ Very reliable |

### Quick Railway Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
railway domain

# Update frontend
cd ../frontend
vercel env add NEXT_PUBLIC_API_URL production
# Enter Railway URL
vercel --prod
```

## 📋 Summary

**What I Fixed:**
- ✅ vnstock cache directory error
- ✅ Portfolio file storage location
- ✅ Vercel environment detection

**What Works Now:**
- ✅ Backend should deploy without crashing
- ✅ API endpoints should respond
- ✅ vnstock should work

**What Still Has Issues:**
- ⚠️ Portfolio data doesn't persist (resets on cold start)
- ⚠️ First request may timeout (20-50 seconds)
- ⚠️ Function size near limit

**Recommendation:**
- 🚂 Deploy to Railway for production use
- 🔧 Use Vercel for testing/demo only

## 🎉 Next Steps

1. **Redeploy to Vercel:**
   ```bash
   cd backend
   vercel --prod
   ```

2. **Test the endpoints** (see Testing section above)

3. **If it works:** Great! But remember portfolio data won't persist

4. **If it still has issues:** Deploy to Railway instead

5. **Update frontend** with the backend URL

Good luck! 🚀

