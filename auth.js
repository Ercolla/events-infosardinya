// ============================================================
// auth.js - Libreria di autenticazione client-side
// Gestisce login, registrazione, logout e CRUD eventi
// Tutto su localStorage - nessun backend
// ============================================================

const AUTH_KEY = 'eis_session';   // utente loggato corrente
const USERS_KEY = 'eis_users';     // registro di tutti gli utenti
const EVENTS_KEY = 'eis_events';   // tutti gli eventi creati

// ---------- LETTURA / SCRITTURA HELPERS ----------

function _getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function _getSession() {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
}

function _saveSession(userObj) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
}

// ---------- AUTENTICAZIONE ----------

function authRegister(nome, email, password, piano) {
    // piano: 'starter' | 'professional' | 'premium'
    const users = _getUsers();
    if (users.find(u => u.email === email)) {
        return { ok: false, error: 'Email già registrata.' };
    }
    const nuovoUtente = {
        id: '_' + Math.random().toString(36).substr(2, 9),  // ID univoco semplice
        nome: nome,
        email: email,
        password: password,  // NOTA: testo in chiaro per demo
        piano: piano,
        creatoIl: new Date().toISOString()
    };
    users.push(nuovoUtente);
    _saveUsers(users);
    // Login automatico dopo registrazione
    const sessione = {
        id: nuovoUtente.id,
        nome: nome,
        email: email,
        piano: piano
    };
    _saveSession(sessione);
    return { ok: true, user: sessione };
}

function authLogin(email, password) {
    const users = _getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return { ok: false, error: 'Email o password non corrette.' };
    }
    const sessione = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        piano: user.piano
    };
    _saveSession(sessione);
    return { ok: true, user: sessione };
}

function authLogout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

function authGetCurrentUser() {
    // Restituisce l'oggetto sessione oppure null
    return _getSession();
}

function authIsLoggedIn() {
    return _getSession() !== null;
}

// ---------- PROTEZIONE PAGINE (GUARD) ----------

function authRequireLogin(redirectUrl) {
    // Da chiamare in testa alle pagine protette
    if (redirectUrl === undefined) {
        redirectUrl = 'login.html';
    }
    if (!authIsLoggedIn()) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        window.location.href = redirectUrl + '?redirect=' + encodeURIComponent(currentPage);
        return false;
    }
    return true;
}

function authRedirectIfLoggedIn(redirectUrl) {
    // Da chiamare su login.html e register.html
    // Evita che un utente già loggato veda il form di login
    if (redirectUrl === undefined) {
        redirectUrl = 'index.html';
    }
    if (authIsLoggedIn()) {
        window.location.href = redirectUrl;
    }
}

// ---------- GESTIONE EVENTI ----------

function eventiGetAll() {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
}

function eventiGetByUser(userId) {
    return eventiGetAll().filter(e => e.authorId === userId);
}

function eventiGetById(eventId) {
    const events = eventiGetAll();
    return events.find(e => e.id === eventId) || null;
}

function eventiCreate(datiEvento) {
    const user = authGetCurrentUser();
    if (!user) return { ok: false, error: 'Non autenticato.' };
    const events = eventiGetAll();
    const nuovoEvento = {
        id: '_' + Math.random().toString(36).substr(2, 9),
        titolo: datiEvento.titolo || '',
        dataInizio: datiEvento.dataInizio || '',
        dataFine: datiEvento.dataFine || '',
        location: datiEvento.location || '',
        categoria: datiEvento.categoria || '',
        descrizione: datiEvento.descrizione || '',
        immagineUrl: datiEvento.immagineUrl || '',
        prezzo: datiEvento.prezzo || '0.00',
        authorId: user.id,
        authorNome: user.nome,
        creatoIl: new Date().toISOString(),
        modificatoIl: new Date().toISOString()
    };
    events.push(nuovoEvento);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return { ok: true, evento: nuovoEvento };
}

function eventiUpdate(eventId, datiAggiornati) {
    const user = authGetCurrentUser();
    if (!user) return { ok: false, error: 'Non autenticato.' };
    const events = eventiGetAll();
    const index = events.findIndex(e => e.id === eventId && e.authorId === user.id);
    if (index === -1) return { ok: false, error: 'Evento non trovato o non autorizzato.' };
    events[index] = {
        ...events[index],
        ...datiAggiornati,
        modificatoIl: new Date().toISOString()
    };
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return { ok: true, evento: events[index] };
}

function eventiDelete(eventId) {
    const user = authGetCurrentUser();
    if (!user) return { ok: false, error: 'Non autenticato.' };
    const events = eventiGetAll();
    const filtrati = events.filter(e => !(e.id === eventId && e.authorId === user.id));
    if (filtrati.length === events.length) return { ok: false, error: 'Evento non trovato o non autorizzato.' };
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filtrati));
    return { ok: true };
}
