// Script di Web Scraping per recuperare le immagini degli eventi
// dal sito eventiinsardegna.it e aggiornarle su Supabase

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase (stesse credenziali del progetto)
const SUPABASE_URL = 'https://jugdaypvqvpwvtfgrsqh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2RheXB2cXZwd3Z0Zmdyc3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzE5NzUsImV4cCI6MjA5MTY0Nzk3NX0.W3Yd3C5649sNyW_G2W_iQ7l9iYSUfflga7FwUbTf33c';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SCRAPE_URL = 'https://www.eventiinsardegna.it/eventi/';

// Scraping della pagina eventi
async function scrapeEvents() {
    console.log('Scaricando la pagina eventi...');
    const { data: html } = await axios.get(SCRAPE_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(html);
    const events = [];

    // Ogni evento e' in un <li> con immagine e titolo
    $('li').each((_, el) => {
        const img = $(el).find('img').first();
        const titleLink = $(el).find('h4 a, h3 a, h2 a').first();

        const imageUrl = img.attr('src') || '';
        const title = titleLink.text().trim();

        // Prendi solo elementi che hanno sia titolo che immagine valida
        if (title && imageUrl && imageUrl.startsWith('http')) {
            events.push({ title, imageUrl });
        }
    });

    console.log(`Trovati ${events.length} eventi con immagine.\n`);
    return events;
}

// Normalizza una stringa per il confronto (minuscolo, senza accenti, senza punteggiatura)
function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // rimuovi accenti
        .replace(/[^a-z0-9\s]/g, '') // rimuovi punteggiatura
        .replace(/\s+/g, ' ')
        .trim();
}

// Confronto fuzzy: controlla se le parole chiave di un titolo sono contenute nell'altro
function titlesMatch(dbTitle, scrapedTitle) {
    const normDb = normalize(dbTitle);
    const normScraped = normalize(scrapedTitle);

    // Match esatto
    if (normDb === normScraped) return true;

    // Uno contiene l'altro
    if (normDb.includes(normScraped) || normScraped.includes(normDb)) return true;

    // Almeno il 60% delle parole del titolo DB sono nel titolo scraped (o viceversa)
    const wordsDb = normDb.split(' ').filter(w => w.length > 2);
    const wordsScraped = normScraped.split(' ').filter(w => w.length > 2);

    if (wordsDb.length === 0) return false;

    const matchCount = wordsDb.filter(w => normScraped.includes(w)).length;
    const matchRatio = matchCount / wordsDb.length;

    return matchRatio >= 0.6;
}

// Aggiorna le immagini su Supabase
async function updateImages(scrapedEvents) {
    // Carica tutti gli eventi dal database
    const { data: dbEvents, error } = await supabase
        .from('events')
        .select('id, title, image');

    if (error) {
        console.error('Errore nel caricamento eventi da Supabase:', error.message);
        return;
    }

    console.log(`Eventi nel database: ${dbEvents.length}`);
    console.log(`Eventi trovati dallo scraping: ${scrapedEvents.length}\n`);
    console.log('--- Inizio matching ---\n');

    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const dbEvent of dbEvents) {
        // Cerca un match tra gli eventi scraped
        const match = scrapedEvents.find(se => titlesMatch(dbEvent.title, se.title));

        if (!match) {
            console.log(`  Nessun match per: "${dbEvent.title}"`);
            notFound++;
            continue;
        }

        // Se ha gia' un'immagine valida, salta
        if (dbEvent.image && dbEvent.image.startsWith('http')) {
            console.log(`  Gia' con immagine: "${dbEvent.title}"`);
            skipped++;
            continue;
        }

        // Aggiorna l'immagine su Supabase
        const { error: updateError } = await supabase
            .from('events')
            .update({ image: match.imageUrl })
            .eq('id', dbEvent.id);

        if (updateError) {
            console.error(`  ERRORE aggiornando "${dbEvent.title}":`, updateError.message);
        } else {
            console.log(`  Aggiornato: "${dbEvent.title}" -> ${match.imageUrl}`);
            updated++;
        }
    }

    console.log('\n--- Riepilogo ---');
    console.log(`  Aggiornati:    ${updated}`);
    console.log(`  Gia' presenti: ${skipped}`);
    console.log(`  Senza match:   ${notFound}`);
}

// Esecuzione principale
async function main() {
    try {
        console.log('=== Scraper Immagini Eventi ===\n');
        const scrapedEvents = await scrapeEvents();

        if (scrapedEvents.length === 0) {
            console.log('Nessun evento trovato. Controlla la struttura del sito.');
            return;
        }

        // Mostra anteprima degli eventi trovati
        console.log('Anteprima primi 5 eventi trovati:');
        scrapedEvents.slice(0, 5).forEach((e, i) => {
            console.log(`  ${i + 1}. ${e.title}`);
            console.log(`     ${e.imageUrl}\n`);
        });

        await updateImages(scrapedEvents);
        console.log('\nFatto!');
    } catch (err) {
        console.error('Errore generale:', err.message);
    }
}

main();
