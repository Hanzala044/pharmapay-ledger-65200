-- Fix security issues

-- 1. Fix manager update policy (critical bug)
DROP POLICY IF EXISTS "Managers can update transactions except status" ON public.transactions;

CREATE POLICY "Managers can update transactions except status"
ON public.transactions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role) AND
  status = (SELECT t.status FROM public.transactions t WHERE t.id = transactions.id)
);

-- 2. Restrict profile visibility to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Add INSERT policy to profiles (only system via trigger)
CREATE POLICY "Only system can create profiles"
ON public.profiles
FOR INSERT
WITH CHECK (false);

-- 4. Add explicit deny policies for user_roles
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

-- 5. Add input validation constraints to transactions
ALTER TABLE public.transactions 
ADD CONSTRAINT check_date_not_future 
CHECK (date <= CURRENT_DATE);

ALTER TABLE public.transactions 
ADD CONSTRAINT check_payment_date_valid 
CHECK (payment_date IS NULL OR payment_date >= date);

ALTER TABLE public.transactions 
ADD CONSTRAINT check_total_matches 
CHECK (abs(total - (subtotal + cgst + sgst)) < 0.01);

ALTER TABLE public.transactions
ADD CONSTRAINT check_notes_length
CHECK (notes IS NULL OR length(notes) <= 1000);