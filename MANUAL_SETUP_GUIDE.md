# 🚨 Manual Setup Guide - Bypass Edge Functions

Since the edge functions are having deployment issues, let's create users manually.

## Option 1: Via Supabase Dashboard (EASIEST)

### Step 1: Create Users via Auth UI

1. **Go to**: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/auth/users

2. **Click "Add User"** button

3. **Create Owner Account:**
   - Email: `owner@pharmapay.local`
   - Password: `hamza`
   - ✅ Check "Auto Confirm User"
   - Click "Create User"

4. **Create Manager Account:**
   - Email: `manager@pharmapay.local`
   - Password: `admin123`
   - ✅ Check "Auto Confirm User"
   - Click "Create User"

### Step 2: Add Profiles and Roles via SQL

1. **Go to**: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/sql/new

2. **Copy and paste this SQL:**

```sql
-- Add profiles for the users
INSERT INTO public.profiles (id, username)
SELECT 
  id,
  CASE 
    WHEN email = 'owner@pharmapay.local' THEN 'mohd_hanif'
    WHEN email = 'manager@pharmapay.local' THEN 'manager'
  END as username
FROM auth.users
WHERE email IN ('owner@pharmapay.local', 'manager@pharmapay.local')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

-- Add roles for the users
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN email = 'owner@pharmapay.local' THEN 'owner'::app_role
    WHEN email = 'manager@pharmapay.local' THEN 'manager'::app_role
  END as role
FROM auth.users
WHERE email IN ('owner@pharmapay.local', 'manager@pharmapay.local')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify everything was created
SELECT 
  u.email,
  u.email_confirmed_at,
  p.username,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email IN ('owner@pharmapay.local', 'manager@pharmapay.local');
```

3. **Click "Run"**

4. **Verify** the output shows both users with their usernames and roles

### Step 3: Fix Edge Functions

The edge functions need to be properly deployed. Let me check the issue:

#### For auth-login function:

1. **Go to**: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/functions
2. **Check if `auth-login` exists**
3. If it exists, click on it and check:
   - Status should be "Active"
   - Check logs for errors
4. If it doesn't exist or has errors, **redeploy it**

#### Common Issues:
- Function not deployed
- Missing environment variables
- CORS configuration issue
- Function has syntax errors

### Step 4: Test Login

After creating users manually:

1. **Go to**: http://localhost:8080
2. **Login with**:
   - Username: `mohd_hanif`
   - Password: `hamza`

## Option 2: Use SQL Script (Advanced)

If you're comfortable with SQL, run the `create-users-manual.sql` file in the SQL Editor.

## 🔍 Troubleshooting Edge Functions

If edge functions still don't work:

### Check Function Deployment Status:
1. Go to Functions page
2. Look for deployment status
3. Check function logs

### Verify Environment Variables:
For `auth-login`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

For `setup-users`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (most important!)

### Alternative: Use Email/Password Login

If edge functions continue to fail, we can modify the app to use direct email login instead of username mapping:

1. Login with email directly: `owner@pharmapay.local` / `hamza`
2. We can update the UI later to show username

## 📝 Summary

**Quickest Path:**
1. Create users via Dashboard (Step 1)
2. Run SQL to add profiles/roles (Step 2)
3. Test login at http://localhost:8080

This bypasses the edge function issues completely!
