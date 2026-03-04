# Climate Dashboard - Deployment Guide 🚀

## 🏗️ Architecture Overview

Your Climate Dashboard has two parts:
- **Frontend (React)**: Can be hosted on Vercel
- **Backend (Flask API)**: Needs separate hosting (Python server)

## ✅ Current Status
- ✅ `.env` file is in `.gitignore` (API keys are safe)
- ✅ Frontend ready for Vercel deployment
- ❌ Backend needs deployment setup

---

## 🎯 Deployment Options

### Option 1: Vercel for Frontend + Render for Backend (RECOMMENDED)

#### Frontend on Vercel
1. Already hosted on Vercel
2. Update build settings if needed:
   - **Framework**: Vite
   - **Root Directory**: `frontend/climate`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Backend on Render (FREE)
1. Go to [render.com](https://render.com)
2. Create a **New Web Service**
3. Connect your GitHub repository
4. Settings:
   - **Name**: climate-dashboard-api
   - **Region**: Choose closest
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free
5. Add Environment Variables:
   ```
   WEATHER_API_KEY=your_weather_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   ```
6. Deploy!

**Your API will be at**: `https://climate-dashboard-api.onrender.com`

---

### Option 2: Railway for Backend (FREE with Credit)

1. Go to [railway.app](https://railway.app)
2. **New Project** → Deploy from GitHub
3. Select your repository
4. Add Environment Variables (same as above)
5. Railway auto-detects Python and runs it

**Your API will be at**: `https://[your-app].up.railway.app`

---

### Option 3: Vercel for BOTH Frontend + Backend

Vercel can host Python APIs too!

1. Create `vercel.json` in the root:
```json
{
  "builds": [
    {
      "src": "frontend/climate/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/climate/dist/$1"
    }
  ]
}
```

2. Add Environment Variables in Vercel Dashboard
3. Deploy!

---

## 📝 After Backend is Deployed

### Update Frontend API URL

Edit `frontend/climate/src/App.jsx` to use your backend URL:

**Before:**
```javascript
const dataRes = await axios.get(`http://127.0.0.1:5000/api/data?city=${city}&days=${days}`);
```

**After:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com';
const dataRes = await axios.get(`${API_BASE_URL}/api/data?city=${city}&days=${days}`);
```

### Add Environment Variable to Vercel

In Vercel dashboard, add:
```
VITE_API_URL=https://climate-dashboard-api.onrender.com
```

---

## 🔒 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ API keys NOT committed to GitHub
- ✅ Environment variables set in hosting platform
- ⚠️ Need to update CORS settings in `backend/app.py`

### Update CORS Settings

Edit `backend/app.py`:
```python
# Add your Vercel domain
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-vercel-app.vercel.app"
])
```

---

## 🚀 Deployment Steps Summary

### 1. Push Code to GitHub (Safe)
```bash
cd d:\Mausam\Climate_Dashboard
git add .
git commit -m "Setup for deployment"
git push origin main
```

### 2. Deploy Backend
- Choose a platform (Render, Railway, or Vercel)
- Add environment variables
- Deploy

### 3. Update Frontend
- Add backend URL to environment variables
- Update API calls to use backend URL
- Redeploy frontend on Vercel

### 4. Test
- Visit your Vercel URL
- Check if data loads correctly
- Verify API calls work

---

## 💰 Cost Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Render** | Yes, with limitations | Backend APIs (my recommendation) |
| **Railway** | $5 credit/month | Quick deployment |
| **Vercel** | Yes, generous | Both frontend + backend |
| **Heroku** | No longer free | - |
| **PythonAnywhere** | Yes, limited | Simple Python apps |

---

## 🆘 Common Issues

### Issue: Frontend can't connect to backend
**Solution**: Update CORS settings and API URLs

### Issue: Backend crashes on startup
**Solution**: Check Python version (3.8+) and installed packages

### Issue: "Module not found" error
**Solution**: Ensure `requirements.txt` is complete and correct

### Issue: API keys not working
**Solution**: Verify environment variables are set in hosting platform

---

## 📚 Resources

- [Render Python Deployment](https://render.com/docs/deploy-flask)
- [Railway Python Guide](https://docs.railway.app/languages/python)
- [Vercel Python Functions](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## 🎉 Ready to Deploy?

1. ✅ Code is ready
2. ✅ API keys are safe
3. ✅ Choose a backend hosting platform
4. ✅ Follow the steps above

**Need help?** Check the troubleshooting section or create an issue on GitHub!
