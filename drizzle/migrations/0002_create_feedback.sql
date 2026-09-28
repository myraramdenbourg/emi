CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_token_hash text NOT NULL,
  reaction text,
  message text,
  contact_email text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read feedback" ON public.feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX feedback_ip_recent ON public.feedback (ip_hash, updated_at);