# 🚀 GitHub Pages Deployment Guide

## ✅ Configuration Complete

Your project is now configured for GitHub Pages deployment!

---

## 📋 Setup Steps

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/Hanzala044/pharmapay-ledger-65200
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

### Step 2: Add GitHub Secrets

Your app needs Supabase credentials to work. Add them as GitHub Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these two secrets:

#### Secret 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://atgazgkilvuznodbubxs.supabase.co`

#### Secret 2:
- **Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs`

### Step 3: Deploy

You have two deployment options:

#### Option A: Automatic Deployment (Recommended)

The GitHub Action will automatically deploy when you push to `main`:

```powershell
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

The workflow will:
1. Build your app
2. Deploy to GitHub Pages
3. Make it available at: https://Hanzala044.github.io/pharmapay-ledger-65200

#### Option B: Manual Deployment

Deploy manually using the npm script:

```powershell
npm run deploy
```

---

## 🌐 Your Live URL

After deployment, your app will be available at:

**https://Hanzala044.github.io/pharmapay-ledger-65200**

---

## 📊 Monitor Deployment

1. Go to **Actions** tab in your repository
2. Watch the **Deploy to GitHub Pages** workflow
3. Once complete (green checkmark), your site is live!

---

## 🔧 What Was Configured

### 1. `vite.config.ts`
Added base path for GitHub Pages:
```typescript
base: '/pharmapay-ledger-65200/'
```

### 2. `package.json`
Added deployment scripts:
```json
"homepage": "https://Hanzala044.github.io/pharmapay-ledger-65200",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### 3. `.github/workflows/deploy.yml`
Created GitHub Actions workflow for automatic deployment

---

## 🔄 Update Deployment

Every time you push to `main`, GitHub Actions will automatically rebuild and redeploy your site.

Or manually deploy:
```powershell
npm run deploy
```

---

## 🐛 Troubleshooting

### Issue: 404 Page Not Found
- Check that GitHub Pages is enabled in Settings
- Verify the source is set to "GitHub Actions"
- Wait a few minutes after first deployment

### Issue: Blank Page
- Check browser console for errors
- Verify GitHub Secrets are set correctly
- Ensure base path in vite.config.ts matches repo name

### Issue: Build Fails
- Check the Actions tab for error logs
- Verify all dependencies are in package.json
- Ensure GitHub Secrets are added

### Issue: Supabase Connection Error
- Verify GitHub Secrets are set correctly
- Check that the keys don't have extra spaces
- Confirm Supabase project is active

---

## 📝 Environment Variables

The app uses these environment variables (set as GitHub Secrets):

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

These are injected during the build process by GitHub Actions.

---

## 🔐 Security Notes

✅ **Safe to use GitHub Secrets** - They're encrypted and only accessible during builds  
✅ **Anon key is safe** - It's meant to be public and protected by Row Level Security  
❌ **Never commit** `.env` or `.env.local` files  

---

## 📚 Additional Resources

- **GitHub Pages Docs:** https://docs.github.com/en/pages
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Vite Deployment Guide:** https://vitejs.dev/guide/static-deploy.html

---

**Ready to deploy!** 🚀

Follow the steps above to get your app live on GitHub Pages.
