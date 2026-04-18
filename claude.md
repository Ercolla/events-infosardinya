# Istruzioni per Istruzioni per Claude Code per sviluppare Events Infosardinya
Questo file viene letto automaticamente da Claude Code a ogni sessione.
Contiene le regole, il contesto e i vincoli del progetto.
Leggilo per intero prima di fare qualsiasi modifica e parlami sempre in italiano.

🎯 Panoramica del progetto
Sito blog/content realizzato con Next.js e Supabase (solo database, no auth, no storage, no edge functions).
Il sito deve essere il punto di riferimento per gli eventi in Sardegna. Deve essere pulito, veloce e facile da usare per chi cerca cosa fare stasera o nel weekend.
Repository su GitHub. Il progetto è parzialmente completato — molte parti funzionano già e non devono essere toccate.

Stack tecnico
Layer:Framework  Tecnologia:Next.js (Pages Router)
Layer:Linguaggio  Tecnologia:JavaScript
Layer:Database Tecnologia:Supabase (PostgreSQL)
Layer:Styling  Tecnologia: Tailwind CSS
Layer:Deployment Tecnologia:Vercel
Layer:Repo  Tecnologia:GitHub

## 🎨 Stile e Design
- **Colori:** Ispirati alla Sardegna (Blu mare, Giallo sole, Bianco sabbia).
- **Font:** Usa caratteri moderni e molto leggibili (senza troppi ghirigori).
- **Layout:** Le schede degli eventi devono avere un'immagine, la data ben visibile e un tasto "Scopri di più".
- **Mobile First:** Il sito deve vedersi perfettamente sul cellulare (è lì che la gente cerca gli eventi!).

## ✍️ Tono di Voce
- Amichevole ma affidabile.
- Usa l'italiano in modo corretto e invitante.
- Se un evento è "Sold Out", evidenzialo chiaramente in rosso.

## 🛠 Regole Tecniche
- Ogni volta che crei un nuovo evento, verifica che l'immagine non sia troppo pesante.
- Mantieni il codice ordinato e aggiungi dei piccoli commenti per spiegarmi cosa hai fatto.
- Accertarsi che il footer sia uguale in tutte le pagine
- Reintegrare la pagina pacchetti.html e includerla sia nel menu che nel footer

## 🔒 REGOLE OBBLIGATORIE — NON NEGOZIABILI
Regola 1: Proteggi ciò che funziona
NON modificare file elencati nella sezione "Componenti stabili" senza esplicita richiesta.
Se devi toccare un file stabile, mostra il diff completo e attendi conferma prima di applicarlo.

Regola 2: Preferisci l'estensione alla riscrittura
Se un componente funziona, aggiungici sopra — non riscriverlo da zero.
Nuove funzionalità vanno in file nuovi quando possibile.
Se devi modificare un file esistente, fai edit chirurgici (poche righe, mirate).

Regola 3: Puoi toccare il database senza conferma
Puoi creare, modificare o eliminare tabelle/colonne Supabase senza conferma esplicita.
Puoi eseguire query distruttive (DELETE, DROP, TRUNCATE).
Se serve una nuova tabella o colonna, proponi prima lo schema SQL e attendi l'OK.

Regola 4: Preserva la struttura del progetto
Mantieni la struttura delle cartelle esistente.
Non spostare file da una cartella all'altra se non richiesto.
Non rinominare file o cartelle esistenti.
Rispetta le convenzioni di naming già in uso nel progetto.

Regola 5: Non rimuovere codice esistente
MAI rimuovere import, funzioni, componenti o blocchi di codice esistenti a meno che non sia stato esplicitamente richiesto.
Se del codice sembra inutilizzato, segnalalo invece di eliminarlo.

Regola 6: Verifica dopo ogni modifica
Dopo ogni modifica, esegui npm run build (o il comando di build del progetto).
Se il build fallisce, ripristina immediatamente la modifica e segnala il problema.
Non procedere con altre modifiche finché il build non passa.

