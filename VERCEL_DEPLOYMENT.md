# 🚀 Deploy PharmaPay Ledger to Vercel

## Quick Deployment Guide

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Or upload the project folder directly

3. **Configure Project**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = https://atgazgkilvuznodbubxs.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd c:\Users\moham\Downloads\pharmapay-ledger-65200
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - Project name? **pharmapay-ledger** (or your choice)
   - Directory? **./  (just press Enter)**
   - Override settings? **N**

5. **Add Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Paste: https://atgazgkilvuznodbubxs.supabase.co
   
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
   # Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

### Option 3: Deploy via GitHub (Recommended for Teams)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PharmaPay Ledger"
   git branch -M main
   git remote add origin https://github.com/yourusername/pharmapay-ledger.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables (see Option 1, step 4)
   - Deploy

3. **Automatic Deployments**
   - Every push to `main` branch will auto-deploy
   - Pull requests get preview deployments

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] App loads at your Vercel URL
- [ ] Login page appears
- [ ] Can log in with credentials:
  - Email: `mohd_hanif@gmail.com` or `manager@gmail.com`
  - Password: (your set password)
- [ ] Dashboard loads after login
- [ ] Can view parties list (15 pre-loaded)
- [ ] Can create transactions
- [ ] Reports page works
- [ ] Logo/favicon appears correctly

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild locally first
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Environment Variables Not Working
- Make sure variables start with `VITE_`
- Redeploy after adding variables
- Check Vercel dashboard → Settings → Environment Variables

### Login Not Working
- Verify Supabase URL and key are correct
- Check Supabase dashboard → Settings → API
- Ensure users exist in Supabase Auth

### 404 Errors on Refresh
- Already handled by `vercel.json` rewrites
- If still happening, check Vercel dashboard → Settings → Rewrites

---

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `pharmapay.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

---

## 📊 Performance Tips

- ✅ Vercel automatically optimizes images
- ✅ CDN distribution worldwide
- ✅ Automatic HTTPS
- ✅ Gzip compression enabled
- ✅ HTTP/2 support

---

## 🔄 Update Deployment

### Via Git (if connected to GitHub)
```bash
git add .
git commit -m "Update description"
git push
# Vercel auto-deploys
```

### Via CLI
```bash
vercel --prod
```

### Via Dashboard
- Push changes to Git
- Vercel detects and deploys automatically

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Project Issues**: Check Vercel deployment logs

---

## 🎉 Success!

Your PharmaPay Ledger is now live on Vercel! 

**Share your URL:**
- Production: `https://your-project.vercel.app`
- Custom domain: `https://your-domain.com` (if configured)

**Login Credentials:**
- Owner: `mohd_hanif@gmail.com`
- Manager: `manager@gmail.com`

---

*Deployment guide for PharmaPay Ledger v1.0*
