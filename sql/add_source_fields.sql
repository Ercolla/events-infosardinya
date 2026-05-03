-- Aggiunge i campi per tracciare la fonte degli eventi
-- Eseguire nella SQL Editor di Supabase Dashboard

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS source_name text,
ADD COLUMN IF NOT EXISTS source_url text;

-- Segna gli eventi esistenti come inseriti manualmente
UPDATE public.events
SET source_name = 'Manuale'
WHERE source_name IS NULL;
