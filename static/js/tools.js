/* ==========================================================================
   CAESAR CIPHER — RESTRICTED BLACKHAT CYBER ENGINE
   Live Threat Vector HUD, Real-Time API Dispatcher, Hidden Result Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const tabs              = document.querySelectorAll('.tab-item');
    const msgInput          = document.getElementById('message-input');
    const charCount         = document.getElementById('char-count');
    const shiftInput        = document.getElementById('shift-value');
    const shiftMinus        = document.getElementById('shift-minus');
    const shiftPlus         = document.getElementById('shift-plus');
    const actionBtn         = document.getElementById('action-btn');
    const btnCaptionText    = document.getElementById('btn-caption-text');
    const resultFieldBlock  = document.getElementById('result-field-block');
    const resultOutput      = document.getElementById('result-output');
    const streamStatusBadge = document.getElementById('stream-status-badge');
    const copyBtn           = document.getElementById('copy-btn');
    const vTo               = document.getElementById('v-to');
    const vectorMetaVal     = document.getElementById('vector-meta-val');
    const hudShift          = document.getElementById('hud-shift-readout');
    const hudStatus         = document.getElementById('hud-system-status');

    let currentMode = 'encrypt';
    let isResultRevealed = false;

    // ─── Tactical Toast System ───────────────────────────────────────────────
    function showToast(text) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = `[THREAT_LOG] >> ${text}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ─── Live Dynamic Vector HUD (A -> D + Hex Telemetry) ────────────────────
    function updateVectorHUD() {
        let s = parseInt(shiftInput.value) || 3;
        s = ((s % 26) + 26) % 26;
        const targetChar = String.fromCharCode(65 + s);
        const hexFrom = '0x41';
        const hexTo = '0x' + (65 + s).toString(16).toUpperCase();

        if (vTo) {
            vTo.textContent = targetChar;
            vTo.style.transform = 'scale(1.2)';
            setTimeout(() => { vTo.style.transform = 'scale(1)'; }, 150);
        }

        if (vectorMetaVal) {
            vectorMetaVal.innerHTML = `A [${hexFrom}] &rarr; ${targetChar} [${hexTo}] // ROT-${String(s).padStart(2, '0')}`;
        }

        const formattedShift = String(s).padStart(2, '0');
        if (hudShift) {
            hudShift.textContent = formattedShift;
        }
    }

    // ─── Shift Controls ──────────────────────────────────────────────────────
    if (shiftMinus) {
        shiftMinus.addEventListener('click', () => {
            let v = parseInt(shiftInput.value) || 3;
            shiftInput.value = v > 1 ? v - 1 : 25;
            updateVectorHUD();
            if (window.CyberSFX) CyberSFX.shift();
            if (isResultRevealed) triggerProcessing(false);
        });
    }

    if (shiftPlus) {
        shiftPlus.addEventListener('click', () => {
            let v = parseInt(shiftInput.value) || 3;
            shiftInput.value = v < 25 ? v + 1 : 1;
            updateVectorHUD();
            if (window.CyberSFX) CyberSFX.shift();
            if (isResultRevealed) triggerProcessing(false);
        });
    }

    if (shiftInput) {
        shiftInput.addEventListener('input', () => {
            let v = parseInt(shiftInput.value);
            if (!isNaN(v)) {
                if (v < 1) shiftInput.value = 1;
                if (v > 25) shiftInput.value = 25;
                updateVectorHUD();
                if (isResultRevealed) triggerProcessing(false);
            }
        });
    }

    // ─── Character Byte Counter ──────────────────────────────────────────────
    if (msgInput) {
        msgInput.addEventListener('input', () => {
            if (msgInput.value.length > 500) {
                msgInput.value = msgInput.value.substring(0, 500);
            }
            if (charCount) charCount.textContent = msgInput.value.length;
            if (isResultRevealed) triggerProcessing(false);
        });
    }

    // ─── Tab Switching ───────────────────────────────────────────────────────
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.mode;

            if (currentMode === 'encrypt') {
                btnCaptionText.textContent = 'EXECUTE ENCRYPTION PAYLOAD';
                if (streamStatusBadge) streamStatusBadge.textContent = 'PAYLOAD_GENERATED';
            } else if (currentMode === 'decrypt') {
                btnCaptionText.textContent = 'DECRYPT INTERCEPTED STREAM';
                if (streamStatusBadge) streamStatusBadge.textContent = 'STREAM_DECRYPTED';
            } else if (currentMode === 'crack') {
                btnCaptionText.textContent = 'LAUNCH BRUTE-FORCE INTRUSION';
                if (streamStatusBadge) streamStatusBadge.textContent = 'KEYSPACE_COMPROMISED';
            }

            if (window.CyberSFX) CyberSFX.click();
            // Hide result when switching tabs so user can execute for the new mode
            hideResult();
        });
    });

    // ─── Result Hide / Reveal Helpers ────────────────────────────────────────
    function hideResult() {
        isResultRevealed = false;
        if (resultFieldBlock) {
            resultFieldBlock.classList.add('hidden');
            resultFieldBlock.classList.remove('revealed');
        }
    }

    function revealResult() {
        isResultRevealed = true;
        if (resultFieldBlock) {
            resultFieldBlock.classList.remove('hidden');
            resultFieldBlock.classList.add('revealed');
        }
    }

    // ─── Local Caesar Math Fallback ──────────────────────────────────────────
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

    // ─── Processing Engine (API Dispatcher) ──────────────────────────────────
    async function triggerProcessing(reveal = true) {
        const text = msgInput ? msgInput.value.trim() : '';
        const shift = parseInt(shiftInput ? shiftInput.value : 3) || 3;

        if (!text) {
            showToast('PAYLOAD BUFFER EMPTY // ENTER DATA');
            if (msgInput) msgInput.focus();
            return;
        }

        if (hudStatus) hudStatus.textContent = 'CALCULATING...';

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
                    if (shiftInput) {
                        shiftInput.value = best.shift;
                        updateVectorHUD();
                    }
                    if (streamStatusBadge) {
                        streamStatusBadge.textContent = `KEY K=${best.shift} COMPROMISED (SCORE: ${best.score})`;
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
                        ? 'ENCRYPTED_STREAM_ARMED' 
                        : 'PLAINTEXT_RECONSTRUCTED';
                }
            }

            if (reveal) {
                revealResult();
                if (window.CyberSFX) CyberSFX.success();
            }

            if (hudStatus) hudStatus.textContent = 'ARMED // READY';
        } catch (err) {
            // Local fallback
            if (currentMode === 'encrypt') {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, shift);
            } else if (currentMode === 'decrypt') {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, -shift);
            } else {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, -shift);
            }

            if (reveal) {
                revealResult();
                if (window.CyberSFX) CyberSFX.success();
            }
            if (hudStatus) hudStatus.textContent = 'STANDALONE_FALLBACK';
        }
    }

    // ─── Action Button Click (ONLY NOW REVEAL RESULT!) ───────────────────────
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (window.CyberSFX) CyberSFX.execute();
            triggerProcessing(true);
            showToast(`PAYLOAD EXECUTED // MODE: ${currentMode.toUpperCase()}`);
        });
    }

    // ─── Clipboard Copy ──────────────────────────────────────────────────────
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!resultOutput || !resultOutput.textContent) return;
            navigator.clipboard.writeText(resultOutput.textContent).then(() => {
                if (window.CyberSFX) CyberSFX.copy();
                showToast('INTERCEPTED BUFFER COPIED TO CLIPBOARD');
            }).catch(() => {
                showToast('CLIPBOARD ACCESS DENIED');
            });
        });
    }

    // ─── Keyboard Shortcut: Enter to Execute ─────────────────────────────────
    if (msgInput) {
        msgInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (actionBtn) actionBtn.click();
            }
        });
    }

    // ─── Initial Startup Execution ───────────────────────────────────────────
    updateVectorHUD();
    hideResult(); // Keep result HIDDEN initially until user clicks the button!
});
