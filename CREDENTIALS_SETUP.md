# 🔑 Supabase Credentials Setup Guide

## ✅ Verified Credentials for Project: atgazgkilvuznodbubxs

### 📋 Environment Variables

#### For Frontend (.env or .env.local)
```env
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
```

#### For Edge Functions (supabase/.env)
```env
SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ1OTMwOCwiZXhwIjoyMDc3MDM1MzA4fQ.1mDmWygZkUNP0RTLv9wqDQJl_ZfixpiSfQDWOEqTgks
```

---

## 🚀 Setup Instructions

### Step 1: Create Frontend Environment File

**Windows PowerShell:**
```powershell
# Copy the example file
Copy-Item .env.example .env.local

# Or create manually with the content above
```

**Manual Creation:**
1. Create a file named `.env.local` in the project root
2. Copy the frontend environment variables from above
3. Save the file

### Step 2: Create Edge Functions Environment File

**Windows PowerShell:**
```powershell
# Navigate to supabase folder
cd supabase

# Copy the example file
Copy-Item .env.example .env

# Or create manually with the content above
cd ..
```

**Manual Creation:**
1. Create a file named `.env` in the `supabase` folder
2. Copy the edge functions environment variables from above
3. Save the file

### Step 3: Verify Files Created

Your project should now have:
- ✅ `.env.local` (in project root) - for frontend
- ✅ `supabase/.env` (in supabase folder) - for edge functions

---

## 🔐 Security Notes

### ⚠️ IMPORTANT: Never Commit These Files

The following files are gitignored and should NEVER be committed:
- `.env`
- `.env.local`
- `supabase/.env`

### 🔑 Key Types Explained

1. **Anon/Public Key** (`VITE_SUPABASE_PUBLISHABLE_KEY`)
   - ✅ Safe to expose in client-side code
   - Used for public API access
   - Protected by Row Level Security (RLS)

2. **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`)
   - ⚠️ **NEVER expose to client**
   - Only use in server-side code (Edge Functions)
   - Bypasses Row Level Security
   - Has full database access

---

## 📊 Project Information

- **Project ID:** `atgazgkilvuznodbubxs`
- **Project URL:** `https://atgazgkilvuznodbubxs.supabase.co`
- **Dashboard:** `https://supabase.com/dashboard/project/atgazgkilvuznodbubxs`

---

## ✅ Verification Checklist

After setting up the environment files:

- [ ] `.env.local` exists in project root
- [ ] `supabase/.env` exists in supabase folder
- [ ] Both files contain the correct credentials
- [ ] No quotes around the values
- [ ] Files are listed in `.gitignore`
- [ ] Run `npm run dev` to test frontend connection
- [ ] Test edge functions with `supabase functions serve`

---

## 🧪 Test Your Setup

### Test Frontend Connection
```powershell
npm run dev
```
Then open http://localhost:8080 and try to log in.

### Test Edge Functions
```powershell
# Deploy edge functions
supabase functions deploy auth-login
supabase functions deploy setup-users

# Or serve locally
supabase functions serve
```

---

## 🚨 Troubleshooting

### Issue: "Invalid API key"
- ✅ Check that keys don't have quotes around them
- ✅ Verify keys are copied completely (they're very long)
- ✅ Ensure variable names match exactly (case-sensitive)

### Issue: "Cannot connect to Supabase"
- ✅ Check URL is correct: `https://atgazgkilvuznodbubxs.supabase.co`
- ✅ Verify you have internet connection
- ✅ Check Supabase project is active in dashboard

### Issue: Edge functions fail
- ✅ Ensure `supabase/.env` exists with all 3 variables
- ✅ Verify service role key is correct
- ✅ Check edge function logs in Supabase dashboard

---

## 📚 Additional Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/atgazgkilvuznodbubxs
- **API Documentation:** https://supabase.com/docs/reference/javascript/introduction
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **Environment Variables:** https://supabase.com/docs/guides/getting-started/local-development#environment-variables

---

**Last Updated:** November 1, 2025  
**Status:** ✅ All credentials verified and updated
