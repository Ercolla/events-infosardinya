// ============================================================
// Scraper multi-fonte per eventi in Sardegna
// Eseguito quotidianamente via GitHub Actions (06:00 UTC)
// Fonti: EventiInSardegna, SardegnaTuttoLAnno, VisitItaly,
//        EllepiRental, IsoleCheParl ano
// ============================================================

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase (env vars per GitHub Actions, fallback per locale)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jugdaypvqvpwvtfgrsqh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2RheXB2cXZwd3Z0Zmdyc3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzE5NzUsImV4cCI6MjA5MTY0Nzk3NX0.W3Yd3C5649sNyW_G2W_iQ7l9iYSUfflga7FwUbTf33c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Data odierna in formato YYYY-MM-DD
const TODAY = new Date().toISOString().split('T')[0];

// ---------- UTILITA' ----------

// Mesi italiani per il parsing delle date
const MESI = {
    'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
    'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
    'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
    'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'mag': '05', 'giu': '06', 'lug': '07', 'ago': '08',
    'set': '09', 'ott': '10', 'nov': '11', 'dic': '12'
};

// Converte una data italiana in formato YYYY-MM-DD
function parseItalianDate(dateStr) {
    if (!dateStr) return null;
    const clean = dateStr.trim().toLowerCase().replace(/[^\w\sà-ú]/g, ' ').replace(/\s+/g, ' ');

    // Formato: "27 Aprile 2026" o "27 aprile"
    const match = clean.match(/(\d{1,2})\s+([a-zà-ú]+)\s*(\d{4})?/);
    if (!match) return null;

    const day = match[1].padStart(2, '0');
    const monthKey = match[2].toLowerCase();
    const month = MESI[monthKey];
    const year = match[3] || new Date().getFullYear().toString();

    if (!month) return null;
    return `${year}-${month}-${day}`;
}

// Normalizza stringa per confronto
function normalize(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Fetch con retry e gestione errori
async function fetchPage(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 15000
        });
        return data;
    } catch (err) {
        console.error(`  Errore fetch ${url}: ${err.message}`);
        return null;
    }
}

// Recupera descrizione INTEGRALE e immagine REALE dalla pagina di dettaglio
async function fetchEventDetails(detailUrl) {
    if (!detailUrl || !detailUrl.startsWith('http')) return { description: '', image: '' };

    const html = await fetchPage(detailUrl);
    if (!html) return { description: '', image: '' };

    const $ = cheerio.load(html);

    // --- IMMAGINE: priorita' assoluta a og:image (locandina ufficiale) ---
    let image = '';

    // 1. Open Graph image (la piu' affidabile come poster/locandina)
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    if (ogImage.startsWith('http') && !ogImage.includes('logo') && !ogImage.includes('icon') && !ogImage.includes('favicon')) {
        image = ogImage;
    }

    // 2. Twitter card image
    if (!image) {
        const twImage = $('meta[name="twitter:image"]').attr('content') || '';
        if (twImage.startsWith('http') && !twImage.includes('logo')) image = twImage;
    }

    // 3. Featured image WordPress / immagine principale nel contenuto
    if (!image) {
        const imgSelectors = [
            'img.wp-post-image',
            '.featured-image img',
            'article img[src*="upload"]',
            '.entry-content img',
            '.post-content img',
            '.event-image img',
            '.tribe-events-event-image img',
            'img[src*="evento"]',
            'img[src*="event"]',
            'img[src*="locandina"]',
            'img[src*="manifesto"]'
        ];
        for (const selector of imgSelectors) {
            const el = $(selector).first();
            if (el.length) {
                const src = el.attr('src') || el.attr('data-src') || el.attr('data-lazy-src') || '';
                // Filtra: no icone, no thumbnail troppo piccole, no logo
                if (src.startsWith('http') && !src.includes('150x150') && !src.includes('50x50')
                    && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')
                    && !src.includes('placeholder') && !src.includes('lazy.png')) {
                    image = src;
                    break;
                }
            }
        }
    }

    // 4. Ultima risorsa: la prima immagine grande nel body
    if (!image) {
        $('img').each((_, el) => {
            if (image) return;
            const src = $(el).attr('src') || $(el).attr('data-src') || '';
            const width = parseInt($(el).attr('width') || '0', 10);
            if (src.startsWith('http') && width >= 300
                && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                image = src;
            }
        });
    }

    if (!image) {
        console.log(`    ⚠️  Nessuna immagine trovata per: ${detailUrl}`);
    }

    // --- DESCRIZIONE: estrai TUTTO il contenuto testuale informativo ---
    let description = '';

    // Selettori contenuto principale in ordine di priorita'
    const contentSelectors = [
        '.tribe-events-single-event-description',
        '.entry-content',
        '.post-content',
        '.event-description',
        '.event-content',
        'article .content',
        '.single-content',
        '[itemprop="description"]',
        '.description',
        'main article'
    ];

    for (const selector of contentSelectors) {
        const el = $(selector);
        if (el.length) {
            // Rimuovi elementi non informativi prima di estrarre il testo
            el.find('script, style, nav, .social-share, .related-posts, .comments, .sidebar, footer, .ad, .advertisement').remove();
            // Estrai tutti i paragrafi e li
            const paragraphs = el.find('p, li').map((_, p) => $(p).text().trim()).get()
                .filter(t => t.length > 20 && !t.includes('Cookie') && !t.includes('Privacy Policy'));
            if (paragraphs.length > 0) {
                description = paragraphs.join('\n\n');
                break;
            }
        }
    }

    // Fallback: tutti i paragrafi significativi della pagina
    if (description.length < 80) {
        const paragraphs = $('p')
            .filter((_, p) => {
                const text = $(p).text().trim();
                return text.length > 40 && !text.includes('Cookie') && !text.includes('©');
            })
            .slice(0, 10)
            .map((_, p) => $(p).text().trim())
            .get();
        description = paragraphs.join('\n\n');
    }

    // Pulizia: rimuovi spazi multipli ma mantieni la struttura paragrafi
    description = description.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    // Limita a 2000 caratteri per evitare problemi di storage, ma preserva il contenuto utile
    if (description.length > 2000) {
        description = description.substring(0, 1997) + '...';
    }

    if (!description) {
        console.log(`    ⚠️  Nessuna descrizione trovata per: ${detailUrl}`);
    }

    return { description, image };
}

