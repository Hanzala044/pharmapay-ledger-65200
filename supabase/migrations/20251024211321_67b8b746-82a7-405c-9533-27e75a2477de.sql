-- Add new columns to transactions table for payment details
ALTER TABLE public.transactions
ADD COLUMN ptr_number text,
ADD COLUMN cheque_number text,
ADD COLUMN payment_date date;

-- Update RLS policy: Only owners can update payment status
DROP POLICY IF EXISTS "Managers can do all operations on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Owners can do all operations on transactions" ON public.transactions;

-- Owners have full access
CREATE POLICY "Owners can do all operations on transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role));

-- Managers can insert, update (except status), and select
CREATE POLICY "Managers can insert transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can view transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can update transactions except status"
ON public.transactions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role) AND
  (SELECT status FROM public.transactions WHERE id = transactions.id) = status
);