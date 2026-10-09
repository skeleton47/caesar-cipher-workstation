/* ==========================================================================
   CYBER SFX & PAGE TRANSITION SYNTHESIZER ENGINE
   Zero-dependency Web Audio API Synthesis + Cyber Glitch Wipe + Bubble Pop SFX
   ========================================================================== */

const CyberSFX = {
    ctx: null,
    enabled: localStorage.getItem('cipher_sfx_enabled') !== 'false',

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('cipher_sfx_enabled', this.enabled ? 'true' : 'false');
        const btn = document.getElementById('sfx-toggle');
        if (btn) {
            btn.innerHTML = `<span class="sfx-state-dot"></span> [SFX: ${this.enabled ? 'ON' : 'OFF'}]`;
            btn.classList.toggle('muted', !this.enabled);
        }
        if (this.enabled) {
            this.click();
        }
    },

    // Tactile High-Tech Click
    click() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1020, now);
            osc.frequency.exponentialRampToValueAtTime(340, now + 0.032);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.032);
        } catch (e) {}
    },

    // Powerful Cyber Warp / Payload Execution Sweep
    execute() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(240, now + 0.26);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.26);
        } catch (e) {}
    },

    // High-Tech Decryption Chime / Success Reveal
    success() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const freqs = [659.25, 987.77, 1318.51]; // E5, B5, E6 harmonic chord
            freqs.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                const startTime = now + idx * 0.055;
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.16, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.22);
            });
        } catch (e) {}
    },

    // Rotary Shift Navigation
    shift() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(560, now);
            osc.frequency.exponentialRampToValueAtTime(820, now + 0.04);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {}
    },

    // Buffer Copied Confirmation
    copy() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            [880, 1320].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                const t = now + idx * 0.04;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.06, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.045);
            });
        } catch (e) {}
    },

    // Warp Page Navigation Sound
    transition() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(1450, now + 0.16);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
        } catch (e) {}
    },

    // Satisfying Bubble Pop Typing Sound (صوت ببل ممتع وسلس للكتابة)
    bubblePop() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Organic frequency sweep: authentic water drop / bubble pop chirp
            const startFreq = 480 + Math.random() * 240;
            const endFreq = startFreq * (1.75 + Math.random() * 0.3);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.042);
        } catch (e) {}
    }
};

// ─── Seamless Cyber Transitions & Keyboard SFX Listeners ────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const curtain = document.getElementById('cyber-curtain');
    const sfxBtn  = document.getElementById('sfx-toggle');

    // Restore saved toggle state
    if (sfxBtn) {
        sfxBtn.innerHTML = `<span class="sfx-state-dot"></span> [SFX: ${CyberSFX.enabled ? 'ON' : 'OFF'}]`;
        sfxBtn.classList.toggle('muted', !CyberSFX.enabled);
        sfxBtn.addEventListener('click', (e) => {
            e.preventDefault();
            CyberSFX.toggle();
        });
    }

    // Open transition curtain smoothly on load
    if (curtain) {
        curtain.classList.add('opening');
        setTimeout(() => {
            curtain.classList.remove('opening');
            curtain.classList.add('idle');
        }, 320);
    }

    // Intercept navigation links for smooth cyber wipe transition
    document.querySelectorAll('.nav-item, a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('javascript:')) return;
            if (link.getAttribute('target') === '_blank') return;

            e.preventDefault();
            CyberSFX.transition();

            if (curtain) {
                curtain.classList.remove('idle');
                curtain.classList.add('closing');
            }

            setTimeout(() => {
                window.location.href = targetUrl;
            }, 250);
        });
    });

    // Bubble Pop sound on keyboard typing
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
            // Ignore standalone modifier keys
            if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
                return;
            }
            CyberSFX.bubblePop();
        }
    });
});
