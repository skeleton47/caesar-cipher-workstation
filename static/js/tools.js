/* ==========================================================================
   404 CYBER GLITCH CONTROLLER — ОШИБКА 404 // МОТИВАЦИЯ НЕ НАЙДЕНА
   Handles Encrypt/Decrypt/Crack, Dynamic Progress Bar, Terminal Stream, and Audio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const msgInput          = document.getElementById('message-input');
    const charCounter       = document.getElementById('char-limit-count');
    const shiftInput        = document.getElementById('shift-value');
    const shiftMinus        = document.getElementById('shift-minus');
    const shiftPlus         = document.getElementById('shift-plus');
    const vectorPreview     = document.getElementById('vector-preview-txt');
    const actionBtn         = document.getElementById('action-btn');
    const resultFieldBlock  = document.getElementById('result-field-block');
    const resultOutput      = document.getElementById('result-output');
    const copyBtn           = document.getElementById('copy-btn');
    const terminalLogs      = document.getElementById('terminal-log-stream');
    const progressFill      = document.getElementById('progress-fill-bar');
    const progressLabel     = document.getElementById('progress-search-label');
    const progressPct       = document.getElementById('progress-search-pct');

    const modeButtons = [
        document.getElementById('btn-encrypt'),
        document.getElementById('btn-decrypt'),
        document.getElementById('btn-crack')
    ].filter(Boolean);

    let currentMode = 'encrypt';

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
        setTimeout(() => toast.classList.remove('show'), 2400);
    }

    // ─── Update Progress Bar ─────────────────────────────────────────────────
    function setProgress(pct, labelText) {
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressPct) progressPct.textContent = `${pct}%`;
        if (progressLabel && labelText) progressLabel.textContent = labelText;
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
            setProgress(0, 'ПОИСК МОТИВАЦИИ...');
        });
    }

    // ─── Shift Controls ──────────────────────────────────────────────────────
    if (shiftMinus) {
        shiftMinus.addEventListener('click', () => {
            let v = parseInt(shiftInput.value) || 3;
            shiftInput.value = v > 1 ? v - 1 : 25;
            updateVector();
            if (window.CyberSFX) CyberSFX.shift();
            logMessage(`> СДВИГ КЛЮЧА: K=${shiftInput.value}`);
        });
    }

    if (shiftPlus) {
        shiftPlus.addEventListener('click', () => {
            let v = parseInt(shiftInput.value) || 3;
            shiftInput.value = v < 25 ? v + 1 : 1;
            updateVector();
            if (window.CyberSFX) CyberSFX.shift();
            logMessage(`> СДВИГ КЛЮЧА: K=${shiftInput.value}`);
        });
    }

    if (shiftInput) {
        shiftInput.addEventListener('input', () => {
            let v = parseInt(shiftInput.value);
            if (!isNaN(v)) {
                if (v < 1) shiftInput.value = 1;
                if (v > 25) shiftInput.value = 25;
                updateVector();
            }
        });
    }

    // ─── Mode Switching (ENCRYPT / DECRYPT / CRACK) ───────────────────────────
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            if (window.CyberSFX) CyberSFX.click();
            logMessage(`$ ./SWITCH_MODE --OP=${currentMode.toUpperCase()}`);
            hideResult();
            setProgress(0, 'ПОИСК МОТИВАЦИИ...');
        });
    });

    // ─── Hide / Show Result ──────────────────────────────────────────────────
    function hideResult() {
        if (resultFieldBlock) {
            resultFieldBlock.classList.add('hidden');
        }
    }

    function revealResult() {
        if (resultFieldBlock) {
            resultFieldBlock.classList.remove('hidden');
        }
        setProgress(100, 'МОТИВАЦИЯ НАЙДЕНА: 100%');
    }

    // ─── Live Dynamic Logging to Terminal Box ────────────────────────────────
    function logMessage(text, isRed = false) {
        if (!terminalLogs) return;
        const line = document.createElement('div');
        line.className = 'log-line ' + (isRed ? 'warn-line' : 'dim-line');
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

    // ─── Main Execution Handler (OK BUTTON) ──────────────────────────────────
    async function executeOperation() {
        const text = msgInput ? msgInput.value.trim() : '';
        const shift = parseInt(shiftInput ? shiftInput.value : 3) || 3;

        if (!text) {
            showToast('ВВЕДИТЕ СООБЩЕНИЕ // EMPTY PAYLOAD');
            if (msgInput) msgInput.focus();
            return;
        }

        logMessage(`$ ./EXEC_${currentMode.toUpperCase()} --LEN=${text.length}`);
        setProgress(45, 'СКАНИРОВАНИЕ...');

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
                        resultOutput.textContent = `[КЛЮЧ: ${best.shift}] ${best.text}`;
                    }
                    if (shiftInput) {
                        shiftInput.value = best.shift;
                        updateVector();
                    }
                    logMessage(`[ ВЗЛОМАН ] КЛЮЧ: K=${best.shift} (ОЦЕНКА: ${best.score})`, true);
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
                logMessage(`[ УСПЕХ ] ОПЕРАЦИЯ СДВИГА ROT-${shift} ВЫПОЛНЕНА`);
            }

            revealResult();
            if (window.CyberSFX) CyberSFX.success();
            showToast(`${currentMode.toUpperCase()} ВЫПОЛНЕНО`);
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
            logMessage(`[ FALLBACK ] ВЫЧИСЛЕНИЯ ЗАВЕРШЕНЫ`);
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
                showToast('СКОПИРОВАНО В БУФЕР ОБМЕНА');
                logMessage(`> БУФЕР ОБМЕНА: ДАННЫЕ СКОПИРОВАНЫ`);
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
    setProgress(0, 'ПОИСК МОТИВАЦИИ...');
});
