/* ==========================================================================
   DESIGN SYSTEM VERSION SWITCHER
   Toggles between:
     - Version 2.0: Neo-Brutalist (Paper Beige, Thick Black Strokes, Solid Accents)
     - Version 1.0: Cyber-Glitch (Dark Grunge Slate, CRT Scanlines, Blood Crimson)
   ========================================================================== */

(function () {
    const btn = document.getElementById('version-toggle');
    const curtain = document.getElementById('cyber-curtain');

    // Default to Neo-Brutalist per user design system request
    const savedVer = localStorage.getItem('cipher-design-system');
    let currentVer = savedVer ? savedVer : 'neo';

    function setVersion(ver, playSound = false) {
        currentVer = ver;
        localStorage.setItem('cipher-design-system', ver);

        if (curtain) {
            curtain.classList.add('closing');
            setTimeout(() => {
                applyClasses(ver);
                curtain.classList.remove('closing');
                curtain.classList.add('opening');
                setTimeout(() => curtain.classList.remove('opening'), 320);
            }, 180);
        } else {
            applyClasses(ver);
        }

        if (playSound && window.CyberSFX) {
            CyberSFX.click();
        }
    }

    function applyClasses(ver) {
        if (ver === 'cyber') {
            document.body.classList.remove('neo-brutalist-theme');
            document.body.classList.add('brutalist-theme');
            if (btn) btn.textContent = '[STYLE: CYBER-DARK]';
        } else {
            document.body.classList.remove('brutalist-theme');
            document.body.classList.add('neo-brutalist-theme');
            if (btn) btn.textContent = '[STYLE: NEO-BRUTALIST]';
        }

        // Notify other components (like wireframe canvas)
        window.dispatchEvent(new CustomEvent('cipherThemeChanged', { detail: { theme: ver } }));
    }

    // Apply initial theme immediately
    applyClasses(currentVer);

    if (btn) {
        btn.addEventListener('click', () => {
            const nextVer = currentVer === 'neo' ? 'cyber' : 'neo';
            setVersion(nextVer, true);
        });
    }
})();
