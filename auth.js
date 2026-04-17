// ============================================================
// auth.js - Autenticazione tramite Supabase Auth
// Gestisce login, registrazione (email + Google OAuth), logout
// ============================================================

// Chiave localStorage usata internamente da Supabase per la sessione
var SUPABASE_AUTH_STORAGE_KEY = 'sb-jugdaypvqvpwvtfgrsqh-auth-token';

// ---------- LETTURA SESSIONE (sincrona, per navbar) ----------

function authGetCurrentUser() {
    try {
        var stored = localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY);
        if (!stored) return null;
        var session = JSON.parse(stored);
        // Supabase v2 salva { access_token, user, ... }
        var u = session && session.user ? session.user : null;
        if (!u) return null;
        return {
            id: u.id,
            nome: (u.user_metadata && u.user_metadata.nome) || (u.user_metadata && u.user_metadata.full_name) || u.email.split('@')[0],
            email: u.email,
            piano: 'starter'
        };
    } catch (e) {
        return null;
    }
}

function authIsLoggedIn() {
    return authGetCurrentUser() !== null;
}

// ---------- REGISTRAZIONE ----------

async function authRegister(nome, email, password, newsletterOptIn) {
    var result = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { nome: nome, piano: 'starter', newsletter_opt_in: !!newsletterOptIn },
            emailRedirectTo: window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'login.html?verified=1'
        }
    });

    if (result.error) {
        // Traduci errori comuni in italiano
        var msg = result.error.message;
        if (msg.includes('already registered')) msg = 'Questa email è già registrata.';
        if (msg.includes('valid email')) msg = 'Inserisci un indirizzo email valido.';
        if (msg.includes('at least')) msg = 'La password deve essere di almeno 6 caratteri.';
        return { ok: false, error: msg };
    }

    // Se Supabase richiede conferma email, l'utente non è ancora loggato
    var needsConfirmation = result.data.user && !result.data.session;
    return { ok: true, user: result.data.user, needsConfirmation: needsConfirmation };
}

// ---------- LOGIN ----------

async function authLogin(email, password) {
    var result = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (result.error) {
        var msg = result.error.message;
        if (msg.includes('Invalid login')) msg = 'Email o password non corrette.';
        if (msg.includes('Email not confirmed')) msg = 'Devi confermare la tua email prima di accedere. Controlla la tua casella di posta.';
        return { ok: false, error: msg };
    }

    return { ok: true, user: result.data.user };
}

// ---------- LOGIN CON GOOGLE ----------

async function authLoginWithGoogle() {
    var result = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'login.html?provider=google'
        }
    });

    if (result.error) {
        return { ok: false, error: result.error.message };
    }
    return { ok: true };
}

// ---------- LOGOUT ----------

async function authLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

// ---------- RECUPERO PASSWORD ----------

async function authResetPassword(email) {
    var result = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'imposta-nuova-password.html'
    });

    if (result.error) {
        var msg = result.error.message;
        if (msg.includes('rate limit')) msg = 'Troppi tentativi. Riprova fra qualche minuto.';
        return { ok: false, error: msg };
    }

    return { ok: true };
}

async function authUpdatePassword(newPassword) {
    var result = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (result.error) {
        var msg = result.error.message;
        if (msg.includes('at least')) msg = 'La password deve essere di almeno 6 caratteri.';
        if (msg.includes('same password')) msg = 'La nuova password deve essere diversa dalla precedente.';
        return { ok: false, error: msg };
    }

    return { ok: true };
}

// ---------- GESTIONE RUOLO ADMIN ----------

// Lista delle email autorizzate come admin
var ADMIN_EMAILS = ['ercolla@gmail.com'];

function authIsAdmin() {
    var user = authGetCurrentUser();
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.indexOf(user.email) !== -1;
}

function authRequireAdmin(redirectUrl) {
    if (redirectUrl === undefined) redirectUrl = 'index.html';
    if (!authIsLoggedIn() || !authIsAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// ---------- PROTEZIONE PAGINE (GUARD) ----------

function authRequireLogin(redirectUrl) {
    if (redirectUrl === undefined) redirectUrl = 'login.html';
    if (!authIsLoggedIn()) {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        window.location.href = redirectUrl + '?redirect=' + encodeURIComponent(currentPage);
        return false;
    }
    return true;
}

function authRedirectIfLoggedIn(redirectUrl) {
    if (redirectUrl === undefined) redirectUrl = 'index.html';
    if (authIsLoggedIn()) {
        window.location.href = redirectUrl;
    }
}
