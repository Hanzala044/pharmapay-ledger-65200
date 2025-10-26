# PharmaPay Ledger - Deployment Guide

## 📦 Complete Setup & Deployment Instructions

This guide will help you set up and deploy your PharmaPay Ledger application with Supabase.

## 🎯 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Supabase CLI (optional, for edge functions)

## 🔧 Step-by-Step Setup

### 1. Configure Environment Variables

#### For Local Development:

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
copy .env.example .env.local
```

The file should contain:
```env
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
```

### 2. Set Up Supabase Database

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project: **pharma_ledger | HANZALA ROKZZ**
3. Navigate to **SQL Editor**
4. Open the file `supabase/setup-database.sql`
5. Copy and paste the entire script
6. Click **Run** to execute

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref atgazgkilvuznodbubxs

# Run migrations
supabase db push
```

### 3. Deploy Edge Functions

Your project has the following edge functions:
- `auth-login` - Custom authentication with username
- `setup-users` - Initial user setup

#### Deploy via Supabase Dashboard:

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Deploy new function**
3. Upload each function folder from `supabase/functions/`

#### Deploy via Supabase CLI:

```bash
# Set environment variables for edge functions
supabase secrets set SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Deploy functions
supabase functions deploy auth-login
supabase functions deploy setup-users
```

### 4. Create Initial Users

#### Option A: Run setup-users Edge Function

```bash
# Using curl or Postman
curl -X POST https://atgazgkilvuznodbubxs.supabase.co/functions/v1/setup-users \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Option B: Manual User Creation

1. Go to **Authentication** in Supabase Dashboard
2. Click **Add User**
3. Create users with the following details:

**Owner Account:**
- Email: `owner@pharmapay.local`
- Password: (your choice)
- User Metadata: `{"username": "mohd_hanif"}`

**Manager Account:**
- Email: `manager@pharmapay.local`
- Password: (your choice)
- User Metadata: `{"username": "manager"}`

4. After creating users, assign roles in the `user_roles` table:

```sql
-- In SQL Editor
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'owner@pharmapay.local'), 'owner'),
  ((SELECT id FROM auth.users WHERE email = 'manager@pharmapay.local'), 'manager');
```

### 5. Install Dependencies & Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### 6. Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment Options

### Option 1: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify Dashboard

### Option 3: Supabase Storage (Static Hosting)

1. Build the application:
```bash
npm run build
```

2. Upload the `dist` folder to Supabase Storage
3. Configure as a public bucket
4. Enable website hosting

## 🔐 Security Checklist

- [ ] Database setup script executed successfully
- [ ] RLS policies enabled on all tables
- [ ] Edge functions deployed with correct environment variables
- [ ] Initial users created with proper roles
- [ ] `.env.local` file added to `.gitignore`
- [ ] Service role key kept secure (never commit to git)

## 📊 Verify Deployment

### Check Database:
1. Go to **Table Editor** in Supabase
2. Verify tables exist: `parties`, `transactions`, `profiles`, `user_roles`
3. Check that 15 parties are pre-populated

### Check Authentication:
1. Try logging in with created credentials
2. Verify role-based access works correctly

### Check Edge Functions:
1. Go to **Edge Functions** in Supabase
2. Verify functions are deployed and running
3. Check function logs for any errors

## 🐛 Troubleshooting

### Database Issues:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check user roles
SELECT * FROM public.user_roles;
```

### Authentication Issues:
- Verify edge functions are deployed
- Check function logs in Supabase Dashboard
- Ensure environment variables are set correctly

### Build Issues:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

## 📱 Features Overview

### For Owners:
- ✅ Create and manage parties
- ✅ Create and edit transactions
- ✅ Mark transactions as Paid/Unpaid
- ✅ View all reports and analytics
- ✅ Full access to all features

### For Managers:
- ✅ View parties
- ✅ Create and edit transactions
- ✅ View reports
- ❌ Cannot mark transactions as Paid/Unpaid

## 🎨 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: React Context + Hooks
- **Routing**: React Router
- **Forms**: React Hook Form
- **Charts**: Recharts

## 📞 Support

If you encounter any issues:

1. Check the [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide
2. Review Supabase logs in the Dashboard
3. Check browser console for errors
4. Verify all environment variables are set

## 🎉 Success!

Once everything is set up, you should be able to:
- ✅ Log in with username/password
- ✅ View and manage parties
- ✅ Create and track transactions
- ✅ Generate reports and analytics
- ✅ Real-time updates across all users

Your PharmaPay Ledger is now fully deployed and ready to use! 🚀
