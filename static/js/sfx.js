/* ==========================================================================
   CIPHER LAB // PROCEDURAL AUDIO & TACTILE SFX ENGINE
   Pure Web Audio API Waveform Synthesizer (Zero Audio File Assets)
   Acoustic Tuning: Organic Bubble Pop Typing, Tactile Soft Clicks, Chimes
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
        this.syncUI();
        if (this.enabled) {
            this.click();
        }
    },

    syncUI() {
        const label = document.getElementById('sfx-label');
        const btn = document.getElementById('sfx-toggle');
        if (label) {
            label.textContent = `SFX: ${this.enabled ? 'ON' : 'OFF'}`;
        }
        if (btn) {
            btn.classList.toggle('muted', !this.enabled);
        }
    },

    // Satisfying Bubble Pop Typing Sound (Water droplet / bubble pop ASMR)
    bubblePop() {
        if (!this.enabled) return;
        const nowMs = Date.now();
        // Rate-limit by 30ms to prevent audio buffer stacking/distortion on rapid typing
        if (nowMs - this.lastBubbleTime < 30) return;
        this.lastBubbleTime = nowMs;

        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Organic frequency sweep: 420Hz -> 1150Hz over 32ms creates authentic water droplet bloop
            const baseFreq = 400 + Math.random() * 160;
            const targetFreq = baseFreq * (2.1 + Math.random() * 0.25);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.024);
            osc.frequency.exponentialRampToValueAtTime(targetFreq * 0.82, t + 0.040);

            // Fast exponential decay envelope with gentle volume
            gain.gain.setValueAtTime(0.065, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.042);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.042);
        } catch (e) {}
    },

    // Tactile Soft UI Click
    click() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(280, t + 0.024);

            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.024);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.024);
        } catch (e) {}
    },

    // Rotary Shift Stepper Tick
    shift() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(740, t + 0.028);

            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.028);
        } catch (e) {}
    },

    // Primary Action Trigger Sweep
    execute() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(720, t + 0.09);
            osc.frequency.exponentialRampToValueAtTime(320, t + 0.18);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.18);
        } catch (e) {}
    },

    // Success Reveal Harmonic Chime
    success() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                const startT = t + idx * 0.045;
                osc.frequency.setValueAtTime(freq, startT);

                gain.gain.setValueAtTime(0.08, startT);
                gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.18);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startT);
                osc.stop(startT + 0.18);
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
            [659.25, 880].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                const startT = t + idx * 0.035;
                osc.frequency.setValueAtTime(freq, startT);

                gain.gain.setValueAtTime(0.05, startT);
                gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.04);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startT);
                osc.stop(startT + 0.04);
            });
        } catch (e) {}
    }
};

// ─── Setup Listeners on DOM Ready ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    CyberSFX.syncUI();

    const sfxBtn = document.getElementById('sfx-toggle');
    if (sfxBtn) {
        sfxBtn.addEventListener('click', (e) => {
            e.preventDefault();
            CyberSFX.toggle();
        });
    }

    // Gentle bubble pop on typing in text areas
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
            if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
            CyberSFX.bubblePop();
        }
    });
});
