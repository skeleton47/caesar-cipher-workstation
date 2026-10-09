/* ==========================================================================
   CIPHER_OS // CAESAR WORKSTATION TACTICAL CORE ENGINE
   Entropy Telemetry, Frequency Spectrum, Hidden Result Drawer, SFX Dispatch
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ─── DOM References ──────────────────────────────────────────────────────
    const msgInput          = document.getElementById('message-input');
    const charCount         = document.getElementById('char-count');
    const shiftInput        = document.getElementById('shift-value');
    const shiftSlider       = document.getElementById('shift-slider');
    const shiftMinus        = document.getElementById('shift-minus');
    const shiftPlus         = document.getElementById('shift-plus');
    const actionBtn         = document.getElementById('action-btn');
    const btnCaptionText    = document.getElementById('btn-caption-text');
    const resultFieldBlock  = document.getElementById('result-field-block');
    const resultOutput      = document.getElementById('result-output');
    const streamStatusBadge = document.getElementById('stream-status-badge');
    const statusBadge       = document.getElementById('status-badge');
    const vectorMetaVal     = document.getElementById('vector-meta-val');
    const paramHexBadge     = document.getElementById('param-hex-badge');
    const paramNumPreview   = document.getElementById('param-num-preview');
    const copyBtn           = document.getElementById('copy-btn');
    const swapBtn           = document.getElementById('swap-btn');
    const downloadBtn       = document.getElementById('download-btn');
    const modeBtns          = document.querySelectorAll('.btn-bracket-cmd');
    
    // Presets
    const btnDispatch       = document.getElementById('btn-sample-dispatch');
    const btnRot13          = document.getElementById('btn-preset-rot13');
    const btnSampleCrack    = document.getElementById('btn-sample-crack');
    const btnClearInput     = document.getElementById('btn-clear-input');

    // Right Column View Switcher
    const tabBtnDossier     = document.getElementById('tab-btn-dossier');
    const tabBtnSpectrum    = document.getElementById('tab-btn-spectrum');
    const paneDossier       = document.getElementById('pane-dossier');
    const paneSpectrum      = document.getElementById('pane-spectrum');
    const freqBarsGrid      = document.getElementById('freq-bars-grid');
    const crackRankingsBox  = document.getElementById('crack-rankings-box');
    const crackCandidatesList = document.getElementById('crack-candidates-list');

    // Telemetry Tags
    const entropyTag        = document.getElementById('entropy-tag');
    const iocTag            = document.getElementById('ioc-tag');
    const liveUtcClock      = document.getElementById('live-utc-clock');

    let currentMode = 'encrypt';
    let isResultRevealed = false;

    // Standard English letter frequency distribution (ETAOIN SHRDLU baseline %)
    const ENGLISH_FREQ = {
        'A': 8.17, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.70, 'F': 2.23,
        'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15, 'K': 0.77,  'L': 4.03,
        'M': 2.41, 'N': 6.75, 'O': 7.51, 'P': 1.93, 'Q': 0.10,  'R': 5.99,
        'S': 6.33, 'T': 9.06, 'U': 2.76, 'V': 0.98, 'W': 2.36,  'X': 0.15,
        'Y': 1.97, 'Z': 0.07
    };

    // ─── Live UTC Military Clock ─────────────────────────────────────────────
    function updateClock() {
        if (!liveUtcClock) return;
        const now = new Date();
        const pad = (n, l = 2) => String(n).padStart(l, '0');
        liveUtcClock.textContent = `UTC ${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}.${pad(Math.floor(now.getUTCMilliseconds() / 10), 2)}`;
    }
    setInterval(updateClock, 100);
    updateClock();

    // ─── Tactical Toast Notification ─────────────────────────────────────────
    function showToast(text) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="color:#e6323e;font-weight:bold;">[TACTICAL_SYS]</span> &gt;&gt; ${text}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ─── Shannon Entropy & Index of Coincidence (IoC) Telemetry ──────────────
    function computeTelemetry(text) {
        const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
        const len = clean.length;

        if (len === 0) {
            if (entropyTag) entropyTag.textContent = '0.00 BPC';
            if (iocTag) iocTag.textContent = 'IoC: 0.000';
            return;
        }

        const counts = {};
        for (let i = 0; i < len; i++) {
            const ch = clean[i];
            counts[ch] = (counts[ch] || 0) + 1;
        }

        // Shannon Entropy: H = -sum(p * log2(p))
        let entropy = 0;
        let sumFreqSq = 0;
        for (const ch in counts) {
            const p = counts[ch] / len;
            entropy -= p * Math.log2(p);
            sumFreqSq += counts[ch] * (counts[ch] - 1);
        }

        // Index of Coincidence: Ic = sum(f_i * (f_i - 1)) / (N * (N - 1))
        let ioc = len > 1 ? (sumFreqSq / (len * (len - 1))) : 0;

        if (entropyTag) {
            entropyTag.textContent = `${entropy.toFixed(2)} BPC`;
        }
        if (iocTag) {
            iocTag.textContent = `IoC: ${ioc.toFixed(3)}`;
        }
    }

    // ─── Frequency Analysis Spectrum Chart Rendering ─────────────────────────
    function initFrequencyChart() {
        if (!freqBarsGrid) return;
        freqBarsGrid.innerHTML = '';

        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const col = document.createElement('div');
            col.className = 'freq-col';
            col.dataset.letter = letter;

            col.innerHTML = `
                <div class="bars-container">
                    <div class="freq-bar bar-payload" id="pbar-${letter}" style="height: 0%;" title="${letter} Payload"></div>
                    <div class="freq-bar bar-baseline" id="bbar-${letter}" style="height: ${Math.min(100, (ENGLISH_FREQ[letter] / 13) * 100)}%;" title="${letter} English Baseline (${ENGLISH_FREQ[letter]}%)"></div>
                </div>
                <span class="freq-label">${letter}</span>
            `;
            freqBarsGrid.appendChild(col);
        }
    }

    function updateFrequencyChart(text) {
        if (!freqBarsGrid) return;
        const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
        const total = clean.length;

        const counts = {};
        for (let i = 0; i < total; i++) {
            const ch = clean[i];
            counts[ch] = (counts[ch] || 0) + 1;
        }

        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const pBar = document.getElementById(`pbar-${letter}`);
            if (pBar) {
                const count = counts[letter] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                // Scale height relative to 14% max height
                const barHeightPct = Math.min(100, (pct / 14) * 100);
                pBar.style.height = `${barHeightPct}%`;
                pBar.title = `${letter} Payload: ${pct.toFixed(1)}% (${count} hits)`;
            }
        }
    }

    // ─── Shift Vector & Hex Hud ──────────────────────────────────────────────
    function updateVectorHUD() {
        let s = parseInt(shiftInput ? shiftInput.value : 3) || 3;
        s = ((s % 26) + 26) % 26;
        if (s === 0) s = 1;

        const targetChar = String.fromCharCode(65 + s);
        const hexFrom = '0x41';
        const hexTo = '0x' + (65 + s).toString(16).toUpperCase();

        if (vectorMetaVal) {
            vectorMetaVal.innerHTML = `A [${hexFrom}] &rarr; ${targetChar} [${hexTo}] (ROT-${String(s).padStart(2, '0')})`;
        }
        if (paramHexBadge) {
            paramHexBadge.textContent = `0x${s.toString(16).toUpperCase().padStart(8, '0')} (ROT-${String(s).padStart(2, '0')})`;
        }
        if (paramNumPreview) {
            paramNumPreview.textContent = `SHIFT: ${s}`;
        }

        if (shiftSlider && shiftSlider.value != s) {
            shiftSlider.value = s;
        }
        if (shiftInput && shiftInput.value != s) {
            shiftInput.value = s;
        }
    }

    // ─── Shift Synchronizer ──────────────────────────────────────────────────
    function setShift(val) {
        let s = parseInt(val) || 3;
        if (s < 1) s = 25;
        if (s > 25) s = 1;

        if (shiftInput) shiftInput.value = s;
        if (shiftSlider) shiftSlider.value = s;

        updateVectorHUD();
        if (window.CyberSFX) CyberSFX.shift();

        // Keep result live if already revealed
        if (isResultRevealed) {
            triggerProcessing(false);
        }
    }

    if (shiftMinus) {
        shiftMinus.addEventListener('click', () => {
            const current = parseInt(shiftInput.value) || 3;
            setShift(current - 1);
        });
    }

    if (shiftPlus) {
        shiftPlus.addEventListener('click', () => {
            const current = parseInt(shiftInput.value) || 3;
            setShift(current + 1);
        });
    }

    if (shiftInput) {
        shiftInput.addEventListener('input', () => {
            let v = parseInt(shiftInput.value);
            if (!isNaN(v)) setShift(v);
        });
    }

    if (shiftSlider) {
        shiftSlider.addEventListener('input', (e) => {
            setShift(e.target.value);
        });
    }

    // ─── Input Payloads & Character Counters ─────────────────────────────────
    if (msgInput) {
        msgInput.addEventListener('input', () => {
            const len = msgInput.value.length;
            if (len > 500) msgInput.value = msgInput.value.substring(0, 500);
            if (charCount) charCount.textContent = msgInput.value.length;

            computeTelemetry(msgInput.value);
            updateFrequencyChart(msgInput.value);

            if (isResultRevealed) triggerProcessing(false);
        });
    }

    // ─── Mode Switching (ENCRYPT / DECRYPT / CRACK) ──────────────────────────
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            if (currentMode === 'encrypt') {
                if (btnCaptionText) btnCaptionText.textContent = 'EXECUTE CIPHER PAYLOAD';
                if (statusBadge) statusBadge.textContent = 'CIPHER ARMED';
                if (crackRankingsBox) crackRankingsBox.style.display = 'none';
            } else if (currentMode === 'decrypt') {
                if (btnCaptionText) btnCaptionText.textContent = 'DECRYPT INTERCEPTED STREAM';
                if (statusBadge) statusBadge.textContent = 'DECRYPT ARMED';
                if (crackRankingsBox) crackRankingsBox.style.display = 'none';
            } else if (currentMode === 'crack') {
                if (btnCaptionText) btnCaptionText.textContent = 'LAUNCH BRUTE-FORCE CRACK';
                if (statusBadge) statusBadge.textContent = 'CRACK ARMED';
                if (crackRankingsBox) crackRankingsBox.style.display = 'block';
            }

            if (window.CyberSFX) CyberSFX.click();
            hideResult(); // Keep result hidden on mode change until action button clicked!
        });
    });

    // ─── Right Column View Switcher (Dossier vs Spectrum) ────────────────────
    if (tabBtnDossier && tabBtnSpectrum) {
        tabBtnDossier.addEventListener('click', () => {
            tabBtnDossier.classList.add('active');
            tabBtnSpectrum.classList.remove('active');
            if (paneDossier) paneDossier.classList.add('active');
            if (paneSpectrum) paneSpectrum.classList.remove('active');
            if (window.CyberSFX) CyberSFX.click();
        });

        tabBtnSpectrum.addEventListener('click', () => {
            tabBtnSpectrum.classList.add('active');
            tabBtnDossier.classList.remove('active');
            if (paneSpectrum) paneSpectrum.classList.add('active');
            if (paneDossier) paneDossier.classList.remove('active');
            if (window.CyberSFX) CyberSFX.click();
            updateFrequencyChart(msgInput ? msgInput.value : '');
        });
    }

    // ─── Quick Presets Actions ────────────────────────────────────────────────
    if (btnDispatch) {
        btnDispatch.addEventListener('click', () => {
            if (msgInput) {
                msgInput.value = 'THE EAGLE FLIES AT MIDNIGHT. RENDEZVOUS AT SECTOR SEVEN.';
                if (charCount) charCount.textContent = msgInput.value.length;
                computeTelemetry(msgInput.value);
                updateFrequencyChart(msgInput.value);
            }
            if (window.CyberSFX) CyberSFX.click();
            showToast('LOADED SAMPLE DISPATCH');
            hideResult();
        });
    }

    if (btnRot13) {
        btnRot13.addEventListener('click', () => {
            setShift(13);
            showToast('SET KEY TO ROT-13');
        });
    }

    if (btnSampleCrack) {
        btnSampleCrack.addEventListener('click', () => {
            const sample = 'WKLV LV D VHFUHW PHVVDJH HQFUBSWHG ZLWK FDHVDU FLSKHU';
            if (msgInput) {
                msgInput.value = sample;
                if (charCount) charCount.textContent = msgInput.value.length;
                computeTelemetry(msgInput.value);
                updateFrequencyChart(msgInput.value);
            }
            const crackBtn = document.querySelector('.btn-bracket-cmd[data-mode="crack"]');
            if (crackBtn) crackBtn.click();
            if (tabBtnSpectrum) tabBtnSpectrum.click();
            showToast('LOADED CIPHERTEXT TEST // READY TO CRACK');
        });
    }

    if (btnClearInput) {
        btnClearInput.addEventListener('click', () => {
            if (msgInput) {
                msgInput.value = '';
                if (charCount) charCount.textContent = '0';
                computeTelemetry('');
                updateFrequencyChart('');
            }
            hideResult();
            if (window.CyberSFX) CyberSFX.click();
            showToast('BUFFER CLEARED');
        });
    }

    // ─── Result Visibility State Handlers ────────────────────────────────────
    function hideResult() {
        isResultRevealed = false;
        if (resultFieldBlock) {
            resultFieldBlock.classList.add('hidden');
        }
    }

    function revealResult() {
        isResultRevealed = true;
        if (resultFieldBlock) {
            resultFieldBlock.classList.remove('hidden');
            resultFieldBlock.classList.add('revealing');
            setTimeout(() => resultFieldBlock.classList.remove('revealing'), 350);
        }
    }

    // ─── Fallback Local Cryptographic Math ───────────────────────────────────
    function shiftChar(char, shift) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
        } else if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
        }
        return char;
    }

    function caesarLocal(str, shift) {
        return str.split('').map(c => shiftChar(c, shift)).join('');
    }

    // ─── API Processing Engine (Flask Endpoints) ─────────────────────────────
    async function triggerProcessing(reveal = true) {
        const text = msgInput ? msgInput.value.trim() : '';
        const shift = parseInt(shiftInput ? shiftInput.value : 3) || 3;

        if (!text) {
            showToast('PAYLOAD EMPTY // ENTER DATA');
            if (msgInput) msgInput.focus();
            return;
        }

        try {
            if (currentMode === 'crack') {
                const res = await fetch('/api/crack', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const best = data.results[0];
                    if (resultOutput) {
                        resultOutput.textContent = `[SHIFT ${best.shift}] ${best.text}`;
                    }
                    if (streamStatusBadge) {
                        streamStatusBadge.textContent = `KEY K=${best.shift} CRACKED`;
                    }
                    setShift(best.shift);

                    // Render crack rankings
                    if (crackCandidatesList) {
                        crackCandidatesList.innerHTML = '';
                        data.results.slice(0, 5).forEach((cand, idx) => {
                            const item = document.createElement('div');
                            item.className = `crack-candidate-item ${idx === 0 ? 'top-match' : ''}`;
                            item.innerHTML = `
                                <div class="cand-meta">
                                    <span class="cand-key">[ROT-${String(cand.shift).padStart(2, '0')}]</span>
                                    <span class="cand-score">CONF: ${cand.score}</span>
                                </div>
                                <div class="cand-text">${cand.text.substring(0, 48)}${cand.text.length > 48 ? '...' : ''}</div>
                            `;
                            item.addEventListener('click', () => {
                                setShift(cand.shift);
                                if (resultOutput) resultOutput.textContent = `[SHIFT ${cand.shift}] ${cand.text}`;
                                if (window.CyberSFX) CyberSFX.click();
                            });
                            crackCandidatesList.appendChild(item);
                        });
                    }
                }
            } else {
                const endpoint = currentMode === 'encrypt' ? '/api/encrypt' : '/api/decrypt';
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, shift })
                });
                const data = await res.json();
                if (resultOutput) {
                    resultOutput.textContent = data.result;
                }
                if (streamStatusBadge) {
                    streamStatusBadge.textContent = currentMode === 'encrypt' 
                        ? 'ENCRYPTED' 
                        : 'DECRYPTED';
                }
            }

            if (reveal) {
                revealResult();
                if (window.CyberSFX) CyberSFX.success();
            }
        } catch (err) {
            // Local mathematical fallback
            if (currentMode === 'encrypt') {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, shift);
                if (streamStatusBadge) streamStatusBadge.textContent = 'ENCRYPTED';
            } else if (currentMode === 'decrypt') {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, -shift);
                if (streamStatusBadge) streamStatusBadge.textContent = 'DECRYPTED';
            } else {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, -shift);
                if (streamStatusBadge) streamStatusBadge.textContent = 'LOCAL_FALLBACK';
            }

            if (reveal) {
                revealResult();
                if (window.CyberSFX) CyberSFX.success();
            }
        }
    }

    // ─── Action Button Trigger (REVEALS RESULT CONTAINER!) ───────────────────
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (window.CyberSFX) CyberSFX.execute();
            triggerProcessing(true);
            showToast(`EXECUTED // MODE: ${currentMode.toUpperCase()}`);
        });
    }

    // ─── Swap Result into Input Buffer ───────────────────────────────────────
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            if (!resultOutput || !resultOutput.textContent) return;
            let val = resultOutput.textContent;
            if (val.startsWith('[SHIFT ')) {
                val = val.replace(/^\[SHIFT \d+\]\s*/, '');
            }
            if (msgInput) {
                msgInput.value = val;
                if (charCount) charCount.textContent = val.length;
                computeTelemetry(val);
                updateFrequencyChart(val);
            }
            if (window.CyberSFX) CyberSFX.click();
            showToast('OUTPUT SWAPPED TO INPUT');
            // Toggle encrypt / decrypt
            if (currentMode === 'encrypt') {
                const decBtn = document.querySelector('.btn-bracket-cmd[data-mode="decrypt"]');
                if (decBtn) decBtn.click();
            } else if (currentMode === 'decrypt') {
                const encBtn = document.querySelector('.btn-bracket-cmd[data-mode="encrypt"]');
                if (encBtn) encBtn.click();
            }
        });
    }

    // ─── Clipboard Copy ──────────────────────────────────────────────────────
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!resultOutput || !resultOutput.textContent) return;
            let val = resultOutput.textContent;
            if (val.startsWith('[SHIFT ')) {
                val = val.replace(/^\[SHIFT \d+\]\s*/, '');
            }
            navigator.clipboard.writeText(val).then(() => {
                if (window.CyberSFX) CyberSFX.copy();
                showToast('INTERCEPT COPIED TO CLIPBOARD');
            }).catch(() => {
                showToast('COPY FAILED');
            });
        });
    }

    // ─── Export .txt File ────────────────────────────────────────────────────
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!resultOutput || !resultOutput.textContent) return;
            const textToSave = resultOutput.textContent;
            const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CIPHER_PAYLOAD_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.CyberSFX) CyberSFX.copy();
            showToast('EXPORTED .TXT PAYLOAD');
        });
    }

    // ─── Keyboard Shortcut: Enter in Input to Execute ────────────────────────
    if (msgInput) {
        msgInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (actionBtn) actionBtn.click();
            }
        });
    }

    // ─── Initial Startup Execution ───────────────────────────────────────────
    initFrequencyChart();
    updateVectorHUD();

    if (msgInput && msgInput.value) {
        if (charCount) charCount.textContent = msgInput.value.length;
        computeTelemetry(msgInput.value);
        updateFrequencyChart(msgInput.value);
    }

    hideResult(); // STRICT REQUIREMENT: Keep result hidden until action button click!
});
