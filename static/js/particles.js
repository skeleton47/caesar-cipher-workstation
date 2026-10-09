/* particles.js — Floating pixel particles */
(function () {
    const container = document.getElementById('particles');
    if (!container) return;

    const PARTICLE_COUNT = 25;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('div');
        p.classList.add('pixel-particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.width = (4 + Math.random() * 6) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (8 + Math.random() * 15) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        p.style.opacity = 0.15 + Math.random() * 0.25;
        container.appendChild(p);
    }
})();