// Estrae la citta' dal testo (dopo "a ", "di ", ultimo segmento dopo virgola)
function extractCity(text) {
    if (!text) return 'Sardegna';
    // Cerca pattern " a Citta'" o " di Citta'"
    const match = text.match(/\s+(?:a|ad|di)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*$/);
    if (match) return match[1].trim();
    // Dopo l'ultima virgola
    const parts = text.split(',');
    if (parts.length > 1) return parts[parts.length - 1].trim();
    return 'Sardegna';
}

// ---------- SCRAPER PER FONTE ----------

// 1. EventiInSardegna.it
async function scrapeEventiInSardegna() {
    const SOURCE = 'EventiInSardegna';
    const BASE = 'https://www.eventiinsardegna.it';
    console.log(`\n[${SOURCE}] Scaricamento in corso...`);

    const events = [];

    // Prova piu' pagine
    for (let page = 1; page <= 3; page++) {
        const url = page === 1 ? `${BASE}/eventi/` : `${BASE}/eventi/page/${page}/`;
        const html = await fetchPage(url);
        if (!html) break;

        const $ = cheerio.load(html);

        // Ogni evento e' in un elemento lista con titolo linkato
        $('article, .event-item, li').each((_, el) => {
            const $el = $(el);
            const titleLink = $el.find('h2 a, h3 a, h4 a').first();
            if (!titleLink.length) return;

            const title = titleLink.text().trim();
            const detailUrl = titleLink.attr('href') || '';
            const img = $el.find('img').first();
            const imageUrl = img.attr('src') || img.attr('data-src') || '';

            // Cerca la data nel testo dell'elemento
            const fullText = $el.text();
            const dateMatch = fullText.match(/(\d{1,2})\s+(Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre)\s*-?\s*(\d{1,2}\s+\w+)?\s*(\d{4})?/i);

            let date = null;
            let dateEnd = null;
            if (dateMatch) {
                date = parseItalianDate(dateMatch[0]);
                // Se c'e' un range (es. "27 Aprile - 3 Maggio")
                if (dateMatch[3]) {
                    dateEnd = parseItalianDate(dateMatch[3] + ' ' + (dateMatch[4] || new Date().getFullYear()));
                }
            }

            const location = extractCity(title);

            if (title && title.length > 5) {
                events.push({
                    title,
                    date,
                    date_end: dateEnd,
                    location,
                    image: imageUrl.startsWith('http') ? imageUrl : (imageUrl ? BASE + imageUrl : ''),
                    description: '',
                    source_name: SOURCE,
                    source_url: detailUrl.startsWith('http') ? detailUrl : BASE + detailUrl
                });
            }
        });
    }

    console.log(`  [${SOURCE}] Trovati ${events.length} eventi`);
    return events;
}

