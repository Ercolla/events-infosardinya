// Configurazione Supabase
const SUPABASE_URL = 'https://jugdaypvqpvwvtfgrsqh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QKqJwR40B4tVqyonvEgspw_sm2i_DfS';

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
            .eq('category', category)
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
