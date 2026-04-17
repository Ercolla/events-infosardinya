// ============================================================
// cookie-banner.js - Banner GDPR per la gestione dei cookie
// Inietta un banner in fondo alla pagina se l'utente non ha
// ancora espresso la propria preferenza (localStorage).
// ============================================================

(function () {
    // Se l'utente ha già scelto, non mostrare il banner
    if (localStorage.getItem('cookieConsent')) return;

    // Crea il banner
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText =
        'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
        'background:#151515;color:#fff;padding:1rem 1.5rem;' +
        'font-family:Poppins,sans-serif;font-size:0.875rem;' +
        'box-shadow:0 -4px 20px rgba(0,0,0,0.3);' +
        'animation:cookieSlideUp .5s ease-out;';

    banner.innerHTML =
        '<div style="max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:1rem;justify-content:space-between;">' +
            // Testo
            '<p style="margin:0;flex:1;min-width:280px;line-height:1.6;color:rgba(255,255,255,0.9);">' +
                'Utilizziamo i cookie per offrirti la migliore esperienza sul nostro sito e per scopi di sicurezza (autenticazione). ' +
                'Continua a navigare o scegli le tue preferenze. ' +
                '<a href="cookie-policy.html" style="color:#F9B233;text-decoration:underline;font-weight:600;">Leggi la Policy</a>' +
            '</p>' +
            // Pulsanti
            '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">' +
                '<button id="cookie-accept-all" style="' +
                    'padding:0.625rem 1.5rem;border:none;border-radius:0.375rem;' +
                    'background:#0077B6;color:#fff;font-weight:600;font-size:0.875rem;' +
                    'cursor:pointer;transition:all .3s ease;font-family:Poppins,sans-serif;' +
                '">Accetta Tutti</button>' +
                '<button id="cookie-essential-only" style="' +
                    'padding:0.625rem 1.5rem;border:2px solid #F9B233;border-radius:0.375rem;' +
                    'background:transparent;color:#F9B233;font-weight:600;font-size:0.875rem;' +
                    'cursor:pointer;transition:all .3s ease;font-family:Poppins,sans-serif;' +
                '">Solo Essenziali</button>' +
            '</div>' +
        '</div>';

    // Stile animazione
    var style = document.createElement('style');
    style.textContent =
        '@keyframes cookieSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}' +
        '@keyframes cookieFadeOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(100%)}}' +
        '#cookie-accept-all:hover{background:#005f92!important;transform:translateY(-1px);}' +
        '#cookie-essential-only:hover{background:rgba(249,178,51,0.15)!important;transform:translateY(-1px);}';
    document.head.appendChild(style);

    // Aggiungi il banner alla pagina
    document.body.appendChild(banner);

    // Funzione per chiudere il banner con animazione
    function closeBanner(choice) {
        localStorage.setItem('cookieConsent', choice);
        banner.style.animation = 'cookieFadeOut .4s ease-in forwards';
        setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 400);
    }

    // Event listener sui pulsanti
    document.getElementById('cookie-accept-all').addEventListener('click', function () {
        closeBanner('all');
    });

    document.getElementById('cookie-essential-only').addEventListener('click', function () {
        closeBanner('essential');
    });
})();