// 2. SardegnaTuttoLAnno.net
async function scrapeSardegnaTuttoLAnno() {
    const SOURCE = 'SardegnaTuttoLAnno';
    const BASE = 'https://sardegnatuttolanno.net';
    console.log(`\n[${SOURCE}] Scaricamento in corso...`);

    const events = [];
    const html = await fetchPage(`${BASE}/eventi/`);
    if (!html) return events;

    const $ = cheerio.load(html);

    // WordPress: articoli/post con titolo, data, immagine
    $('article, .type-tribe_events, .tribe-events-calendar-list__event').each((_, el) => {
        const $el = $(el);
        const titleEl = $el.find('h2 a, h3 a, h4 a, .tribe-events-calendar-list__event-title a').first();
        if (!titleEl.length) return;

        const title = titleEl.text().trim();
        const detailUrl = titleEl.attr('href') || '';
        const img = $el.find('img').first();
        const imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '';

        // Data: cerca nel testo
        const textContent = $el.text();
        const dateMatch = textContent.match(/(\d{1,2})\s+(Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre)\s*(?:-\s*(\d{1,2}\s+\w+))?\s*(\d{4})?/i);

        let date = null;
        let dateEnd = null;
        if (dateMatch) {
            date = parseItalianDate(dateMatch[0]);
            if (dateMatch[3]) {
                dateEnd = parseItalianDate(dateMatch[3] + ' ' + (dateMatch[4] || new Date().getFullYear()));
            }
        }

        // Location: cerca dopo virgola o nel testo
        let location = 'Sardegna';
        const locMatch = textContent.match(/(?:Sardegna|Cagliari|Sassari|Nuoro|Oristano|Olbia|Alghero|[A-ZÀ-Ú][a-zà-ú]+),?\s*(?:Italy|Sardegna|Sardinia)/i);
        if (locMatch) {
            location = locMatch[0].replace(/,?\s*(Italy|Sardegna|Sardinia)/i, '').trim();
        } else {
            location = extractCity(title);
        }

        if (title && title.length > 5) {
            events.push({
                title,
                date,
                date_end: dateEnd,
                location,
                image: imageUrl.startsWith('http') ? imageUrl : '',
                description: '',
                source_name: SOURCE,
                source_url: detailUrl.startsWith('http') ? detailUrl : BASE + detailUrl
            });
        }
    });

    console.log(`  [${SOURCE}] Trovati ${events.length} eventi`);
    return events;
}

// 3. VisitItaly.eu (Salude & Trigu)
async function scrapeVisitItaly() {
    const SOURCE = 'Salude & Trigu';
    const URL = 'https://www.visititaly.eu/it/storie-e-tradizioni/salude-e-trigu-eventi-nord-sardegna';
    console.log(`\n[${SOURCE}] Scaricamento in corso...`);

    const events = [];
    const html = await fetchPage(URL);
    if (!html) return events;

    const $ = cheerio.load(html);

    // I contenuti sono in blocchi di testo con titoli in grassetto
    $('strong, b').each((_, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        if (!title || title.length < 5) return;

        // Cerca la data nel testo vicino (prossimo elemento o testo dopo)
        const parent = $el.parent();
        const parentText = parent.text();

        const dateMatch = parentText.match(/(\d{1,2})\s+(Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre)\s*(\d{4})?/i);
        if (!dateMatch) return;

        const date = parseItalianDate(dateMatch[0]);
        const location = extractCity(title) || extractCity(parentText);

        // Evita titoli che non sono eventi (intestazioni, disclaimer, ecc.)
        if (title.length > 100 || title.includes('Cookie') || title.includes('Privacy')) return;

        events.push({
            title,
            date,
            date_end: null,
            location,
            image: '',
            description: '',
            source_name: SOURCE,
            source_url: URL
        });
    });

    console.log(`  [${SOURCE}] Trovati ${events.length} eventi`);
    return events;
}

