-- Add invoice_number column to transactions table
ALTER TABLE public.transactions
ADD COLUMN invoice_number text;