-- ===== SCHEMA DATABASE SUPABASE =====
-- Esegui questi comandi nel SQL editor di Supabase
-- https://supabase.com/dashboard → SQL Editor → New Query

-- 1. Tabella EVENTI (già dovrebbe esistere)
CREATE TABLE IF NOT EXISTS public.events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text,
  description text,
  date date,
  location text,
  time text,
  capacity text,
  lat numeric,
  lng numeric,
  badge_text character varying,
  image text,
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- 2. Tabella MESSAGGI CONTATTI
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

-- 3. Tabella NEWSLETTER (iscritti)
CREATE TABLE IF NOT EXISTS public.newsletter (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text UNIQUE NOT NULL,
  agreed_to_privacy boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_pkey PRIMARY KEY (id),
  CONSTRAINT newsletter_email_unique UNIQUE (email)
);

-- ===== ROW LEVEL SECURITY (RLS) =====
-- Abilita RLS per sicurezza

-- Disabilita RLS per tabelle pubbliche di lettura
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Abilita RLS per tabelle sensibili (solo INSERT senza autenticazione)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- Policy Allow INSERT per contact_messages (chiunque può inviare un messaggio)
CREATE POLICY "Allow INSERT contact_messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Policy Allow INSERT per newsletter (chiunque può iscriversi)
CREATE POLICY "Allow INSERT newsletter"
ON public.newsletter
FOR INSERT
WITH CHECK (true);

-- ===== INDICI =====
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location);
CREATE INDEX IF NOT EXISTS idx_events_badge ON public.events(badge_text);
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter(email);