// 4. EllepiRental.com
async function scrapeEllepiRental() {
    const SOURCE = 'EllepiRental';
    const URL = 'https://www.ellepirental.com/blog/scoprire-la-sardegna-a-noleggio/eventi-sagre-e-manifestazioni-in-sardegna';
    console.log(`\n[${SOURCE}] Scaricamento in corso...`);

    const events = [];
    const html = await fetchPage(URL);
    if (!html) return events;

    const $ = cheerio.load(html);

    // Lista di eventi come <li> con data e titolo mescolati
    $('li, p').each((_, el) => {
        const text = $(el).text().trim();
        // Cerca pattern: "Dal 19 aprile 2026 - Sagra..." o "19 aprile 2026 - Evento..."
        const match = text.match(/(?:Dal\s+)?(\d{1,2}\s+[A-Za-zà-ú]+\s*\d{4})\s*[-–:]\s*(.+)/i);
        if (!match) return;

        const date = parseItalianDate(match[1]);
        const title = match[2].trim();
        const location = extractCity(title);

        if (title && title.length > 5 && date) {
            events.push({
                title,
                date,
                date_end: null,
                location,
                image: '',
                description: '',
                source_name: SOURCE,
                source_url: URL
            });
        }
    });

    console.log(`  [${SOURCE}] Trovati ${events.length} eventi`);
    return events;
}

// 5. IsoleCheParl ano.it
async function scrapeIsoleCheParlano() {
    const SOURCE = 'Isole che Parlano';
    const BASE = 'https://www.isolecheparlano.it';
    console.log(`\n[${SOURCE}] Scaricamento in corso...`);

    const events = [];
    const html = await fetchPage(BASE);
    if (!html) return events;

    const $ = cheerio.load(html);

    // Festival principale: cerca date e location nell'header
    const bodyText = $('body').text();
    const dateMatch = bodyText.match(/(\d{1,2})\s*[\/\-]\s*(\d{1,2})\s+(Settembre|Ottobre|Novembre|Agosto|Luglio|Giugno)\s+(\d{4})/i);

    if (dateMatch) {
        const startDate = parseItalianDate(`${dateMatch[1]} ${dateMatch[3]} ${dateMatch[4]}`);
        const endDate = parseItalianDate(`${dateMatch[2]} ${dateMatch[3]} ${dateMatch[4]}`);

        // Cerca location
        let location = 'Palau';
        const locMatch = bodyText.match(/Palau|Arzachena|La Maddalena|Luogosanto/i);
        if (locMatch) location = locMatch[0];

        events.push({
            title: 'Isole che Parlano - Festival Internazionale',
            date: startDate,
            date_end: endDate,
            location,
            image: '',
            description: 'Festival multidisciplinare internazionale in Sardegna',
            badge_text: 'FESTIVAL',
            source_name: SOURCE,
            source_url: BASE
        });
    }

    // Cerca anche sottopagine con programma
    $('a[href*="edizione"], a[href*="programma"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (text.length > 5 && !events.find(e => e.title.includes(text))) {
            // Aggiungi come sotto-evento se ha senso
        }
    });

    console.log(`  [${SOURCE}] Trovati ${events.length} eventi`);
    return events;
}

// ---------- LOGICA PRINCIPALE ----------

// Verifica duplicati: confronta titolo normalizzato + data
async function getExistingEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('id, title, date');

    if (error) {
        console.error('Errore caricamento eventi esistenti:', error.message);
        return [];
    }
    return data || [];
}

function isDuplicate(event, existingEvents) {
    const normTitle = normalize(event.title);
    return existingEvents.some(existing => {
        const normExisting = normalize(existing.title);
        // Match esatto o contenimento
        const titleMatch = normTitle === normExisting
            || normTitle.includes(normExisting)
            || normExisting.includes(normTitle);
        // Stessa data (o entrambe null)
        const dateMatch = event.date === existing.date;
        return titleMatch && dateMatch;
    });
}

// Inserisce i nuovi eventi su Supabase
async function insertNewEvents(scrapedEvents) {
    const existingEvents = await getExistingEvents();
    console.log(`\nEventi gia' nel database: ${existingEvents.length}`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const event of scrapedEvents) {
        // Filtra eventi passati
        if (event.date && event.date < TODAY) {
            // Se ha date_end, controlla se e' ancora in corso
            if (!event.date_end || event.date_end < TODAY) {
                skipped++;
                continue;
            }
        }

        // Controlla duplicati
        if (isDuplicate(event, existingEvents)) {
            skipped++;
            continue;
        }

        // Prepara l'oggetto per Supabase
        const row = {
            title: event.title,
            date: event.date,
            date_end: event.date_end || null,
            location: event.location || 'Sardegna',
            image: event.image || null,
            description: event.description || null,
            badge_text: event.badge_text || null,
            source_name: event.source_name,
            source_url: event.source_url
        };

        const { error } = await supabase
            .from('events')
            .insert([row]);

        if (error) {
            console.error(`  ERRORE inserimento "${event.title}": ${error.message}`);
            errors++;
        } else {
            console.log(`  + Inserito: "${event.title}" (${event.source_name})`);
            inserted++;
            // Aggiungi alla lista per evitare duplicati nella stessa sessione
            existingEvents.push({ title: event.title, date: event.date });
        }
    }

    return { inserted, skipped, errors };
}

