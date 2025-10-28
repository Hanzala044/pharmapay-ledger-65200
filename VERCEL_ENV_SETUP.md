# Vercel Environment Variables Setup

## ✅ Verified Supabase Credentials

Your project uses the following Supabase instance:
- **Project URL**: `https://vklnjgljgnmirsudpquy.supabase.co`
- **Status**: ✅ Connection tested and working

## 🚀 How to Set Environment Variables in Vercel

### Step 1: Go to Your Vercel Project Settings
1. Open your project in Vercel Dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar

### Step 2: Add These Environment Variables

Add the following **TWO** environment variables:

#### Variable 1:
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://vklnjgljgnmirsudpquy.supabase.co`
- **Environments**: Check all (Production, Preview, Development)

#### Variable 2:
- **Key**: `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbG5qZ2xqZ25taXJzdWRwcXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDcwMDksImV4cCI6MjA3NjkyMzAwOX0.qx-E44W7r93dt2rukrqL-JnFtfBBlNMnk0aA0RuhAoA`
- **Environments**: Check all (Production, Preview, Development)

### Step 3: Redeploy
After adding the environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Or push a new commit to trigger automatic deployment

## ⚠️ Important Notes

1. **NO QUOTES**: Do NOT add quotes around the values in Vercel
2. **Case Sensitive**: Variable names must be EXACTLY as shown (with VITE_ prefix)
3. **All Environments**: Make sure to enable for Production, Preview, AND Development
4. **Redeploy Required**: Changes only take effect after redeployment

## 🔍 Troubleshooting

If you still see errors after setting environment variables:

1. **Check the variable names** - They must start with `VITE_`
2. **Verify no quotes** - Values should be plain text without quotes
3. **Redeploy** - Environment variables only apply to new deployments
4. **Check build logs** - Look for any error messages in Vercel deployment logs

## ✅ Verification

Your Supabase connection has been tested and verified working with:
- ✅ URL reachability
- ✅ Parties table access
- ✅ Transactions table access

The database is ready and waiting for data!
