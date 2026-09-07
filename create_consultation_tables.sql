-- Consultation form submissions table
CREATE TABLE IF NOT EXISTS public.consultation_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  medical_concern TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_submissions_created_at
ON public.consultation_submissions(created_at DESC);

ALTER TABLE public.consultation_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a consultation request" ON public.consultation_submissions;
CREATE POLICY "Anyone can submit a consultation request"
ON public.consultation_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Consultation widget settings table
CREATE TABLE IF NOT EXISTS public.consultation_widget_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  heading TEXT NOT NULL DEFAULT 'Get Free Consultation',
  subheading TEXT NOT NULL DEFAULT 'Our care team replies within minutes',
  name_placeholder TEXT NOT NULL DEFAULT 'Full Name',
  whatsapp_placeholder TEXT NOT NULL DEFAULT 'WhatsApp Number',
  concern_placeholder TEXT NOT NULL DEFAULT 'Describe your medical concern...',
  button_text TEXT NOT NULL DEFAULT 'Get Free Consultation →',
  trust_line TEXT NOT NULL DEFAULT 'Your information stays confidential',
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.consultation_widget_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.consultation_widget_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view consultation widget settings" ON public.consultation_widget_settings;
CREATE POLICY "Anyone can view consultation widget settings"
ON public.consultation_widget_settings
FOR SELECT
TO public
USING (is_active = true);