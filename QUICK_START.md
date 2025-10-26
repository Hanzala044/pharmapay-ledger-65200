# PharmaPay Ledger - Quick Start Guide 🚀

## ⚡ Get Started in 5 Minutes

This guide will get your PharmaPay Ledger up and running quickly.

---

## 📋 Prerequisites

- ✅ Node.js installed (v18+)
- ✅ Supabase account
- ✅ Access to: https://atgazgkilvuznodbubxs.supabase.co

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Configure Environment (30 seconds)

Run the setup script:

```powershell
.\setup-env.ps1
```

Or manually create `.env.local`:

```env
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
```

### Step 2: Setup Database (2 minutes)

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/sql)
2. Open `supabase/setup-database.sql`
3. Copy & paste the entire script
4. Click **Run**

✅ This creates all tables, policies, and pre-populates 15 pharmaceutical parties!

### Step 3: Install & Run (2 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

🎉 Open http://localhost:8080

---

## 👥 Default Users

After database setup, create users in [Supabase Auth](https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/auth/users):

### Owner Account
- **Username**: `mohd_hanif`
- **Email**: `owner@pharmapay.local`
- **Password**: (your choice)
- **Role**: Owner (full access)

### Manager Account
- **Username**: `manager`
- **Email**: `manager@pharmapay.local`
- **Password**: (your choice)
- **Role**: Manager (limited access)

**Don't forget to assign roles!** Run this in SQL Editor after creating users:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'owner@pharmapay.local'), 'owner'),
  ((SELECT id FROM auth.users WHERE email = 'manager@pharmapay.local'), 'manager');
```

---

## 🎨 Features at a Glance

### 💼 For Owners
- ✅ Manage all 15 pharmaceutical parties
- ✅ Create & edit transactions
- ✅ Mark payments as Paid/Unpaid
- ✅ View analytics & reports
- ✅ Export data

### 👨‍💼 For Managers
- ✅ View all parties
- ✅ Create & edit transactions
- ✅ View reports
- ❌ Cannot change payment status

---

## 📊 Pre-loaded Data

Your database comes with 15 pharmaceutical parties:

1. ISHA PHARMA
2. AMBIKA PHARMA
3. JAI PHARMA
4. SUVARNA ENTERPRISES
5. PHYDE MARKETING
6. BHARNI ENTERPRISES
7. RAJ AGENCY (BANGALORE)
8. RAMA STORE
9. RAJ COSMETICS
10. LYFE CARE DIPERS
11. SURABHI ENTERPRISES
12. JANATHA PHARMA
13. JAN AUSHADHI (HUBLI)
14. JAN AUSHADHI (MYSURU)
15. JAN AUSHADHI (BANGALORE)

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server (port 8080)
npm run build            # Build for production
npm run preview          # Preview production build

# Database
# Run migrations in Supabase SQL Editor
# File: supabase/setup-database.sql
```

---

## 📁 Project Structure

```
pharmapay-ledger/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks (useAuth, etc.)
│   ├── integrations/   # Supabase client & types
│   ├── pages/          # Page components
│   └── lib/            # Utilities
├── supabase/
│   ├── functions/      # Edge functions
│   ├── migrations/     # Database migrations
│   └── setup-database.sql  # Complete setup script
├── .env.example        # Environment template
├── .env.local          # Your local config (create this)
└── package.json        # Dependencies
```

---

## 🐛 Troubleshooting

### Can't see database tables?
```bash
# Make sure you ran the setup script in Supabase SQL Editor
# File: supabase/setup-database.sql
```

### Login not working?
1. Check users exist in Supabase Auth
2. Verify roles are assigned in `user_roles` table
3. Check edge functions are deployed

### Build errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

For detailed information, see:

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Full schema reference
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[README.md](./README.md)** - Project overview

---

## 🎯 Next Steps

1. ✅ Complete the 3-step setup above
2. ✅ Create your first transaction
3. ✅ Explore the analytics dashboard
4. ✅ Customize for your needs
5. ✅ Deploy to production

---

## 💡 Pro Tips

- **Keyboard Shortcuts**: Navigate quickly with keyboard shortcuts in the app
- **Realtime Updates**: Changes sync automatically across all users
- **Export Data**: Download reports as CSV for accounting
- **Mobile Friendly**: Works great on tablets and phones
- **Dark Mode**: Coming soon!

---

## 🆘 Need Help?

1. Check the documentation files listed above
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Verify environment variables are set

---

## 🎉 You're All Set!

Your PharmaPay Ledger is ready to use. Start managing your pharmaceutical transactions with ease!

**Happy tracking! 📊💊**

---

## 📞 Support

- **Supabase Dashboard**: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs
- **Project URL**: https://atgazgkilvuznodbubxs.supabase.co
- **Local Dev**: http://localhost:8080

---

*Last updated: October 26, 2024*
