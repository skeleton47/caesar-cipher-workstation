/* home.js — Tactical Cryptographic Home Interactions */
document.addEventListener('DOMContentLoaded', () => {

    /* --- Interactive Vector Rotation Simulator --- */
    const slider = document.getElementById('demo-shift');
    const shiftLabel = document.getElementById('demo-shift-val');
    const shiftedRow = document.getElementById('demo-shifted');

    if (slider && shiftedRow) {
        slider.addEventListener('input', () => {
            const shift = parseInt(slider.value);
            if (shiftLabel) {
                shiftLabel.textContent = String(shift).padStart(2, '0');
            }

            const letters = shiftedRow.querySelectorAll('span');
            for (let i = 0; i < 26; i++) {
                letters[i].textContent = String.fromCharCode(65 + (i + shift) % 26);
                letters[i].style.transform = 'scale(1.15)';
                letters[i].style.borderColor = 'var(--accent-cyan)';
                setTimeout(() => {
                    letters[i].style.transform = '';
                    letters[i].style.borderColor = '';
                }, 180);
            }
        });
    }

    /* --- Animated Telemetry Counters --- */
    const counters = document.querySelectorAll('.stat-number');
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count);
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.floor(ease * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    };

    if (counters.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((c) => observer.observe(c));
    }

    /* --- Typing Terminal Header Effect --- */
    const typingEl = document.querySelector('.typing-effect');
    if (typingEl) {
        const fullText = typingEl.textContent;
        typingEl.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            typingEl.textContent += fullText[i];
            i++;
            if (i >= fullText.length) clearInterval(typeInterval);
        }, 30);
    }

    /* --- Module Card Micro-Tilt --- */
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-4px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});
