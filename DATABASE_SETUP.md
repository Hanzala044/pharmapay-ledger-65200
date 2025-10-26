# PharmaPay Ledger - Database Setup Guide

## 🗄️ Supabase Database Configuration

Your Supabase project is configured with the following credentials:

- **Project URL**: `https://atgazgkilvuznodbubxs.supabase.co`
- **API Key (anon/public)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs`

## 📋 Database Schema Overview

The PharmaPay Ledger uses the following tables:

### 1. **parties** - Pharmaceutical Business Partners
- Stores information about pharmaceutical distributors and suppliers
- Pre-populated with 15 party accounts

### 2. **transactions** - Financial Transactions
- Records all financial transactions with parties
- Includes GST calculations (CGST + SGST)
- Supports multiple payment types (Cash, UPI, Bank)
- Tracks payment status (Paid/Unpaid)

### 3. **profiles** - User Profiles
- Stores user profile information
- Links to Supabase Auth users

### 4. **user_roles** - User Role Management
- Manages user roles (Owner, Manager)
- Controls access permissions

## 🚀 Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **pharma_ledger | HANZALA ROKZZ**
4. Navigate to the **SQL Editor** in the left sidebar

### Step 2: Run the Database Setup Script

1. Open the file `supabase/setup-database.sql` in this repository
2. Copy the entire contents of the file
3. In the Supabase SQL Editor, paste the script
4. Click **Run** to execute the script

This will create:
- ✅ All required tables
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Functions and triggers
- ✅ 15 pre-populated pharmaceutical parties

### Step 3: Configure Local Environment

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. The `.env.local` file should contain:
   ```env
   VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
   ```

### Step 4: Create Initial Users

You need to create users and assign roles. Run the setup-users Edge Function:

1. In Supabase Dashboard, go to **Database** → **Functions**
2. Deploy the `setup-users` function from `supabase/functions/setup-users/`
3. Or manually create users in the **Authentication** section

### Step 5: Verify Database Setup

1. Go to **Table Editor** in Supabase Dashboard
2. You should see the following tables:
   - `parties` (with 15 pre-populated entries)
   - `transactions`
   - `profiles`
   - `user_roles`

## 📊 Database Tables Details

### Parties Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Party name (unique) |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Pre-populated Parties:**
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

### Transactions Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| party_id | UUID | Reference to parties table |
| date | DATE | Transaction date |
| subtotal | DECIMAL(12,2) | Amount before tax |
| cgst | DECIMAL(12,2) | Central GST amount |
| sgst | DECIMAL(12,2) | State GST amount |
| total | DECIMAL(12,2) | Total amount (subtotal + cgst + sgst) |
| payment_type | TEXT | Cash, UPI, or Bank |
| status | TEXT | Paid or Unpaid |
| notes | TEXT | Additional notes (max 1000 chars) |
| ptr_number | TEXT | PTR number |
| cheque_number | TEXT | Cheque number (if applicable) |
| payment_date | DATE | Date of payment |
| invoice_number | TEXT | Invoice number |
| created_at | TIMESTAMPTZ | Creation timestamp |

### User Roles
- **Owner**: Full access to all features, can mark transactions as paid/unpaid
- **Manager**: Can create and edit transactions, but cannot change payment status

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (Owner/Manager)
- **Input validation** constraints
- **Secure authentication** via Supabase Auth

## 🔄 Realtime Features

The following tables have realtime enabled:
- `transactions` - Get live updates when transactions change
- `parties` - Get live updates when parties are added/modified

## 🛠️ Troubleshooting

### Can't see tables in Supabase Dashboard?
1. Make sure you ran the `setup-database.sql` script
2. Check the SQL Editor for any error messages
3. Verify you're looking at the correct project

### Authentication errors?
1. Verify your `.env.local` file has the correct credentials
2. Check that the Supabase URL and API key match your project
3. Ensure users are created in the Authentication section

### RLS Policy errors?
1. Make sure users have roles assigned in the `user_roles` table
2. Check that the `has_role` function exists
3. Verify RLS is enabled on all tables

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Review the SQL Editor for error messages
3. Verify all environment variables are set correctly

## 🎉 Next Steps

Once your database is set up:
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Access the application at `http://localhost:8080`
4. Log in with your created user credentials

Your PharmaPay Ledger is now ready to use! 🚀
