# 🚀 Deployment Guide

## 📋 Environment Variables

Your app uses **ONE** `.env.local` file with these variables:

```env
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
```

---

## 🌐 Deploy to Vercel

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository

### 3. Configure Environment Variables
In Vercel dashboard, add these **2 variables**:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://atgazgkilvuznodbubxs.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 4. Deploy
Click "Deploy" - Done! ✅

---

## 🌐 Deploy to Netlify

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Import to Netlify
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository

### 3. Configure Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 4. Add Environment Variables
In Netlify dashboard, add these **2 variables**:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://atgazgkilvuznodbubxs.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 5. Deploy
Click "Deploy site" - Done! ✅

---

## 🌐 Deploy to Other Platforms

### Render, Railway, Fly.io, etc.

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`

**Environment Variables:**
Add the same 2 variables from `.env.local`

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables added to hosting platform
- [ ] Build command set to `npm run build`
- [ ] Output directory set to `dist`
- [ ] Deploy triggered
- [ ] Site loads correctly
- [ ] Login works
- [ ] No console errors

---

## 🔐 Security

### Safe to Expose
✅ Both environment variables are **safe** to use in frontend code  
✅ Protected by Supabase Row Level Security (RLS)  
✅ Can be committed to hosting platforms

### Never Commit
❌ `.env.local` file to Git  
❌ Any file with actual credentials

---

## 🐛 Troubleshooting

### Build Fails
- Check all dependencies are in `package.json`
- Verify Node.js version is 18+
- Check build logs for specific errors

### Environment Variables Not Working
- Ensure variable names start with `VITE_`
- Redeploy after adding variables
- Check hosting platform's environment variable syntax

### App Loads But Login Fails
- Verify Supabase credentials are correct
- Check Supabase edge functions are deployed
- Check browser console for errors

---

## 📝 Notes

- **No build step needed locally** - Just `npm run dev`
- **Single source of truth** - All credentials in `.env.local`
- **Easy updates** - Change in one place, redeploy
- **Platform agnostic** - Works with any hosting service

---

**Your app is deployment-ready!** 🎉

Just add the 2 environment variables to your hosting platform and deploy.
