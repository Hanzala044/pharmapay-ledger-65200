# 🔧 Fix CORS Error - Quick Solution Guide

## ❌ Current Problem
Your dashboard is showing CORS errors because the **Supabase Edge Function `auth-login` is not deployed yet**.

## ✅ Solution: Deploy Edge Function via Supabase Dashboard

### Step 1: Install Supabase CLI (Windows)

Open PowerShell as Administrator and run:

```powershell
# Using Chocolatey (if you have it)
choco install supabase

# OR download directly from GitHub
# Go to: https://github.com/supabase/cli/releases
# Download: supabase_windows_amd64.zip
# Extract and add to PATH
```

**Alternative: Use Supabase Dashboard (No CLI needed)**

### Step 2: Deploy Edge Function via Dashboard (EASIEST METHOD)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Click "Deploy new function"

3. **Create `auth-login` function**
   - Function name: `auth-login`
   - Copy the code from: `supabase/functions/auth-login/index.ts`
   - Paste it into the editor
   - Click "Deploy"

4. **Set Environment Variables for the function**
   - In the function settings, add:
     - `SUPABASE_URL`: `https://atgazgkilvuznodbubxs.supabase.co`
     - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs`

### Step 3: Configure Authentication Settings

1. **Go to Authentication Settings**
   - URL: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/auth/url-configuration

2. **Add Site URLs**
   - Site URL: `http://localhost:8080`
   - Additional Redirect URLs:
     ```
     http://localhost:8080/**
     http://10.234.85.30:8080/**
     http://127.0.0.1:8080/**
     ```

### Step 4: Verify Database Setup

Make sure your database tables are created:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the script from `supabase/setup-database.sql`
3. This creates all necessary tables and users

### Step 5: Test Your Application

1. Restart your dev server (already running)
2. Open: http://localhost:8080/
3. Try logging in with:
   - Username: `mohd_hanif`
   - Password: `owner123`

## 🎯 Quick CLI Method (If you get CLI working)

```powershell
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref atgazgkilvuznodbubxs

# Set secrets
supabase secrets set SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs

# Deploy the function
supabase functions deploy auth-login
```

## 📝 Summary

The CORS error happens because:
1. ❌ Edge function `auth-login` is NOT deployed
2. ❌ Supabase returns CORS error for non-existent endpoints
3. ✅ Once deployed, the function's CORS headers will work properly

**Priority Action**: Deploy the `auth-login` edge function using Supabase Dashboard (Step 2 above)
