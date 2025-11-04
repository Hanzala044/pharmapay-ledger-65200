# 🚀 PharmaPay Ledger - Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

The `.env.local` file should contain:

```env
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:8080 in your browser.

---

## 🔐 Login Credentials

### Owner Account (Full Access)
- **Username:** `mohd_hanif`
- **Password:** `hamza`

### Manager Account (Limited Access)
- **Username:** `manager`
- **Password:** `admin123`

---

## 📁 Project Structure

```
pharmapay-ledger/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase integration
│   │   └── supabase/    # Supabase client & types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   └── main.tsx         # Entry point
├── supabase/
│   ├── functions/       # Edge Functions
│   │   ├── auth-login/  # Custom authentication
│   │   └── setup-users/ # User setup utility
│   └── setup-database.sql # Database schema
├── public/              # Static assets
├── .env.example         # Environment template
├── .env.local           # Your credentials (gitignored)
└── package.json         # Dependencies
```

---

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🌐 Environment Variables

### Required File: `.env.local`

This is the **ONLY** environment file you need. It contains all Supabase credentials.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Why One File?

- ✅ **Simple** - All credentials in one place
- ✅ **Secure** - File is gitignored, never committed
- ✅ **Deployment-friendly** - Easy to set in hosting platforms
- ✅ **No confusion** - No multiple .env files to manage

### For Deployment

When deploying to platforms like Vercel, Netlify, or others:

1. Add these two environment variables in your hosting dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. Use the same values from your `.env.local` file

---

## 🗄️ Database

The application connects to Supabase with these tables:

- **parties** - Pharmaceutical business partners
- **transactions** - Financial transactions with GST
- **profiles** - User profile information
- **user_roles** - Role-based access control

Database is pre-configured and ready to use.

---

## 🔐 Security Notes

### Safe to Expose
✅ `VITE_SUPABASE_URL` - Public project URL  
✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon/public key (protected by RLS)

These keys are safe to use in frontend code and can be exposed in your built application.

### Never Commit
❌ `.env.local` - Contains your credentials  
❌ `.env` - Any local environment file

The `.gitignore` file already excludes these.

---

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is busy, Vite will automatically use the next available port (e.g., 8081).

### Missing .env.local File
```bash
# Copy the example file
cp .env.example .env.local
```

### Login Fails
1. Verify `.env.local` exists with correct credentials
2. Check Supabase edge functions are deployed
3. Check browser console for errors

### Blank Page
1. Clear browser cache
2. Check dev server is running
3. Verify environment variables are set correctly

---

## 📚 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** TailwindCSS, shadcn/ui, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **State:** React Query, React Hook Form
- **Charts:** Recharts
- **PDF:** jsPDF

---

## 🎯 Features

- ✅ Transaction management with GST calculations
- ✅ Party (distributor) management
- ✅ Role-based access control (Owner/Manager)
- ✅ Real-time dashboard
- ✅ Financial reports and analytics
- ✅ PDF export functionality
- ✅ Payment tracking (Paid/Unpaid)
- ✅ Multiple payment types (Cash/UPI/Bank)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase dashboard logs
3. Check browser console for errors

---

**Ready to start!** 

1. Copy `.env.example` to `.env.local`
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:8080 🚀