Regola 7: Un passo alla volta
Affronta una sola modifica per volta.
Completa, testa e conferma prima di passare alla successiva.
Non fare refactoring "opportunistici" durante altre attività.


✅ Componenti stabili — NON TOCCARE
Elenca qui tutti i file e le cartelle che funzionano correttamente.
Claude Code li tratterà come intoccabili.

# Stili globali
src/app/globals.css                   # Stili base — non sovrascrivere

# Configurazione
next.config.js                        # Configurazione Next.js — non toccare
tailwind.config.js                    # Configurazione Tailwind — stabile


🚧 Aree in sviluppo — Si può lavorare qui

Elenca qui le funzionalità da completare o i file su cui si sta lavorando.

# Completato:
- Homepage index.html

# Da completare:
- Pagina "Chi siamo"
- Sistema di categorie/tag per gli articoli categorie.html
- Pagina eventi eventi.html usare supabase (per popolare gli eventi estrapolare i contenuti da questo link https://www.eventiinsardegna.it/)
- Pagina luoghi luoghi.html (usare la cartella IMG per le immagini)
- Ottimizzazione SEO (meta tag dinamici)
- Pagina contatti con form di contatto contatti.html
- Ricerca articoli
- Autenticazione utente (creazione account) 

# Completata:

- Pagina CHI SIAMO chi-siamo.html

# durante la fase finale :
- [ ] Sitemap automatica
- [ ] Ricerca articoli


🗄️ Schema database Supabase

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.events (
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
  date_end date,
  author_id uuid,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.newsletter_subscribers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL UNIQUE,
  agreed_to_privacy boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'::text,
  confirmation_token uuid DEFAULT uuid_generate_v4(),
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  newsletter_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

📁 Struttura del progetto

Mappa la struttura reale delle cartelle principali.
Aggiornala man mano che il progetto cresce.



🔄 Workflow di sviluppo
Quando ricevi una richiesta di modifica, segui questo ordine:

Analizza — leggi i file coinvolti per capire lo stato attuale
Proponi — descrivi cosa intendi fare e quali file toccherai
Conferma — attendi l'OK prima di procedere (per modifiche a file stabili)
Implementa — fai le modifiche in modo chirurgico
Verifica — esegui il build e controlla che tutto funzioni
Riassumi — elenca i file creati/modificati con un breve changelog


📝 Changelog sessioni

Aggiorna questa sezione alla fine di ogni sessione di lavoro.

## Sessione 2026-04-18

### Email newsletter (Edge Function + dominio verificato)
- Attivato dominio verificato `infosardinya.it` su Resend
- `supabase/functions/send-confirmation-email/index.ts`:
  - Mittente: `Newsletter InfoSardinya <newsletter@infosardinya.it>`
  - `reply_to: events@infosardinya.it` (risposte utenti)
  - Oggetto: "Non perderti nessun evento"
  - Aggiunto titolo h2 "Non perderti nessun evento" nel corpo email
- `index.html`: corretto casing titolo CTA ("Non perderti nessun evento")
- Deploy: `npx supabase functions deploy send-confirmation-email`

### Login Google OAuth — schermata benvenuto (bugfix)
- `auth.js`: `authLoginWithGoogle()` — `redirectTo` punta a `login.html` (senza query param per evitare mismatch con Redirect URLs Supabase)
- `login.html`:
  - Flag `sessionStorage.google_oauth_pending` impostato prima del redirect a Google
  - Guard `authRedirectIfLoggedIn` saltato se flag presente
  - `onAuthStateChange` intercetta evento `SIGNED_IN` e mostra schermata "Accesso completato!" identica a quella del login email (2.5s delay + redirect)
  - `replaceState` per pulire URL spostato DOPO che Supabase ha processato il token hash (prima cancellava il token → loop di redirect)
  - Nome utente letto da `user_metadata.full_name` (fornito da Google)

### Config Supabase da verificare
- **Authentication → URL Configuration → Redirect URLs** deve contenere: `https://ercolla.github.io/events-infosardinya/login.html`