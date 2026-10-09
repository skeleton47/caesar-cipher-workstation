/* theme.js — Display Mode / CRT Palette Toggle (No Emojis) */
(function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function updateLabel(isDark) {
        btn.innerHTML = `<span class="mode-text">THEME: ${isDark ? 'CRT_DARK' : 'BLUEPRINT'}</span>`;
    }

    const saved = localStorage.getItem('cipher-theme');
    // Default to dark cyber mode
    const isDark = saved === 'light' ? false : true;

    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
    updateLabel(isDark);

    btn.addEventListener('click', () => {
        const currentlyDark = document.body.getAttribute('data-theme') === 'dark';
        if (currentlyDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('cipher-theme', 'light');
            updateLabel(false);
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('cipher-theme', 'dark');
            updateLabel(true);
        }
    });
})();
