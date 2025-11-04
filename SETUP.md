# 🚀 PharmaPay Ledger - Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

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
│   │   ├── ui/          # shadcn/ui components
│   │   ├── auth/        # Authentication components
│   │   ├── dashboard/   # Dashboard widgets
│   │   ├── parties/     # Party management
│   │   └── transactions/# Transaction components
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External integrations
│   │   └── supabase/    # Supabase client & types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   └── main.tsx         # Entry point
├── supabase/
│   ├── functions/       # Edge Functions
│   │   ├── auth-login/  # Custom authentication
│   │   └── setup-users/ # User setup utility
│   └── .env.example     # Edge function env template
├── public/              # Static assets
├── .env.example         # Frontend env template
└── .env.local           # Your local environment (gitignored)
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

## 🗄️ Database Setup

The application uses Supabase with the following tables:

- **parties** - Pharmaceutical business partners
- **transactions** - Financial transactions with GST
- **profiles** - User profile information
- **user_roles** - Role-based access control

Database is already configured and ready to use.

---

## 🌐 Environment Files

### Required Files

1. **`.env.local`** (Frontend - Local Development)
   - Contains Supabase URL and public key
   - Used by Vite during development
   - **Gitignored** - never commit this file

2. **`supabase/.env`** (Edge Functions - Optional)
   - Only needed if deploying edge functions
   - Contains service role key for admin operations
   - **Gitignored** - never commit this file

### Template Files

- **`.env.example`** - Template for frontend environment
- **`supabase/.env.example`** - Template for edge functions

---

## 🔐 Security Notes

### Safe to Expose
✅ `VITE_SUPABASE_URL` - Public Supabase project URL  
✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon/public key (protected by RLS)

### Never Expose
❌ `SUPABASE_SERVICE_ROLE_KEY` - Admin key (bypasses RLS)  
❌ `.env.local` file - Contains your credentials

---

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is busy, Vite will automatically use the next available port (e.g., 8081).

### Login Fails
1. Verify `.env.local` exists with correct credentials
2. Check Supabase edge functions are deployed
3. Check browser console for errors

### Blank Page
1. Clear browser cache
2. Check dev server is running
3. Verify environment variables are set

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

**Ready to start!** Run `npm run dev` and open http://localhost:8080 🚀
