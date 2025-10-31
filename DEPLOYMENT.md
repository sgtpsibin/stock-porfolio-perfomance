# Deployment Guide

## Environment Configuration

The application now uses environment variables for API configuration, making it ready for deployment.

### Frontend Environment Variables

The frontend uses `NEXT_PUBLIC_API_URL` to configure the backend API endpoint.

#### Local Development

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This file is already created and will be ignored by git.

#### Production Deployment

When deploying to production (e.g., Vercel, Netlify), set the environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Important:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

### Files Modified

1. **frontend/.env.local** - Local development environment variables (git-ignored)
2. **frontend/.env.example** - Template for environment variables (tracked in git)
3. **frontend/app/lib/portfolioStorage.ts** - Updated to use `process.env.NEXT_PUBLIC_API_URL`
4. **frontend/app/page.tsx** - Updated to use `process.env.NEXT_PUBLIC_API_URL`
5. **frontend/app/custom/page.tsx** - Updated to use `process.env.NEXT_PUBLIC_API_URL`
6. **frontend/.gitignore** - Updated to exclude `.env*.local` but track `.env.example`

### Backend Deployment

The backend (FastAPI) can be deployed to Vercel or other platforms.

#### Option 1: Vercel (Recommended - Same Platform as Frontend)

**Pros:**

- Same platform as frontend
- Easy deployment with Git integration
- Automatic HTTPS
- Free tier available

**Cons:**

- Serverless functions have 10-second timeout on free tier
- Cold starts may affect performance
- File system is read-only (portfolio storage uses JSON file)

**Setup:**

1. The backend is already configured for Vercel with:

   - `backend/vercel.json` - Vercel configuration
   - `backend/api/index.py` - Serverless function entry point
   - `backend/.vercelignore` - Files to exclude

2. Deploy to Vercel:

   ```bash
   cd backend
   vercel
   ```

3. Follow the prompts:

   - Link to existing project or create new
   - Set root directory to `backend`
   - Accept default settings

4. Your backend will be deployed to: `https://your-backend.vercel.app`

**Important Note:** The portfolio storage currently uses a JSON file (`default_portfolio.json`), which won't persist on Vercel's serverless environment. For production, consider:

- Using Vercel KV (Redis)
- Using a database (PostgreSQL, MongoDB)
- Using Vercel Postgres

#### Option 2: Other Platforms

1. **Railway** - Easy Python deployment with persistent storage
2. **Render** - Free tier available with persistent disk
3. **Heroku** - Classic PaaS
4. **AWS/GCP/Azure** - Cloud providers
5. **DigitalOcean App Platform** - Simple deployment

### Deployment Steps (Vercel - Both Frontend & Backend)

#### Step 1: Deploy Backend to Vercel

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

3. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   Follow the prompts:

   - "Set up and deploy?" → Yes
   - "Which scope?" → Select your account
   - "Link to existing project?" → No (first time)
   - "What's your project's name?" → `portfolio-tracking-backend` (or your choice)
   - "In which directory is your code located?" → `./`
   - "Want to override the settings?" → No

4. **Note the deployment URL** (e.g., `https://portfolio-tracking-backend.vercel.app`)

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

#### Step 2: Deploy Frontend to Vercel

1. **Navigate to frontend directory**:

   ```bash
   cd ../frontend
   ```

2. **Set environment variable** before deploying:

   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```

   When prompted:

   - Enter the value: `https://your-backend.vercel.app` (from Step 1)
   - Select environments: Production, Preview, Development

3. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   Follow the prompts similar to backend deployment.

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

#### Step 3: Alternative - Deploy via Vercel Dashboard

1. **Go to** [vercel.com](https://vercel.com)
2. **Import Git Repository**:

   - Click "Add New" → "Project"
   - Import your Git repository

3. **Deploy Backend**:

   - Select your repository
   - Set "Root Directory" to `backend`
   - Click "Deploy"
   - Note the deployment URL

4. **Deploy Frontend**:
   - Import the same repository again (or create a new project)
   - Set "Root Directory" to `frontend`
   - Add Environment Variable:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://your-backend.vercel.app`
   - Click "Deploy"

#### Step 4: Verify Deployment

1. Visit your deployed frontend URL
2. Open browser console (F12)
3. Test the following:
   - Navigate to Config page
   - Add/modify portfolio stocks
   - View performance charts
4. Check for any CORS or API connection errors

### ⚠️ Important: Portfolio Storage on Vercel

**The current implementation uses file-based storage (`default_portfolio.json`), which won't persist on Vercel's serverless environment.**

Each serverless function invocation gets a fresh, read-only file system. Portfolio changes will reset after each deployment or cold start.

**Solutions for Production:**

1. **Use Vercel KV (Redis)** - Recommended for simple key-value storage
2. **Use Vercel Postgres** - For relational data
3. **Use external database** - MongoDB Atlas, Supabase, etc.
4. **Deploy backend to Railway/Render** - These platforms have persistent file systems

For now, the app will work but portfolio configurations won't persist between deployments.

### Local Testing

To test locally with the environment variable:

```bash
cd frontend
npm run dev
```

The app will use the `NEXT_PUBLIC_API_URL` from `.env.local`.

### Troubleshooting

**Issue:** API calls fail with CORS errors

- **Solution:** Ensure backend CORS settings allow your frontend domain

**Issue:** Environment variable not working

- **Solution:** Restart the Next.js dev server after changing `.env.local`

**Issue:** 404 errors on API calls

- **Solution:** Verify the `NEXT_PUBLIC_API_URL` doesn't have a trailing slash

### Security Notes

- Never commit `.env.local` or any file containing production secrets
- The `.env.example` file should only contain example values, not real credentials
- Use different API URLs for development, staging, and production environments
