// Configurazione Supabase
const SUPABASE_URL = 'https://jugdaypvqvpwvtfgrsqh.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2RheXB2cXZwd3Z0Zmdyc3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzE5NzUsImV4cCI6MjA5MTY0Nzk3NX0.W3Yd3C5649sNyW_G2W_iQ7l9iYSUfflga7FwUbTf33c';

// Inizializza Supabase (la libreria è caricata dal CDN come window.supabase)
// Rinominato per evitare conflitto con window.supabase del CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funzione per ottenere tutti gli eventi
async function getAllEvents() {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('Errore nel caricamento degli eventi:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return [];
    }
}

// Funzione per ottenere un evento specifico
async function getEventById(id) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Errore nel caricamento dell\'evento:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return null;
    }
}

// Funzione per ottenere eventi per categoria
async function getEventsByCategory(category) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('badge_text', category)
            .order('date', { ascending: true });

        if (error) {
            console.error('Errore nel caricamento degli eventi:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return [];
    }
}

// Funzione per ottenere eventi per città
async function getEventsByCity(city) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('location', city)
            .order('date', { ascending: true });

        if (error) {
            console.error('Errore nel caricamento degli eventi:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return [];
    }
}

// ---------- FUNZIONI CRUD ADMIN ----------

// Crea un nuovo evento
async function createEvent(eventData) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .insert([eventData])
            .select()
            .single();

        if (error) {
            console.error('Errore nella creazione dell\'evento:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true, data: data };
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return { ok: false, error: err.message };
    }
}

// Aggiorna un evento esistente
async function updateEvent(id, updatedData) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Errore nell\'aggiornamento dell\'evento:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true, data: data };
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return { ok: false, error: err.message };
    }
}

// ---------- CONTATTI ----------

// Invia un messaggio di contatto
async function sendContactMessage(email, subject, message) {
    try {
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .insert([{ email: email, subject: subject, message: message }])
            .select()
            .single();

        if (error) {
            console.error('Errore invio messaggio contatto:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true, data: data };
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return { ok: false, error: err.message };
    }
}

// ---------- NEWSLETTER ----------

// URL della Edge Function per invio email di conferma
const CONFIRMATION_FUNCTION_URL = SUPABASE_URL + '/functions/v1/send-confirmation-email';

// Iscrizione alla newsletter (Double Opt-In)
// 1. Inserisce l'email con status 'pending' e genera un token
// 2. Chiama la Edge Function per inviare l'email di conferma
async function subscribeNewsletter(email, agreedToPrivacy) {
    try {
        const { data, error } = await supabaseClient
            .from('newsletter_subscribers')
            .insert([{ email: email, agreed_to_privacy: agreedToPrivacy }])
            .select('confirmation_token')
            .single();

        if (error) {
            // Errore 23505 = violazione UNIQUE (email gia' presente)
            if (error.code === '23505') {
                return { ok: false, duplicate: true, error: 'Questa email è già iscritta!' };
            }
            console.error('Errore iscrizione newsletter:', error);
            return { ok: false, error: error.message };
        }

        // Invio email di conferma tramite Edge Function
        try {
            await fetch(CONFIRMATION_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    email: email,
                    token: data.confirmation_token
                })
            });
        } catch (emailErr) {
            // L'iscrizione e' avvenuta, ma l'email potrebbe non essere partita
            console.error('Errore invio email di conferma:', emailErr);
        }

        return { ok: true, data: data };
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return { ok: false, error: err.message };
    }
}

// Elimina un evento
async function deleteEvent(id) {
    try {
        const { error } = await supabaseClient
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Errore nell\'eliminazione dell\'evento:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true };
    } catch (err) {
        console.error('Errore nella connessione a Supabase:', err);
        return { ok: false, error: err.message };
    }
}
