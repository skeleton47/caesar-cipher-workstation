/* ==========================================================================
   NEO-BRUTALIST CIPHER CONTROLLER (VERSION 2.0 & 1.0 DUAL ENGINE)
   Handles Encrypt/Decrypt/Crack, Real-time Logging, Step Flow & Audio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const msgInput          = document.getElementById('message-input');
    const charCounter       = document.getElementById('char-limit-count');
    const shiftInput        = document.getElementById('shift-value');
    const shiftMinus        = document.getElementById('shift-minus');
    const shiftPlus         = document.getElementById('shift-plus');
    const vectorPreview     = document.getElementById('vector-preview-txt');
    const actionBtn         = document.getElementById('action-btn');
    const actionBtnText     = document.getElementById('action-btn-text');
    const resultFieldBlock  = document.getElementById('result-field-block');
    const resultOutput      = document.getElementById('result-output');
    const copyBtn           = document.getElementById('copy-btn');
    const deckStatusAlert   = document.getElementById('deck-status-alert');
    const terminalLogs      = document.getElementById('terminal-log-stream');
    const meshBadge         = document.getElementById('mesh-header-badge');

    const modeButtons = [
        document.getElementById('btn-encrypt'),
        document.getElementById('btn-decrypt'),
        document.getElementById('btn-crack')
    ].filter(Boolean);

    let currentMode = 'encrypt';

    // ─── Step Flow Manager (1 -> 2 -> 3) ─────────────────────────────────────
    function setStep(stepNum) {
        const s1 = document.getElementById('step-1-indicator');
        const s2 = document.getElementById('step-2-indicator');
        const s3 = document.getElementById('step-3-indicator');
        if (s1) s1.classList.toggle('step-active', stepNum === 1);
        if (s2) s2.classList.toggle('step-active', stepNum === 2);
        if (s3) s3.classList.toggle('step-active', stepNum === 3);
    }

    // ─── Tactical Toast ──────────────────────────────────────────────────────
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

    // ─── Update Vector Preview (A -> D) ──────────────────────────────────────
    function updateVector() {
        let s = parseInt(shiftInput ? shiftInput.value : 3) || 3;
        s = ((s % 26) + 26) % 26;
        const target = String.fromCharCode(65 + s);
        if (vectorPreview) {
            vectorPreview.textContent = `A \u2192 ${target}`;
        }
    }

    // ─── Character Limit Counter & Typing Input ──────────────────────────────
    if (msgInput) {
        const updateChars = () => {
            if (charCounter) {
                charCounter.textContent = `${msgInput.value.length} / 500`;
            }
        };
        updateChars();
        msgInput.addEventListener('input', () => {
            updateChars();
            setStep(1);
        });
    }

    // ─── Shift Controls ──────────────────────────────────────────────────────
    if (shiftMinus) {
        shiftMinus.addEventListener('click', () => {
            let v = parseInt(shiftInput.value) || 3;
            shiftInput.value = v > 1 ? v - 1 : 25;
            updateVector();
            setStep(2);
            if (window.CyberSFX) CyberSFX.shift();
            logMessage(`> PARAM_UPDATE: SHIFT K=${shiftInput.value}`);
        });
    }

    if (shiftPlus) {
        shiftPlus.addEventListener('click', () => {
            let v = parseInt(shiftInput.value) || 3;
            shiftInput.value = v < 25 ? v + 1 : 1;
            updateVector();
            setStep(2);
            if (window.CyberSFX) CyberSFX.shift();
            logMessage(`> PARAM_UPDATE: SHIFT K=${shiftInput.value}`);
        });
    }

    if (shiftInput) {
        shiftInput.addEventListener('input', () => {
            let v = parseInt(shiftInput.value);
            if (!isNaN(v)) {
                if (v < 1) shiftInput.value = 1;
                if (v > 25) shiftInput.value = 25;
                updateVector();
                setStep(2);
            }
        });
    }

    // ─── Mode Switching ([ENCRYPT] / [DECRYPT] / [CRACK]) ────────────────────
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            const isNeo = document.body.classList.contains('neo-brutalist-theme');

            if (currentMode === 'encrypt') {
                if (actionBtnText) actionBtnText.textContent = isNeo ? 'EXECUTE ENCRYPTION (ROT-N)' : 'INITIALIZE CIPHER EXECUTION';
                if (deckStatusAlert) {
                    deckStatusAlert.innerHTML = isNeo
                        ? '<div class="alert-banner-block banner-warning"><span class="banner-icon">&#9888;</span><span class="banner-msg">STATUS: READY FOR ROT-N TRANSFORMATION</span></div>'
                        : '<span class="red-glitch-text">ACCESS DENIED</span>';
                }
                if (meshBadge) meshBadge.textContent = isNeo ? 'NEW: IDENTITY MESH' : 'NOT FOUND_404';
            } else if (currentMode === 'decrypt') {
                if (actionBtnText) actionBtnText.textContent = isNeo ? 'EXECUTE REVERSE DECRYPTION' : 'EXECUTE REVERSE DECRYPTION';
                if (deckStatusAlert) {
                    deckStatusAlert.innerHTML = isNeo
                        ? '<div class="alert-banner-block banner-danger"><span class="banner-icon">&#9888;</span><span class="banner-msg">STATUS: DECRYPTION STREAM ARMED</span></div>'
                        : '<span class="red-glitch-text">DECRYPT_STREAM</span>';
                }
                if (meshBadge) meshBadge.textContent = isNeo ? 'REVERSE DECRYPT' : 'DECRYPTED_200';
            } else if (currentMode === 'crack') {
                if (actionBtnText) actionBtnText.textContent = isNeo ? 'LAUNCH FREQUENCY CRACK' : 'LAUNCH CONSCIOUSNESS BRUTE-FORCE';
                if (deckStatusAlert) {
                    deckStatusAlert.innerHTML = isNeo
                        ? '<div class="alert-banner-block banner-warning"><span class="banner-icon">&#9888;</span><span class="banner-msg">STATUS: UNIGRAM FREQUENCY READY</span></div>'
                        : '<span class="red-glitch-text">CRACK_ARMED</span>';
                }
                if (meshBadge) meshBadge.textContent = isNeo ? 'FREQUENCY EXPLOIT' : 'EXPLOIT_ACTIVE';
            }

            if (window.CyberSFX) CyberSFX.click();
            logMessage(`$ ./SWITCH_MODE --OP=${currentMode.toUpperCase()}`);
            hideResult();
        });
    });

    // ─── Hide / Show Result ──────────────────────────────────────────────────
    function hideResult() {
        if (resultFieldBlock) {
            resultFieldBlock.classList.add('hidden');
            resultFieldBlock.classList.remove('revealed');
        }
    }

    function revealResult() {
        if (resultFieldBlock) {
            resultFieldBlock.classList.remove('hidden');
            resultFieldBlock.classList.add('revealed');
        }
        setStep(3);
    }

    // ─── Live Dynamic Logging to Terminal Box ────────────────────────────────
    function logMessage(text, isRed = false) {
        if (!terminalLogs) return;
        const line = document.createElement('div');
        line.className = 'log-line ' + (isRed ? 'red-log' : 'dim-line');
        line.textContent = text;
        terminalLogs.appendChild(line);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    // ─── Local Math Fallback ─────────────────────────────────────────────────
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

    // ─── Main Execution Handler ──────────────────────────────────────────────
    async function executeOperation() {
        const text = msgInput ? msgInput.value.trim() : '';
        const shift = parseInt(shiftInput ? shiftInput.value : 3) || 3;

        if (!text) {
            showToast('PAYLOAD EMPTY // ENTER DATA');
            if (msgInput) msgInput.focus();
            return;
        }

        logMessage(`$ ./EXEC_${currentMode.toUpperCase()} --LEN=${text.length}`);

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
                        resultOutput.textContent = `[KEY: ${best.shift}] ${best.text}`;
                    }
                    if (shiftInput) {
                        shiftInput.value = best.shift;
                        updateVector();
                    }
                    logMessage(`[ SUCCESS ] KEY RECOVERED: K=${best.shift} (SCORE: ${best.score})`, true);
                    logMessage(`> FREQUENCY ANALYSIS CONVERGED`);
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
                logMessage(`[ OK ] ROT-${shift} TRANSFORMATION PROCESSED`);
                logMessage(`// PAYLOAD READY IN INTERCEPT BUFFER`);
            }

            revealResult();
            if (window.CyberSFX) CyberSFX.success();
            showToast(`${currentMode.toUpperCase()} SUCCESSFUL`);
        } catch (err) {
            // Local fallback
            if (currentMode === 'encrypt') {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, shift);
            } else if (currentMode === 'decrypt') {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, -shift);
            } else {
                if (resultOutput) resultOutput.textContent = caesarLocal(text, -shift);
            }
            revealResult();
            if (window.CyberSFX) CyberSFX.success();
            logMessage(`[ STANDALONE_FALLBACK ] COMPUTATION COMPLETE`);
        }
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (window.CyberSFX) CyberSFX.execute();
            executeOperation();
        });
    }

    // ─── Clipboard Copy ──────────────────────────────────────────────────────
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!resultOutput || !resultOutput.textContent) return;
            navigator.clipboard.writeText(resultOutput.textContent).then(() => {
                if (window.CyberSFX) CyberSFX.copy();
                showToast('PAYLOAD COPIED TO CLIPBOARD');
                logMessage(`> BUFFER_TRANSFER: CLIPBOARD SYNCED`);
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

    // Initial setup
    updateVector();
    hideResult();
    setStep(1);
});
