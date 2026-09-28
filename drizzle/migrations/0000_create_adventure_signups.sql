CREATE TABLE public.adventure_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  reaction text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.adventure_signups TO anon, authenticated;
GRANT SELECT ON public.adventure_signups TO authenticated;
GRANT ALL ON public.adventure_signups TO service_role;
ALTER TABLE public.adventure_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can sign up" ON public.adventure_signups FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read signups" ON public.adventure_signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));