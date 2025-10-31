# Vercel Serverless Function Crash - Fix Guide

## 🐛 Error: "This Serverless Function has crashed"

This error means your backend isn't starting properly on Vercel. This is **very common** with Python backends that use heavy dependencies like `vnstock`, `pandas`, and `matplotlib`.

## 🔧 Changes Made

I've updated the Vercel configuration to try to fix this:

### 1. Updated `backend/vercel.json`

**Changed from:**
```json
{
  "builds": [{"src": "api/index.py", "use": "@vercel/python"}],
  "routes": [{"src": "/(.*)", "dest": "api/index.py"}]
}
```

**Changed to:**
```json
{
  "builds": [{"src": "main.py", "use": "@vercel/python"}],
  "routes": [{"src": "/(.*)", "dest": "main.py"}],
  "functions": {
    "main.py": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

**Why:**
- Simplified to use `main.py` directly (no extra `api/index.py` wrapper)
- Increased memory to maximum (3008 MB)
- Increased timeout to 60 seconds (requires Vercel Pro)

### 2. Updated `backend/main.py`

Added Vercel handler:
```python
# Vercel serverless handler
handler = app
```

## 🚨 Why Vercel Crashes with This Backend

Your backend has **serious compatibility issues** with Vercel:

### Issue 1: Dependencies Too Large

Your `requirements.txt` includes:
- `vnstock==3.2.6` (large Vietnamese stock library)
- `pandas==2.3.3` (data processing)
- `matplotlib==3.10.7` (plotting)
- `seaborn==0.13.2` (visualization)
- `numpy==2.3.4` (numerical computing)
- Many other dependencies

**Total size:** Likely **200-300 MB** compressed

**Vercel limit:** 250 MB for serverless functions

**Result:** Function may exceed size limit and crash

### Issue 2: Cold Start Timeout

First request to a cold function:
1. Download and extract dependencies (10-30 seconds)
2. Import `vnstock`, `pandas`, `matplotlib` (5-15 seconds)
3. Initialize vnstock API connection (2-5 seconds)
4. Process request (1-5 seconds)

**Total:** 20-50 seconds

**Vercel free tier limit:** 10 seconds
**Vercel Pro limit:** 60 seconds

**Result:** Function times out and crashes

### Issue 3: File System

Your backend uses `default_portfolio.json` for storage:
```python
PORTFOLIO_FILE = "default_portfolio.json"
```

**Vercel serverless:** Ephemeral file system (resets on every cold start)

**Result:** Portfolio data doesn't persist

## ✅ Recommended Solution: Deploy to Railway

Railway is **much better** for this type of backend:

| Feature | Vercel | Railway |
|---------|--------|---------|
| **Timeout** | 10s (free) / 60s (Pro) | ∞ No limit |
| **Memory** | 1024 MB (free) / 3008 MB (Pro) | 8 GB+ |
| **Size Limit** | 250 MB | No limit |
| **File System** | Ephemeral | Persistent |
| **Cold Starts** | Yes (slow) | No (always on) |
| **Cost** | $20/month (Pro) | $5/month |

### Deploy to Railway (5 minutes)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Navigate to backend
cd backend

# 4. Initialize Railway project
railway init

# 5. Deploy
railway up

# 6. Get your URL
railway domain

# Example output: https://your-app.up.railway.app
```

### Update Frontend to Use Railway

```bash
# 1. Navigate to frontend
cd ../frontend

# 2. Update environment variable in Vercel
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://your-app.up.railway.app

# 3. Redeploy frontend
vercel --prod
```

## 🔄 Alternative: Try the Updated Vercel Config

If you want to try Vercel again with the updated configuration:

### Step 1: Redeploy Backend

```bash
cd backend
vercel --prod
```

### Step 2: Check Deployment Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Click on latest deployment
4. Check "Function Logs" tab
5. Look for errors

### Common Errors You Might See:

**Error 1: Size Limit Exceeded**
```
Error: Serverless Function size exceeds 250 MB limit
```
**Solution:** Deploy to Railway instead

**Error 2: Timeout**
```
Error: Task timed out after 10.00 seconds
```
**Solution:** Upgrade to Vercel Pro ($20/month) or use Railway

**Error 3: Import Error**
```
ModuleNotFoundError: No module named 'vnstock'
```
**Solution:** Check `requirements.txt` is in backend root

**Error 4: Memory Error**
```
Error: Function exceeded memory limit
```
**Solution:** Deploy to Railway (more memory available)

## 🧪 Test Locally First

Before deploying, test that your backend works:

```bash
cd backend
python main.py
```

Visit http://localhost:8000 - should see:
```json
{"message": "Stock Portfolio Performance API"}
```

Test API endpoint:
```bash
curl http://localhost:8000/api/portfolio/default
```

If it doesn't work locally, it won't work on Vercel.

## 📊 Comparison: What Works Where

| Feature | Works on Vercel? | Works on Railway? |
|---------|------------------|-------------------|
| FastAPI app | ✅ Yes | ✅ Yes |
| Small dependencies | ✅ Yes | ✅ Yes |
| Large dependencies (vnstock, pandas) | ⚠️ Maybe (often crashes) | ✅ Yes |
| File storage | ❌ No (ephemeral) | ✅ Yes (persistent) |
| Long-running requests | ❌ No (10s limit) | ✅ Yes (no limit) |
| Cold starts | ⚠️ Slow (20-50s) | ✅ Fast (always on) |

## 🎯 My Strong Recommendation

**Deploy backend to Railway, frontend to Vercel:**

✅ **Pros:**
- Backend works reliably (no crashes)
- No timeout issues
- Persistent file storage
- Better performance
- Cheaper ($5/month vs $20/month)

❌ **Cons:**
- Need to manage two platforms (but both are easy)

## 📝 Quick Railway Setup

```bash
# Install CLI
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

**Total time:** 5-10 minutes
**Result:** Fully working app with no crashes! 🚀

## 🆘 Still Want to Use Vercel?

If you must use Vercel for the backend, you need to:

1. **Upgrade to Vercel Pro** ($20/month) for 60s timeout
2. **Reduce dependencies** - remove matplotlib, seaborn, etc.
3. **Use external database** - replace file storage with Vercel KV
4. **Optimize imports** - lazy load heavy modules
5. **Accept slow cold starts** - 20-50 seconds on first request

This is a lot of work and still might not be reliable.

**Railway is the better choice for this backend.** 🚂

