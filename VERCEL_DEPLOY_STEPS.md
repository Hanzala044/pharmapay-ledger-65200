# 🚀 Deploy PharmaPay to Vercel

## ✅ Code Already Pushed to GitHub
Repository: https://github.com/Hanzala044/pharmapay-ledger-65200

## 🎯 Deploy to Vercel (2 Options)

### Option 1: Via Vercel Dashboard (EASIEST - RECOMMENDED)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select your GitHub account
   - Find: `Hanzala044/pharmapay-ledger-65200`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** (IMPORTANT!)
   Click "Environment Variables" and add:
   
   ```
   VITE_SUPABASE_URL = https://atgazgkilvuznodbubxs.supabase.co
   
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
   ```

5. **Click "Deploy"**
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://pharmapay-ledger-65200.vercel.app`

6. **Update Supabase Auth URLs**
   After deployment, add your Vercel URL to Supabase:
   - Go to: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/auth/url-configuration
   - Add to "Redirect URLs":
     ```
     https://your-app.vercel.app/**
     https://your-app.vercel.app
     ```

### Option 2: Via Vercel CLI

If you prefer command line:

```powershell
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? pharmapay-ledger-65200
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://atgazgkilvuznodbubxs.supabase.co

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs

# Deploy to production
vercel --prod
```

## 🔧 Post-Deployment Configuration

### 1. Update Supabase CORS Settings

Add your Vercel domain to Supabase:

1. **Go to**: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/auth/url-configuration

2. **Add URLs**:
   - Site URL: `https://your-app.vercel.app`
   - Additional Redirect URLs:
     ```
     https://your-app.vercel.app/**
     https://your-app.vercel.app/auth
     ```

### 2. Test Your Deployment

1. Visit your Vercel URL
2. Try logging in with:
   - Username: `mohd_hanif`
   - Password: `hamza`

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Authentication Fails
- Verify environment variables are set correctly
- Check Supabase URL configuration includes Vercel domain
- Ensure edge functions are deployed in Supabase

### CORS Errors
- Add Vercel domain to Supabase Auth URLs
- Check edge function CORS headers
- Verify environment variables

## 📊 Deployment Status

After deployment, you can:
- View logs: Vercel Dashboard → Your Project → Deployments
- Monitor analytics: Vercel Dashboard → Analytics
- Set up custom domain: Vercel Dashboard → Settings → Domains

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:
```powershell
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically build and deploy the new version!

## 🎉 Success!

Your PharmaPay Ledger is now live on Vercel!
- Production URL: Check Vercel dashboard
- GitHub Repo: https://github.com/Hanzala044/pharmapay-ledger-65200
- Supabase Backend: https://atgazgkilvuznodbubxs.supabase.co
