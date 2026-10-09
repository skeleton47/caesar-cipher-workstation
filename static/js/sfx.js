/* ==========================================================================
   CYBER SFX & PAGE TRANSITION ENGINE
   Zero-dependency Web Audio API Synthesizer + Smooth Cyber Glitch Wipe
   ========================================================================== */

const CyberSFX = {
    ctx: null,
    enabled: true,

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
        const btn = document.getElementById('sfx-toggle');
        if (btn) {
            btn.textContent = this.enabled ? '[SFX: ON]' : '[SFX: OFF]';
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
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.035);
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
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(920, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
        } catch (e) {}
    },

    // High-Tech Decryption Chime / Success Reveal
    success() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const freqs = [659.25, 987.77, 1318.51]; // E5, B5, E6 futuristic chime
            freqs.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                const startTime = now + idx * 0.06;
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.2);
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
            osc.frequency.setValueAtTime(540, now);
            osc.frequency.exponentialRampToValueAtTime(760, now + 0.045);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.045);
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
                gain.gain.setValueAtTime(0.07, t);
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
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    },

    // Satisfying Bubble Pop Typing Sound (صوت ببل خفيف وسلس للكتابة)
    bubblePop() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Organic frequency sweep: creates an authentic water drop / bubble pop chirp
            const startFreq = 450 + Math.random() * 260;
            const endFreq = startFreq * (1.8 + Math.random() * 0.35);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.038);

            // Fast exponential decay envelope
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.048);
        } catch (e) {}
    }
};

// ─── Seamless Cyber Page Transitions & Event Bindings ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const curtain = document.getElementById('cyber-curtain');
    const sfxBtn = document.getElementById('sfx-toggle');

    // SFX Toggle button event
    if (sfxBtn) {
        sfxBtn.addEventListener('click', (e) => {
            e.preventDefault();
            CyberSFX.toggle();
        });
    }

    // Open transition curtain on load
    if (curtain) {
        curtain.classList.add('opening');
        setTimeout(() => {
            curtain.classList.remove('opening');
            curtain.classList.add('idle');
        }, 360);
    }

    // Intercept navigation links for smooth cyber wipe transition
    document.querySelectorAll('.nav-link, a[href^="/"]').forEach(link => {
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
            }, 260);
        });
    });

    // Sound binding for all interactive buttons
    document.querySelectorAll('.tab-item, .chrome-btn, .shift-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            CyberSFX.click();
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
