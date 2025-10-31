# Quick Vercel Deployment Guide

## Prerequisites

- Vercel account (free tier works)
- Vercel CLI installed: `npm install -g vercel`
- Git repository pushed to GitHub/GitLab/Bitbucket

## 🚀 Quick Deploy (5 minutes)

### Method 1: Using Vercel CLI

```bash
# 1. Deploy Backend
cd backend
vercel --prod

# Note the URL (e.g., https://your-backend.vercel.app)

# 2. Deploy Frontend
cd ../frontend
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.vercel.app (from step 1)

vercel --prod
```

### Method 2: Using Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com/new)**

2. **Deploy Backend:**
   - Import your Git repository
   - Set "Root Directory" to `backend`
   - Click "Deploy"
   - Copy the deployment URL

3. **Deploy Frontend:**
   - Import the same repository (create new project)
   - Set "Root Directory" to `frontend`
   - Add Environment Variable:
     - `NEXT_PUBLIC_API_URL` = `https://your-backend.vercel.app`
   - Click "Deploy"

## 📁 Files Created for Vercel

The following files have been added to make the backend Vercel-compatible:

- **`backend/vercel.json`** - Vercel configuration
- **`backend/api/index.py`** - Serverless function entry point
- **`backend/.vercelignore`** - Files to exclude from deployment

## ⚠️ Known Limitations

### Portfolio Storage Won't Persist

The current implementation uses file-based storage (`default_portfolio.json`), which **won't persist** on Vercel's serverless environment.

**What this means:**
- Portfolio configurations will reset after each deployment
- Changes won't persist between cold starts
- Each user will see the default portfolio

**Quick Fixes:**

#### Option A: Use Vercel KV (Recommended)

1. Enable Vercel KV in your project dashboard
2. Install: `pip install vercel-kv`
3. Update storage functions in `main.py` (see DEPLOYMENT.md)

#### Option B: Deploy Backend to Railway/Render

These platforms have persistent file systems:
- **Railway**: `railway up` (from backend directory)
- **Render**: Connect Git repo, select Python environment

## 🔧 Configuration

### Environment Variables

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

**Backend:**
- `FRONTEND_URL` - Frontend URL for CORS (optional, currently allows all)

### CORS Settings

The backend is currently configured to allow all origins (`allow_origins=["*"]`).

For production, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",
        "http://localhost:3000"  # for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Testing Deployment

After deployment, test these features:

1. **Home Page** - Should load without errors
2. **Config Page** - Can add/edit stocks (won't persist on Vercel)
3. **Custom Analysis** - Can analyze custom portfolios
4. **Performance Charts** - Should display data correctly

Check browser console (F12) for any errors.

## 🐛 Troubleshooting

### Backend deployment fails

**Error:** `No Python version specified`
- **Fix:** Vercel auto-detects Python from `requirements.txt`
- Ensure `requirements.txt` is in the `backend/` directory

### Frontend can't connect to backend

**Error:** `Failed to fetch` or CORS errors
- **Fix:** Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend URL doesn't have trailing slash
- Check backend CORS settings

### Portfolio changes don't persist

**Expected behavior** on Vercel serverless
- **Fix:** Implement Vercel KV or use Railway/Render for backend

### Cold start timeout

**Error:** `Function execution timed out`
- **Cause:** vnstock API calls can be slow
- **Fix:** 
  - Upgrade to Vercel Pro (60s timeout)
  - Or deploy backend to Railway/Render (no timeout limits)

## 📊 Performance Considerations

### Vercel Serverless Limits (Free Tier)

- **Timeout:** 10 seconds per function
- **Memory:** 1024 MB
- **Deployments:** Unlimited
- **Bandwidth:** 100 GB/month

### Optimization Tips

1. **Cache API responses** - Reduce vnstock API calls
2. **Reduce data points** - Already implemented in the code
3. **Use CDN** - Vercel automatically does this for frontend
4. **Consider Pro plan** - If you hit timeout limits

## 🔄 Continuous Deployment

Once connected to Git:

1. **Push to main branch** → Auto-deploys to production
2. **Push to other branches** → Creates preview deployments
3. **Pull requests** → Automatic preview URLs

## 📚 Additional Resources

- [Vercel Python Documentation](https://vercel.com/docs/functions/runtimes/python)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

## 💡 Recommended Production Setup

For a production-ready deployment:

1. **Backend:** Deploy to Railway or Render (persistent storage)
2. **Frontend:** Deploy to Vercel (optimal for Next.js)
3. **Database:** Use PostgreSQL or MongoDB for portfolio storage
4. **Monitoring:** Add Sentry or similar for error tracking
5. **Analytics:** Add Google Analytics or Plausible

This gives you the best of both worlds: persistent storage for backend and optimal Next.js hosting for frontend.

