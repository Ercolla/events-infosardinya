// navbar.js - Inietta dinamicamente la navbar basata su stato auth
// Si aggiorna automaticamente quando lo stato di autenticazione cambia (es. dopo OAuth redirect)

(function () {

    // Genera l'HTML della navbar in base all'utente corrente
    function buildNavbarHTML(user) {
        return `
    <header class="bg-black sticky top-0 z-50 shadow-md">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">

                <!-- Logo -->
                <div class="flex-shrink-0">
                    <a href="index.html" class="text-white text-2xl font-bold">
                        Events<span class="text-red-500">.</span>InfoSardinya
                    </a>
                </div>

                <!-- Menu Desktop -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="index.html" class="text-white hover:text-red-500 transition text-sm font-medium">Home</a>
                    <a href="eventi.html" class="text-white hover:text-red-500 transition text-sm font-medium">Eventi</a>
                    <a href="luoghi.html" class="text-white hover:text-red-500 transition text-sm font-medium">Luoghi</a>
                    <a href="categorie.html" class="text-white hover:text-red-500 transition text-sm font-medium">Categorie</a>
                    <a href="chi-siamo.html" class="text-white hover:text-red-500 transition text-sm font-medium">Chi Siamo</a>
                    <a href="contatti.html" class="text-white hover:text-red-500 transition text-sm font-medium">Contatti</a>
                </div>

                <!-- Zona CTA / Auth - Desktop -->
                <div class="hidden md:flex items-center gap-3">
                    ${user ? _navbarLoggedIn(user) : _navbarGuest()}
                </div>

                <!-- Hamburger Mobile -->
                <button id="navbar-hamburger" class="md:hidden text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>

            </div>

            <!-- Menu Mobile -->
            <div id="navbar-mobile-menu" class="md:hidden hidden pb-4 border-t border-gray-700">
                <div class="flex flex-col space-y-2 pt-4">
                    <a href="index.html" class="text-white hover:text-red-500 py-2 text-sm font-medium">Home</a>
                    <a href="eventi.html" class="text-white hover:text-red-500 py-2 text-sm font-medium">Eventi</a>
                    <a href="luoghi.html" class="text-white hover:text-red-500 py-2 text-sm font-medium">Luoghi</a>
                    <a href="categorie.html" class="text-white hover:text-red-500 py-2 text-sm font-medium">Categorie</a>
                    <a href="chi-siamo.html" class="text-white hover:text-red-500 py-2 text-sm font-medium">Chi Siamo</a>
                    <a href="contatti.html" class="text-white hover:text-red-500 py-2 text-sm font-medium">Contatti</a>
                    <div class="pt-2 border-t border-gray-700">
                        ${user ? _navbarMobileLoggedIn(user) : _navbarMobileGuest()}
                    </div>
                </div>
            </div>

        </nav>
    </header>
    `;
    }

    function _navbarLoggedIn(user) {
        return `
        <a href="crea-evento.html"
           class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-medium transition text-sm">
            Crea Evento
        </a>
        <div class="relative" id="profile-dropdown-wrapper">
            <button id="profile-dropdown-btn"
                    class="flex items-center gap-2 text-white hover:text-red-400 transition text-sm font-medium">
                <span>${user.nome}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            <div id="profile-dropdown-menu"
                 class="hidden absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 overflow-hidden">
                <a href="miei-eventi.html"
                   class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 transition">
                    I miei eventi
                </a>
                ${authIsAdmin() ? '<a href="admin-dashboard.html" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 transition font-semibold">Admin Dashboard</a>' : ''}
                <button onclick="authLogout()"
                        class="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-100">
                    Logout
                </button>
            </div>
        </div>
        `;
    }

    function _navbarGuest() {
        return `
        <a href="login.html?redirect=crea-evento.html"
           class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-medium transition text-sm">
            Crea Evento
        </a>
        <a href="login.html"
           class="text-white hover:text-red-400 transition text-sm font-medium">
            Login
        </a>
        <a href="register.html"
           class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded font-medium transition text-sm">
            Registrati
        </a>
        `;
    }

    function _navbarMobileLoggedIn(user) {
        return `
        <p class="text-gray-400 text-xs mb-2">Ciao, ${user.nome}</p>
        <a href="crea-evento.html"
           class="block text-white hover:text-red-500 py-2 text-sm font-medium">Crea Evento</a>
        <a href="miei-eventi.html"
           class="block text-white hover:text-red-500 py-2 text-sm font-medium">I miei eventi</a>
        ${authIsAdmin() ? '<a href="admin-dashboard.html" class="block text-yellow-400 hover:text-yellow-300 py-2 text-sm font-medium font-semibold">Admin Dashboard</a>' : ''}
        <button onclick="authLogout()"
                class="block text-red-400 hover:text-red-500 py-2 text-sm font-medium w-full text-left">
            Logout
        </button>
        `;
    }

    function _navbarMobileGuest() {
        return `
        <a href="login.html?redirect=crea-evento.html"
           class="block text-white hover:text-red-500 py-2 text-sm font-medium font-semibold">Crea Evento</a>
        <a href="login.html"
           class="block text-white hover:text-red-500 py-2 text-sm font-medium">Login</a>
        <a href="register.html"
           class="block text-white hover:text-red-500 py-2 text-sm font-medium">Registrati</a>
        `;
    }

    // ---- INIEZIONE E AGGIORNAMENTO NEL DOM ----

    function renderNavbar(user) {
        var html = buildNavbarHTML(user);
        // Se la navbar è già stata iniettata, cerca il <header> per sostituirlo
        var existing = document.querySelector('header.bg-black');
        if (existing) {
            existing.outerHTML = html;
        } else {
            // Prima iniezione: sostituisci il placeholder
            var target = document.getElementById('site-navbar');
            if (target) {
                target.outerHTML = html;
            }
        }
        setupListeners();
    }

    // ---- EVENT LISTENERS (eseguiti dopo l'iniezione) ----

    function setupListeners() {
        // Hamburger toggle
        var hamburger = document.getElementById('navbar-hamburger');
        var mobileMenu = document.getElementById('navbar-mobile-menu');
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Dropdown profilo toggle
        var dropBtn = document.getElementById('profile-dropdown-btn');
        var dropMenu = document.getElementById('profile-dropdown-menu');
        if (dropBtn && dropMenu) {
            dropBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                dropMenu.classList.toggle('hidden');
            });
            document.addEventListener('click', function() {
                dropMenu.classList.add('hidden');
            });
        }
    }

    // ---- INIZIALIZZAZIONE ----

    function initNavbar() {
        // Render iniziale con dati sincroni da localStorage
        var user = authGetCurrentUser();
        renderNavbar(user);

        // Ascolta i cambiamenti di stato auth da Supabase (es. dopo redirect OAuth)
        if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
            supabaseClient.auth.onAuthStateChange(function(event, session) {
                var updatedUser = null;
                if (session && session.user) {
                    var u = session.user;
                    updatedUser = {
                        id: u.id,
                        nome: (u.user_metadata && u.user_metadata.nome) || (u.user_metadata && u.user_metadata.full_name) || u.email.split('@')[0],
                        email: u.email,
                        piano: 'starter'
                    };
                }
                // Ri-renderizza la navbar con lo stato aggiornato
                renderNavbar(updatedUser);
            });
        }
    }

    // Aspetta che il DOM sia pronto, poi inietta
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }

})();
