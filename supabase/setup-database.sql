-- ============================================
-- PharmaPay Ledger Database Setup Script
-- ============================================
-- Run this script in your Supabase SQL Editor to set up the complete database
-- URL: https://atgazgkilvuznodbubxs.supabase.co

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Create parties table for pharmaceutical businesses
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create transactions table with GST calculations
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
  cgst DECIMAL(12, 2) NOT NULL CHECK (cgst >= 0),
  sgst DECIMAL(12, 2) NOT NULL CHECK (sgst >= 0),
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('Cash', 'UPI', 'Bank')),
  status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid')),
  notes TEXT,
  ptr_number TEXT,
  cheque_number TEXT,
  payment_date DATE,
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT check_date_not_future CHECK (date <= CURRENT_DATE),
  CONSTRAINT check_payment_date_valid CHECK (payment_date IS NULL OR payment_date >= date),
  CONSTRAINT check_total_matches CHECK (abs(total - (subtotal + cgst + sgst)) < 0.01),
  CONSTRAINT check_notes_length CHECK (notes IS NULL OR length(notes) <= 1000)
);

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'manager');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table with username
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 2. INSERT INITIAL DATA
-- ============================================

-- Insert the 15 pharmaceutical party accounts (if not exists)
INSERT INTO public.parties (name) VALUES
  ('ISHA PHARMA'),
  ('AMBIKA PHARMA'),
  ('JAI PHARMA'),
  ('SUVARNA ENTERPRISES'),
  ('PHYDE MARKETING'),
  ('BHARNI ENTERPRISES'),
  ('RAJ AGENCY (BANGALORE)'),
  ('RAMA STORE'),
  ('RAJ COSMETICS'),
  ('LYFE CARE DIPERS'),
  ('SURABHI ENTERPRISES'),
  ('JANATHA PHARMA'),
  ('JAN AUSHADHI (HUBLI)'),
  ('JAN AUSHADHI (MYSURU)'),
  ('JAN AUSHADHI (BANGALORE)')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transactions_party_id ON public.transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- ============================================
-- 4. CREATE FUNCTIONS
-- ============================================

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on parties" ON public.parties;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Owners can do all operations on parties" ON public.parties;
DROP POLICY IF EXISTS "Managers can view parties" ON public.parties;
DROP POLICY IF EXISTS "Owners can do all operations on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can do all operations on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can update transactions except status" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only system can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "No one can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "No one can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "No one can delete roles" ON public.user_roles;

-- Parties Policies
CREATE POLICY "Owners can do all operations on parties"
  ON public.parties
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Managers can view parties"
  ON public.parties
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'::app_role));

-- Transactions Policies
CREATE POLICY "Owners can do all operations on transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Managers can insert transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can view transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can update transactions except status"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role) AND
    status = (SELECT t.status FROM public.transactions t WHERE t.id = transactions.id)
  );

-- User Roles Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "No one can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No one can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No one can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (false);

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Only system can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (false);

-- ============================================
-- 8. ENABLE REALTIME
-- ============================================

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parties;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your database is now ready!
-- Next steps:
-- 1. Create users via the Supabase Auth UI or Edge Functions
-- 2. Assign roles to users in the user_roles table
-- 3. Start using the application
