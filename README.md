# 💊 PharmaPay Ledger

> A modern, full-featured pharmaceutical ledger management system for tracking transactions, managing parties, and generating financial reports.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Features

### 📊 Transaction Management
- **Create & Track Transactions** - Record sales with automatic GST calculations (CGST + SGST)
- **Multiple Payment Types** - Support for Cash, UPI, and Bank transfers
- **Payment Status Tracking** - Mark transactions as Paid or Unpaid
- **Invoice Management** - Track invoice numbers, PTR numbers, and cheque details
- **Payment Date Tracking** - Record when payments are received
- **Notes & Comments** - Add detailed notes to each transaction

### 🏢 Party Management
- **15 Pre-configured Parties** - Ready-to-use pharmaceutical distributors
- **Party Analytics** - View transaction history and outstanding balances per party
- **Quick Search** - Find parties instantly with smart search
- **Party Reports** - Generate detailed reports for each business partner

### 📈 Analytics & Reports
- **Real-time Dashboard** - Live updates of transactions and payments
- **Financial Overview** - Total sales, outstanding payments, and GST summaries
- **Monthly Reports** - Track performance month-over-month
- **Export Capabilities** - Download reports for accounting purposes
- **Visual Charts** - Interactive charts powered by Recharts

### 👥 Role-Based Access Control
- **Owner Role** - Full access to all features including payment status management
- **Manager Role** - Can create and edit transactions but cannot change payment status
- **Secure Authentication** - Username-based login with Supabase Auth
- **Profile Management** - User profiles with role assignments

### 🔒 Security Features
- **Row Level Security (RLS)** - Database-level security policies
- **Encrypted Authentication** - Secure user authentication via Supabase
- **Input Validation** - Comprehensive data validation and constraints
- **Audit Trail** - Track all changes with timestamps
- **Secure Edge Functions** - Server-side authentication logic

### ⚡ Real-time Features
- **Live Updates** - Changes sync automatically across all users
- **Instant Notifications** - Real-time transaction updates
- **Collaborative Editing** - Multiple users can work simultaneously
- **WebSocket Support** - Powered by Supabase Realtime

### 🎨 Modern UI/UX
- **Beautiful Interface** - Clean, modern design with shadcn/ui components
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready** - Prepared for dark mode implementation
- **Smooth Animations** - Polished user experience with smooth transitions
- **Keyboard Shortcuts** - Navigate efficiently with keyboard shortcuts
- **Loading States** - Clear feedback during data operations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd pharmapay-ledger-65200
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Windows
.\setup-env.ps1

# Or manually create .env.local
copy .env.example .env.local
```

4. **Setup database**
- Go to [Supabase SQL Editor](https://supabase.com/dashboard)
- Run the script from `supabase/setup-database.sql`

5. **Start development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:8080
```

📚 **For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)**

---

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool & dev server
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Lucide Icons](https://lucide.dev/)** - Modern icon library
- **[Recharts](https://recharts.org/)** - Data visualization

### Backend
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Authentication & authorization
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Realtime subscriptions
  - RESTful API

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 📁 Project Structure

```
pharmapay-ledger/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard widgets
│   │   └── transactions/   # Transaction components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication hook
│   │   └── use-toast.ts    # Toast notifications
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client & types
│   ├── pages/              # Page components
│   │   ├── Auth.tsx        # Login page
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Transactions.tsx # Transaction list
│   │   └── Reports.tsx     # Reports & analytics
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── auth-login/     # Custom authentication
│   │   └── setup-users/    # User setup utility
│   ├── migrations/         # Database migrations
│   └── setup-database.sql  # Complete setup script
├── public/                 # Static assets
├── .env.example            # Environment template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
├── vite.config.ts          # Vite config
└── README.md               # This file
```

---

## 📊 Database Schema

### Tables
- **parties** - Pharmaceutical business partners (15 pre-loaded)
- **transactions** - Financial transactions with GST
- **profiles** - User profile information
- **user_roles** - Role-based access control

### Key Features
- UUID primary keys
- Foreign key relationships
- Check constraints for data validation
- Indexes for query performance
- RLS policies for security
- Triggers for automation

📚 **For complete schema details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

---

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Role-based access control (Owner/Manager)
- ✅ Secure authentication via Supabase Auth
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Environment variable protection

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Full schema reference
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy Options
- **Vercel** - Recommended for React apps
- **Netlify** - Easy deployment with CI/CD
- **Supabase Storage** - Static hosting option

📚 **For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Required in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## 🎯 Roadmap

- [ ] Dark mode support
- [ ] PDF report generation
- [ ] Advanced filtering and sorting
- [ ] Bulk transaction import
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Inventory management integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend platform
- **shadcn/ui** - For beautiful UI components
- **Tailwind CSS** - For the utility-first CSS framework
- **React Team** - For the incredible UI library

---

## 📞 Support

- **Documentation**: Check the docs folder
- **Issues**: Open an issue on GitHub
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 🎉 Features Showcase

### Transaction Management
![Transaction Management](https://via.placeholder.com/800x400?text=Transaction+Management)

### Analytics Dashboard
![Analytics Dashboard](https://via.placeholder.com/800x400?text=Analytics+Dashboard)

### Party Management
![Party Management](https://via.placeholder.com/800x400?text=Party+Management)

---

**Built with ❤️ for pharmaceutical businesses**

*Last updated: October 26, 2024*
