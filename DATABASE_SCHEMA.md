# PharmaPay Ledger - Database Schema Reference

## 🗄️ Quick Reference

**Project**: pharma_ledger | HANZALA ROKZZ  
**URL**: https://atgazgkilvuznodbubxs.supabase.co  
**Database**: PostgreSQL 15

---

## 📊 Tables Overview

### 1. `public.parties`
Stores pharmaceutical business partners and distributors.

```sql
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**Indexes:**
- Primary Key: `id`
- Unique: `name`

**Pre-populated Data (15 parties):**
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

### 2. `public.transactions`
Records all financial transactions with parties including GST calculations.

```sql
CREATE TABLE public.transactions (
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
  
  -- Constraints
  CONSTRAINT check_date_not_future CHECK (date <= CURRENT_DATE),
  CONSTRAINT check_payment_date_valid CHECK (payment_date IS NULL OR payment_date >= date),
  CONSTRAINT check_total_matches CHECK (abs(total - (subtotal + cgst + sgst)) < 0.01),
  CONSTRAINT check_notes_length CHECK (notes IS NULL OR length(notes) <= 1000)
);
```

**Indexes:**
- Primary Key: `id`
- Foreign Key: `party_id` → `parties(id)`
- Index: `idx_transactions_party_id`
- Index: `idx_transactions_date`
- Index: `idx_transactions_status`

**Payment Types:**
- `Cash` - Cash payment
- `UPI` - UPI payment
- `Bank` - Bank transfer

**Status Values:**
- `Paid` - Payment received
- `Unpaid` - Payment pending

---

### 3. `public.profiles`
User profile information linked to Supabase Auth.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Indexes:**
- Primary Key: `id`
- Unique: `username`
- Foreign Key: `id` → `auth.users(id)`

---

### 4. `public.user_roles`
Manages user roles for access control.

```sql
CREATE TYPE public.app_role AS ENUM ('owner', 'manager');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);
```

**Indexes:**
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users(id)`
- Unique: `(user_id, role)`

**Roles:**
- `owner` - Full access (can mark transactions as paid/unpaid)
- `manager` - Limited access (cannot change payment status)

---

## 🔒 Row Level Security (RLS) Policies

### Parties Table

| Policy Name | Operation | Role | Description |
|-------------|-----------|------|-------------|
| Owners can do all operations | ALL | owner | Full CRUD access |
| Managers can view parties | SELECT | manager | Read-only access |

### Transactions Table

| Policy Name | Operation | Role | Description |
|-------------|-----------|------|-------------|
| Owners can do all operations | ALL | owner | Full CRUD access |
| Managers can insert transactions | INSERT | manager | Can create new transactions |
| Managers can view transactions | SELECT | manager | Can view all transactions |
| Managers can update except status | UPDATE | manager | Can edit but not change payment status |

### Profiles Table

| Policy Name | Operation | Description |
|-------------|-----------|-------------|
| Users can view own profile | SELECT | Users can only see their own profile |
| Users can update own profile | UPDATE | Users can update their own profile |
| Only system can create profiles | INSERT | Profiles created via trigger only |

### User Roles Table

| Policy Name | Operation | Description |
|-------------|-----------|-------------|
| Users can view own roles | SELECT | Users can see their assigned roles |
| No one can insert roles | INSERT | Roles assigned by admin only |
| No one can update roles | UPDATE | Roles cannot be changed by users |
| No one can delete roles | DELETE | Roles cannot be deleted by users |

---

## ⚙️ Functions

### `public.has_role(_user_id UUID, _role app_role)`
Checks if a user has a specific role.

```sql
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
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Usage:**
```sql
SELECT public.has_role(auth.uid(), 'owner'::app_role);
```

### `public.handle_new_user()`
Automatically creates a profile when a new user is created.

```sql
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
```

**Trigger:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🔄 Realtime Subscriptions

The following tables have realtime enabled:

### Transactions
```javascript
// Subscribe to all transaction changes
supabase
  .channel('transactions')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'transactions' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

### Parties
```javascript
// Subscribe to all party changes
supabase
  .channel('parties')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'parties' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

---

## 📝 Common Queries

### Get all parties
```sql
SELECT * FROM public.parties ORDER BY name;
```

### Get transactions for a party
```sql
SELECT t.*, p.name as party_name
FROM public.transactions t
JOIN public.parties p ON t.party_id = p.id
WHERE t.party_id = 'party-uuid-here'
ORDER BY t.date DESC;
```

### Get unpaid transactions
```sql
SELECT t.*, p.name as party_name
FROM public.transactions t
JOIN public.parties p ON t.party_id = p.id
WHERE t.status = 'Unpaid'
ORDER BY t.date DESC;
```

### Get total outstanding by party
```sql
SELECT 
  p.name,
  COUNT(t.id) as transaction_count,
  SUM(t.total) as total_outstanding
FROM public.parties p
LEFT JOIN public.transactions t ON p.id = t.party_id AND t.status = 'Unpaid'
GROUP BY p.id, p.name
ORDER BY total_outstanding DESC NULLS LAST;
```

### Get user role
```sql
SELECT role 
FROM public.user_roles 
WHERE user_id = auth.uid();
```

### Get monthly transaction summary
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as transaction_count,
  SUM(subtotal) as total_subtotal,
  SUM(cgst) as total_cgst,
  SUM(sgst) as total_sgst,
  SUM(total) as total_amount
FROM public.transactions
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

---

## 🛠️ Maintenance Queries

### Check table sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check RLS policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verify indexes
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 🔐 Security Best Practices

1. **Never expose service role key** - Keep it secure on the server
2. **Use RLS policies** - All tables have RLS enabled
3. **Validate input** - Constraints prevent invalid data
4. **Audit logs** - Monitor auth and database logs regularly
5. **Backup regularly** - Enable automatic backups in Supabase

---

## 📊 Data Types Reference

| Type | Description | Example |
|------|-------------|---------|
| UUID | Unique identifier | `550e8400-e29b-41d4-a716-446655440000` |
| TEXT | Variable-length string | `'ISHA PHARMA'` |
| DECIMAL(12,2) | Fixed-point number | `1234.56` |
| DATE | Calendar date | `'2024-10-26'` |
| TIMESTAMPTZ | Timestamp with timezone | `'2024-10-26 19:30:00+05:30'` |
| app_role | Custom enum | `'owner'` or `'manager'` |

---

## 🎯 Performance Tips

1. **Use indexes** - Already created on frequently queried columns
2. **Limit results** - Use `LIMIT` and `OFFSET` for pagination
3. **Filter early** - Apply WHERE clauses before JOINs when possible
4. **Use prepared statements** - Supabase client handles this automatically
5. **Monitor slow queries** - Check Supabase dashboard for query performance

---

This schema reference provides a complete overview of your PharmaPay Ledger database structure. Keep this document handy for development and troubleshooting! 📚
