// Lightbox / Modale per immagini eventi
// Si attiva cliccando su qualsiasi immagine con classe "lightbox-trigger"

(function () {
    // Crea la modale e la inietta nel DOM
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 opacity-0 pointer-events-none transition-opacity duration-300';
    overlay.innerHTML = `
        <button id="lightbox-close" class="absolute top-4 right-4 text-white text-4xl font-bold leading-none hover:text-yellow-300 transition-colors cursor-pointer z-10" aria-label="Chiudi">&times;</button>
        <img id="lightbox-img" src="" alt="Immagine ingrandita"
             class="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl transform scale-90 transition-transform duration-300" />
    `;
    document.body.appendChild(overlay);

    const lbImg = document.getElementById('lightbox-img');
    const lbClose = document.getElementById('lightbox-close');

    // Apri lightbox
    function openLightbox(src) {
        lbImg.src = src;
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'pointer-events-auto');
        lbImg.classList.remove('scale-90');
        lbImg.classList.add('scale-100');
        document.body.style.overflow = 'hidden'; // blocca scroll pagina
    }

    // Chiudi lightbox
    function closeLightbox() {
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        lbImg.classList.remove('scale-100');
        lbImg.classList.add('scale-90');
        document.body.style.overflow = '';
    }

    // Click sulla X
    lbClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
    });

    // Click sullo sfondo scuro (fuori dall'immagine)
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    // Tasto ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });

    // Intercetta click su immagini con classe "lightbox-trigger"
    // Usa event delegation sul body per funzionare anche su contenuti caricati dinamicamente
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('.lightbox-trigger');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation(); // evita navigazione alla pagina dettaglio
            const src = trigger.tagName === 'IMG' ? trigger.src : trigger.querySelector('img')?.src;
            if (src) openLightbox(src);
        }
    });
})();
