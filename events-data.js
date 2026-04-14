// events-data.js - Database centralizzato degli 8 eventi

const eventsDatabase = [
    {
        id: 1,
        titolo: "Antonio Ligabue. La grande mostra",
        categoria: "arte",
        badge: "MOSTRE",
        dataInizio: "2026-01-01",
        dataFine: "2026-06-07",
        location: "Cagliari",
        coordinates: "39.2237,9.1281", // Cagliari
        prezzo: "15.00",
        immagine: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "Scopri la straordinaria mostra dedicata ad Antonio Ligabue, uno dei più importanti pittori del Novecento italiano. Ammira le sue opere più celebri, dai paesaggi torrenziali ai suoi autoritratti intensi. Una retrospettiva completa che celebra il genio creativo di questo grande artista. L'esposizione si svolge presso la principale galleria d'arte di Cagliari con una collezione di oltre 100 opere.",
        orario: "10:00 - 18:00",
        contatti: "Tel: +39 070 123 456"
    },
    {
        id: 2,
        titolo: "Tutankhamon. La tomba, il tesoro, la scoperta",
        categoria: "arte",
        badge: "MOSTRE",
        dataInizio: "2026-06-01",
        dataFine: "2026-07-31",
        location: "Cagliari",
        coordinates: "39.2237,9.1281",
        prezzo: "20.00",
        immagine: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "Un viaggio affascinante nel mondo dell'antico Egitto! Scopri la storia straordinaria di Tutankhamon, il giovane faraone la cui tomba è rimasta intatta per millennii. Ammira i tesori inestimabili ritrovati dall'archeologo Howard Carter nel 1922. Questo affascina non solo gli appassionati di storia, ma incanta anche le nuove generazioni. Una mostra immersiva che trasporta i visitatori nel mistero dei faraoni.",
        orario: "09:00 - 20:00",
        contatti: "Tel: +39 070 654 321"
    },
    {
        id: 3,
        titolo: "Biennale Arte Contemporanea",
        categoria: "arte",
        badge: "FESTIVAL",
        dataInizio: "2026-03-21",
        dataFine: "2026-06-07",
        location: "Ulassai",
        coordinates: "40.0106,9.6167",
        prezzo: "12.00",
        immagine: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "La Biennale di Arte Contemporanea di Ulassai è un appuntamento internazionale imperdibile che celebra la creatività contemporanea. Scopri installazioni innovative, pitture d'avanguardia e sculture affascinanti realizzate da artisti da tutto il mondo. La manifestazione trasforma l'intero centro storico di Ulassai in una galleria a cielo aperto.",
        orario: "10:00 - 19:00",
        contatti: "Tel: +39 0782 123 456"
    },
    {
        id: 4,
        titolo: "Settimana Santa a Cagliari",
        categoria: "famiglia",
        badge: "TRADIZIONI",
        dataInizio: "2026-03-27",
        dataFine: "2026-04-12",
        location: "Cagliari",
        coordinates: "39.2237,9.1281",
        prezzo: "0.00",
        immagine: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "La Settimana Santa a Cagliari è una celebrazione intensa e affascinante delle tradizioni religiose e culturali sarde. Partecipa alle processioni emozionanti che attraversano le strade della città, assisti agli spettacoli teatrali e alle rappresentazioni dell'Ultima Cena. Un'esperienza spirituale che unisce fede, arte e tradizione in un'atmosfera unica.",
        orario: "Varievoli",
        contatti: "Info: www.cagliari.it"
    },
    {
        id: 5,
        titolo: "Primavera in Marmilla",
        categoria: "musica",
        badge: "FESTIVAL",
        dataInizio: "2026-03-28",
        dataFine: "2026-05-31",
        location: "Marmilla",
        coordinates: "39.7744,9.0289",
        prezzo: "18.00",
        immagine: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "Primavera in Marmilla è il festival musicale dell'anno! Goditi concerti dal vivo di artisti nazionali e internazionali, circondato dalla bellezza naturale della Marmilla. Dalle tradizionali canzoni sarde ai suoni contemporanei, scopri una varietà di generi musicali. L'evento si svolge in diversi spazi all'aperto, creando un'atmosfera magica tra storia e modernità.",
        orario: "20:00 - 23:30",
        contatti: "Tel: +39 070 987 654"
    },
    {
        id: 6,
        titolo: "Lo stesso mare. Da Garibaldi a Battaglia",
        categoria: "arte",
        badge: "MOSTRE",
        dataInizio: "2026-03-28",
        dataFine: "2026-05-23",
        location: "Caprera",
        coordinates: "41.1544,9.5644",
        prezzo: "14.00",
        immagine: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578301978162-7aae4d755744?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "Una mostra affascinante che esplora il rapporto tra il mare, la storia e i grandi personaggi che hanno attraversato queste acque. Dai dipinti romantici ai cimeli storici, scopri come il mare ha ispirato artisti e rivoluzionari. L'esposizione offre una prospettiva unica sulle relazioni tra geografia, arte e storia nazionale.",
        orario: "10:00 - 18:00",
        contatti: "Tel: +39 0789 123 456"
    },
    {
        id: 7,
        titolo: "XXIII Sagra del Carciofo",
        categoria: "enogastronomia",
        badge: "SAGRE",
        dataInizio: "2026-04-11",
        dataFine: "2026-04-12",
        location: "Masainas",
        coordinates: "39.2894,8.7911",
        prezzo: "0.00",
        immagine: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "La XXIII Sagra del Carciofo è una celebrazione della cucina sarda tradizionale! Assaggia piatti deliziosi a base di carciofi locali preparati dagli chef più bravi della regione. L'evento include degustazioni, cooking show dal vivo, e la possibilità di acquistare prodotti tipici. Un'esperienza culinaria che non potrai dimenticare!",
        orario: "12:00 - 23:00",
        contatti: "Tel: +39 070 456 789"
    },
    {
        id: 8,
        titolo: "Foreste Aperte nel Parco Tepilora",
        categoria: "sport",
        badge: "NATURA",
        dataInizio: "2026-04-11",
        dataFine: "2026-04-25",
        location: "Parco Tepilora",
        coordinates: "40.4514,9.6233",
        prezzo: "5.00",
        immagine: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
        galleriaImmagini: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800"
        ],
        descrizione: "Foreste Aperte è un evento unico che ti consente di esplorare le meraviglie naturali del Parco Tepilora. Partecipa a escursioni guidate attraverso boschi incontaminati, scopri la flora e fauna locale, e goditi attività all'aperto. Perfetto per famiglie, appassionati di natura e avventura. Un'occasione rara per scoprire uno dei parchi più importanti della Sardegna.",
        orario: "08:00 - 18:00",
        contatti: "Tel: +39 0784 456 123"
    }
];

// Funzione per ottenere un evento per ID
function getEventById(id) {
    return eventsDatabase.find(event => event.id === parseInt(id));
}

// Funzione per ottenere tutti gli eventi
function getAllEvents() {
    return eventsDatabase;
}

// Funzione per ottenere eventi per categoria
function getEventsByCategory(category) {
    if (category === 'all') return eventsDatabase;
    return eventsDatabase.filter(event => event.categoria === category);
}

// Funzione per ottenere eventi per location
function getEventsByLocation(location) {
    return eventsDatabase.filter(event => event.location === location);
}
