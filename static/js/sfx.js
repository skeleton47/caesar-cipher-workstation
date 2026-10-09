/* ==========================================================================
   CIPHER_OS // PROCEDURAL AUDIO & TACTILE SFX ENGINE
   Web Audio API Synthesis with Pure Waveforms (Zero Audio File Assets)
   Acoustic Tuning: Organic Bubble Pop Typing, Tactical Clicks, Warp Execution
   ========================================================================== */

const CyberSFX = {
    ctx: null,
    enabled: localStorage.getItem('cipher_sfx_enabled') !== 'false',
    lastBubbleTime: 0,

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

    // Satisfying Bubble Pop Typing Sound (Water droplet / bubble pop ASMR)
    bubblePop() {
        if (!this.enabled) return;
        const nowMs = Date.now();
        // Rate-limit by 28ms to prevent audio buffer stacking/distortion on rapid typing
        if (nowMs - this.lastBubbleTime < 28) return;
        this.lastBubbleTime = nowMs;

        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Organic frequency sweep: 440Hz -> 1180Hz over 35ms creates authentic water droplet bloop
            const baseFreq = 420 + Math.random() * 180;
            const targetFreq = baseFreq * (2.2 + Math.random() * 0.3);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.026);
            osc.frequency.exponentialRampToValueAtTime(targetFreq * 0.85, t + 0.042);

            // Fast exponential decay envelope
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.044);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.044);
        } catch (e) {}
    },

    // Tactical High-Tech Click (UI Buttons)
    click() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(920, t);
            osc.frequency.exponentialRampToValueAtTime(320, t + 0.028);

            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.028);
        } catch (e) {}
    },

    // Rotary Shift Click
    shift() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(540, t);
            osc.frequency.exponentialRampToValueAtTime(780, t + 0.035);

            gain.gain.setValueAtTime(0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.035);
        } catch (e) {}
    },

    // Authoritative Cyber Warp Execution Sweep
    execute() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
            osc.frequency.exponentialRampToValueAtTime(220, t + 0.24);

            gain.gain.setValueAtTime(0.16, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.24);
        } catch (e) {}
    },

    // High-Tech Decryption Chime
    success() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const chord = [659.25, 987.77, 1318.51]; // E5, B5, E6
            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                const startT = t + idx * 0.05;
                osc.frequency.setValueAtTime(freq, startT);

                gain.gain.setValueAtTime(0.12, startT);
                gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.20);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startT);
                osc.stop(startT + 0.20);
            });
        } catch (e) {}
    },

    // Clipboard Copy Confirmation
    copy() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            [880, 1320].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'square';
                const startT = t + idx * 0.038;
                osc.frequency.setValueAtTime(freq, startT);

                gain.gain.setValueAtTime(0.05, startT);
                gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.04);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startT);
                osc.stop(startT + 0.04);
            });
        } catch (e) {}
    },

    // Page Transition Warp
    transition() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, t);
            osc.frequency.exponentialRampToValueAtTime(1300, t + 0.14);

            gain.gain.setValueAtTime(0.11, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.16);
        } catch (e) {}
    }
};

// ─── Setup UI SFX Listeners on Page Ready ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const curtain = document.getElementById('cyber-curtain');
    const sfxBtn = document.getElementById('sfx-toggle');

    if (sfxBtn) {
        sfxBtn.innerHTML = `<span class="sfx-state-dot"></span> [SFX: ${CyberSFX.enabled ? 'ON' : 'OFF'}]`;
        sfxBtn.classList.toggle('muted', !CyberSFX.enabled);
        sfxBtn.addEventListener('click', (e) => {
            e.preventDefault();
            CyberSFX.toggle();
        });
    }

    // Smooth page curtain fade-in on load
    if (curtain) {
        curtain.classList.add('opening');
        setTimeout(() => {
            curtain.classList.remove('opening');
            curtain.classList.add('idle');
        }, 280);
    }

    // Intercept navigation links for smooth cyber transition
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
            }, 220);
        });
    });

    // Bubble pop sound on keyboard input
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
            if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
            CyberSFX.bubblePop();
        }
    });
});
