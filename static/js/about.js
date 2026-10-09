/* about.js — About page: frequency chart */
document.addEventListener('DOMContentLoaded', () => {
    const chart = document.getElementById('freq-chart');
    if (!chart) return;

    const freqs = {
        a: 8.2, b: 1.5, c: 2.8, d: 4.3, e: 12.7, f: 2.2,
        g: 2.0, h: 6.1, i: 7.0, j: 0.15, k: 0.77, l: 4.0,
        m: 2.4, n: 6.7, o: 7.5, p: 1.9, q: 0.1, r: 6.0,
        s: 6.3, t: 9.1, u: 2.8, v: 1.0, w: 2.4, x: 0.15,
        y: 2.0, z: 0.07,
    };

    const max = Math.max(...Object.values(freqs));

    Object.entries(freqs).forEach(([letter, freq]) => {
        const bar = document.createElement('div');
        bar.className = 'freq-bar';
        bar.style.height = (freq / max) * 100 + '%';
        bar.setAttribute('data-letter', letter.toUpperCase());
        bar.title = `${letter.toUpperCase()}: ${freq}%`;
        chart.appendChild(bar);
    });
});