// Assegna badge_text in base al titolo (euristica)
function assignBadge(event) {
    if (event.badge_text) return event;

    const t = (event.title || '').toLowerCase();
    if (t.includes('sagra') || t.includes('enogastronom')) event.badge_text = 'SAGRA';
    else if (t.includes('festival') || t.includes('fest ')) event.badge_text = 'FESTIVAL';
    else if (t.includes('mostra') || t.includes('museo') || t.includes('esposizione')) event.badge_text = 'CULTURA';
    else if (t.includes('processione') || t.includes('sant') || t.includes('festa di') || t.includes('patrono')) event.badge_text = 'TRADIZIONI';
    else if (t.includes('concerto') || t.includes('musica') || t.includes('jazz') || t.includes('rock')) event.badge_text = 'MUSICA';
    else if (t.includes('fiera') || t.includes('mercato')) event.badge_text = 'FIERA';
    else if (t.includes('sport') || t.includes('gara') || t.includes('corsa') || t.includes('tennis') || t.includes('regata')) event.badge_text = 'SPORT';
    else if (t.includes('trekking') || t.includes('escursion') || t.includes('natura')) event.badge_text = 'NATURA';

    return event;
}

// Esecuzione principale
async function main() {
    console.log('=== Scraper Multi-Fonte Eventi Sardegna ===');
    console.log(`Data odierna: ${TODAY}\n`);

    // Esegui tutti gli scraper in parallelo
    const results = await Promise.allSettled([
        scrapeEventiInSardegna(),
        scrapeSardegnaTuttoLAnno(),
        scrapeVisitItaly(),
        scrapeEllepiRental(),
        scrapeIsoleCheParlano()
    ]);

    // Raccogli tutti gli eventi trovati
    let allScraped = [];
    const sourceNames = ['EventiInSardegna', 'SardegnaTuttoLAnno', 'Salude & Trigu', 'EllepiRental', 'Isole che Parlano'];

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            allScraped = allScraped.concat(result.value);
        } else {
            console.error(`\n[${sourceNames[i]}] FALLITO: ${result.reason}`);
        }
    });

    console.log(`\n--- Totale eventi trovati: ${allScraped.length} ---`);

    if (allScraped.length === 0) {
        console.log('Nessun evento trovato da nessuna fonte. Fine.');
        return;
    }

    // Assegna badge automatici
    allScraped = allScraped.map(assignBadge);

    // Arricchisci OGNI evento: naviga la pagina fonte per descrizione integrale e immagine reale
    console.log('\n--- Arricchimento eventi (descrizioni integrali + poster reali) ---');
    let enriched = 0;
    let noImage = 0;
    for (let i = 0; i < allScraped.length; i++) {
        const event = allScraped[i];
        if (!event.source_url || !event.source_url.startsWith('http')) continue;

        // Naviga SEMPRE la pagina di dettaglio per ottenere contenuto completo
        console.log(`  [${i + 1}/${allScraped.length}] Arricchendo: "${event.title.substring(0, 50)}..."`);
        const details = await fetchEventDetails(event.source_url);

        // Descrizione: sostituisci sempre con quella completa dalla fonte
        if (details.description && details.description.length > (event.description || '').length) {
            event.description = details.description;
        }

        // Immagine: usa quella della fonte se migliore o se manca
        if (details.image) {
            event.image = details.image;
            enriched++;
        } else if (!event.image) {
            // Nessuna immagine trovata: lascia vuoto (NO placeholder generici)
            event.image = null;
            noImage++;
        }

        // Pausa anti-flood tra le richieste
        await new Promise(r => setTimeout(r, 600));
    }
    console.log(`\n  Arricchiti con immagine: ${enriched}`);
    console.log(`  Senza immagine disponibile: ${noImage}`);

    // Inserisci su Supabase (con deduplicazione)
    const stats = await insertNewEvents(allScraped);

    console.log('\n=== Riepilogo ===');
    console.log(`  Nuovi inseriti:  ${stats.inserted}`);
    console.log(`  Ignorati/dupl:   ${stats.skipped}`);
    console.log(`  Errori:          ${stats.errors}`);
    console.log('\nFatto!');
}

main().catch(err => {
    console.error('Errore fatale:', err);
    process.exit(1);
});
