/* ==========================================================================
   CIPHER_OS — TACTICAL DYSTOPIAN CYBER ENGINE
   Live Vector Mapping, API Dispatcher, Hidden Result Reveal, SFX Support
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const modeBtns          = document.querySelectorAll('.btn-bracket-cmd');
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
    const statusBadge       = document.getElementById('status-badge');
    const copyBtn           = document.getElementById('copy-btn');
    const vectorMetaVal     = document.getElementById('vector-meta-val');

    let currentMode = 'encrypt';
    let isResultRevealed = false;

    // ─── Tactical Toast ───────────────────────────────────────────────────────
    function showToast(text) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = `[SYSTEM] >> ${text}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ─── Live Dynamic Vector Mapping (A -> D + Hex) ──────────────────────────
    function updateVectorHUD() {
        let s = parseInt(shiftInput ? shiftInput.value : 3) || 3;
        s = ((s % 26) + 26) % 26;
        const targetChar = String.fromCharCode(65 + s);
        const hexTo = '0x' + (65 + s).toString(16).toUpperCase();

        if (vectorMetaVal) {
            vectorMetaVal.innerHTML = `A [0x41] &rarr; ${targetChar} [${hexTo}] (ROT-${String(s).padStart(2, '0')})`;
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

    // ─── Mode Switching (ENCRYPT / DECRYPT / CRACK) ───────────────────────────
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            if (currentMode === 'encrypt') {
                if (btnCaptionText) btnCaptionText.textContent = 'EXECUTE CIPHER PAYLOAD';
                if (statusBadge) statusBadge.textContent = 'CIPHER ARMED';
            } else if (currentMode === 'decrypt') {
                if (btnCaptionText) btnCaptionText.textContent = 'DECRYPT INTERCEPTED STREAM';
                if (statusBadge) statusBadge.textContent = 'DECRYPT ARMED';
            } else if (currentMode === 'crack') {
                if (btnCaptionText) btnCaptionText.textContent = 'LAUNCH BRUTE-FORCE CRACK';
                if (statusBadge) statusBadge.textContent = 'CRACK ARMED';
            }

            if (window.CyberSFX) CyberSFX.click();
            hideResult(); // Keep result hidden on mode switch until clicked!
        });
    });

    // ─── Result Hide / Reveal Helpers ────────────────────────────────────────
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

    // ─── Processing Engine (Flask API Integration) ───────────────────────────
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
                    if (shiftInput) {
                        shiftInput.value = best.shift;
                        updateVectorHUD();
                    }
                    if (streamStatusBadge) {
                        streamStatusBadge.textContent = `KEY K=${best.shift} CRACKED`;
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
        }
    }

    // ─── Action Button Click (REVEALS RESULT!) ────────────────────────────────
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (window.CyberSFX) CyberSFX.execute();
            triggerProcessing(true);
            showToast(`EXECUTED // MODE: ${currentMode.toUpperCase()}`);
        });
    }

    // ─── Clipboard Copy ──────────────────────────────────────────────────────
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!resultOutput || !resultOutput.textContent) return;
            navigator.clipboard.writeText(resultOutput.textContent).then(() => {
                if (window.CyberSFX) CyberSFX.copy();
                showToast('INTERCEPT COPIED TO CLIPBOARD');
            }).catch(() => {
                showToast('COPY FAILED');
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
    hideResult(); // Keep result hidden on load!
});
