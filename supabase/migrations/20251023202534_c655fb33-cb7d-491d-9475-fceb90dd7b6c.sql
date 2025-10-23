-- Create parties table for pharmaceutical businesses
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create transactions table with GST calculations
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
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert the 15 pharmaceutical party accounts
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
  ('JAN AUSHADHI (BANGALORE)');

-- Enable Row Level Security
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a business tool)
CREATE POLICY "Allow all operations on parties"
  ON public.parties FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on transactions"
  ON public.transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_party_id ON public.transactions(party_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;