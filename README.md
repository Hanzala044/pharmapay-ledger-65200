# 💊 PharmaPay Ledger

> A modern pharmaceutical ledger management system for tracking transactions, managing parties, and generating financial reports.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

### 📊 Core Functionality
- **Transaction Management** - Record sales with automatic GST calculations (CGST + SGST)
- **Party Management** - Manage pharmaceutical distributors and business partners
- **Payment Tracking** - Track payment status (Paid/Unpaid) and payment dates
- **Multiple Payment Types** - Support for Cash, UPI, and Bank transfers
- **Invoice Management** - Track invoice numbers, PTR numbers, and cheque details

### 📈 Analytics & Reports
- **Real-time Dashboard** - Live updates of transactions and payments
- **Financial Overview** - Total sales, outstanding payments, and GST summaries
- **Visual Charts** - Interactive charts powered by Recharts
- **PDF Export** - Download reports for accounting purposes

### 👥 Access Control
- **Owner Role** - Full access including payment status management
- **Manager Role** - Can create/edit transactions but cannot change payment status
- **Secure Authentication** - Username-based login with Supabase Auth

### 🎨 Modern UI/UX
- **Beautiful Interface** - Clean design with shadcn/ui components
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished user experience

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd pharmapay-ledger-65200

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Start development server
npm run dev
```

Open http://localhost:8080 in your browser.

### Login Credentials

**Owner Account:**
- Username: `mohd_hanif`
- Password: `hamza`

**Manager Account:**
- Username: `manager`
- Password: `admin123`

---

## 📁 Project Structure

```
pharmapay-ledger/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── integrations/    # Supabase integration
│   ├── pages/           # Page components
│   └── lib/             # Utilities
├── supabase/
│   └── functions/       # Edge Functions
├── public/              # Static assets
└── .env.local           # Environment variables
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS + shadcn/ui
- React Router
- React Query
- Recharts

**Backend**
- Supabase (PostgreSQL)
- Supabase Auth
- Edge Functions (Deno)
- Row Level Security (RLS)

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔐 Environment Variables

**Single file approach** - All credentials in one place!

Create a `.env.local` file (copy from `.env.example`):

```env
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

**For deployment:** Set these same variables in your hosting platform's environment settings.

---

## 🎯 Key Features Breakdown

### Transaction Management
- Create, edit, and delete transactions
- Automatic GST calculation (CGST + SGST)
- Track invoice and PTR numbers
- Add notes and comments
- Filter by date, party, and status

### Party Management
- Add and manage pharmaceutical distributors
- View transaction history per party
- Track outstanding balances
- Quick search functionality

### Reports & Analytics
- Daily and monthly transaction summaries
- Payment status distribution
- Top parties by transaction volume
- Monthly trend analysis
- Export to PDF

### Role-Based Access
- **Owner** - Full system access
- **Manager** - Limited access (cannot change payment status)
- Secure session management
- Profile-based permissions

---

## 🐛 Troubleshooting

**Port already in use?**
- Vite will automatically use the next available port

**Login fails?**
- Check `.env.local` file exists
- Verify Supabase credentials are correct

**Blank page?**
- Clear browser cache
- Check browser console for errors

See [SETUP.md](./SETUP.md) for more troubleshooting tips.

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **Supabase** - Backend platform
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling framework
- **React Team** - UI library

---

**Built with ❤️ for pharmaceutical businesses**

*For detailed setup instructions, see [SETUP.md](./SETUP.md)*
