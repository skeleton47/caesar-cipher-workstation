/* ==========================================================================
   CIPHER LAB // DEVTOOLS CLIENT ENGINE & INTERACTIVE WORKSPACE
   Cryptographic Transformations, Ribbon Visualizer, Telemetry & Brute-Force
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ─── DOM References ──────────────────────────────────────────────────────
    const cipherInput       = document.getElementById('cipher-input');
    const inputCharCount    = document.getElementById('input-char-count');
    const inputLabelText    = document.getElementById('input-label-text');
    const outputLabelText   = document.getElementById('output-label-text');
    const outputMetaStatus  = document.getElementById('output-meta-status');
    const outputWrapper     = document.getElementById('output-wrapper');
    const outputEmptyState  = document.getElementById('output-empty-state');
    const outputContentText = document.getElementById('output-content-text');
    const outputActionsBar  = document.getElementById('output-actions-bar');

    // Controls
    const shiftInput        = document.getElementById('shift-input');
    const shiftRange        = document.getElementById('shift-range');
    const shiftBadgeVal     = document.getElementById('shift-badge-val');
    const btnShiftMinus     = document.getElementById('btn-shift-minus');
    const btnShiftPlus      = document.getElementById('btn-shift-plus');
    const btnExecute        = document.getElementById('btn-execute');
    const executeBtnIcon    = document.getElementById('execute-btn-icon');
    const executeBtnLabel   = document.getElementById('execute-btn-label');
    const shiftControlsCont = document.getElementById('shift-controls-container');

    // Mode Buttons
    const modeTabBtns       = document.querySelectorAll('.mode-tab-btn');
    const navModeBtns       = document.querySelectorAll('[data-nav-mode]');

    // Presets & Tools
    const btnLoadSample     = document.getElementById('btn-load-sample');
    const btnRot13          = document.getElementById('btn-rot13');
    const btnClear          = document.getElementById('btn-clear');
    const btnCopyOutput     = document.getElementById('btn-copy-output');
    const btnSwapOutput     = document.getElementById('btn-swap-output');
    const btnDownloadOutput = document.getElementById('btn-download-output');

    // Visualizer Elements
    const alphabetStrip     = document.getElementById('alphabet-strip');
    const visualizerPreview = document.getElementById('visualizer-preview-pill');

    // Telemetry Elements
    const statChars         = document.getElementById('stat-chars');
    const statShift         = document.getElementById('stat-shift');
    const statScore         = document.getElementById('stat-score');

    // Crack Section
    const crackSection      = document.getElementById('crack-section');
    const crackEmptyNotice  = document.getElementById('crack-empty-notice');
    const crackTableContainer = document.getElementById('crack-table-container');
    const crackTableBody    = document.getElementById('crack-table-body');
    const crackMetaPill     = document.getElementById('crack-meta-pill');

    // Toast
    const toastNotice       = document.getElementById('toast-notice');
    const toastMessage      = document.getElementById('toast-message');

    let currentMode = 'encrypt';
    let currentShift = 3;
    let toastTimeout = null;

    // ─── English Frequency & Dictionary Baselines ────────────────────────────
    const ENGLISH_FREQ = {
        'A': 8.17, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.70, 'F': 2.23,
        'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15, 'K': 0.77,  'L': 4.03,
        'M': 2.41, 'N': 6.75, 'O': 7.51, 'P': 1.93, 'Q': 0.10,  'R': 5.99,
        'S': 6.33, 'T': 9.06, 'U': 2.76, 'V': 0.98, 'W': 2.36,  'X': 0.15,
        'Y': 1.97, 'Z': 0.07
    };

    const COMMON_WORDS = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
        'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
        'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
        'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
        'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
        'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
        'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
        'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
        'give', 'day', 'most', 'us', 'is', 'was', 'are', 'has', 'had',
        'hello', 'world', 'secret', 'message', 'attack', 'defend', 'rendezvous', 'sector', 'dawn'
    ]);

    // ─── Toast Feedback System ───────────────────────────────────────────────
    function showToast(msg) {
        if (!toastNotice) return;
        if (toastTimeout) clearTimeout(toastTimeout);
        if (toastMessage) toastMessage.textContent = msg;
        toastNotice.classList.add('show');
        toastTimeout = setTimeout(() => {
            toastNotice.classList.remove('show');
        }, 2200);
    }

    // ─── Mathematical Core: Caesar Transformation ────────────────────────────
    function transformChar(ch, shift) {
        const code = ch.charCodeAt(0);
        // Uppercase Latin A-Z (65 - 90)
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
        }
        // Lowercase Latin a-z (97 - 122)
        if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
        }
        // Pass-through non-alphabet characters
        return ch;
    }

    function caesarTransform(text, shift) {
        return text.split('').map(ch => transformChar(ch, shift)).join('');
    }

    // Heuristic Scorer for Plaintext Candidates
    function scoreEnglishText(text) {
        const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
        if (!clean.length) return 0;

        let freqScore = 0;
        for (let i = 0; i < clean.length; i++) {
            freqScore += (ENGLISH_FREQ[clean[i]] || 0);
        }
        freqScore = freqScore / clean.length;

        // Word match bonuses
        const words = text.toLowerCase().split(/\s+/);
        let wordHits = 0;
        words.forEach(w => {
            const stripped = w.replace(/[^a-z]/g, '');
            if (COMMON_WORDS.has(stripped)) wordHits++;
        });

        const wordBonus = (wordHits / Math.max(words.length, 1)) * 18;
        return parseFloat((freqScore + wordBonus).toFixed(2));
    }

    // ─── Signature Visual Element: Alphabet Shift Ribbon ─────────────────────
    function initAlphabetStrip() {
        if (!alphabetStrip) return;
        alphabetStrip.innerHTML = '';

        for (let i = 0; i < 26; i++) {
            const originalChar = String.fromCharCode(65 + i);
            const cell = document.createElement('div');
            cell.className = 'ribbon-cell';
            cell.id = `ribbon-cell-${originalChar}`;
            cell.dataset.letter = originalChar;

            cell.innerHTML = `
                <span class="ribbon-top">${originalChar}</span>
                <span class="ribbon-arr">&darr;</span>
                <span class="ribbon-bot" id="ribbon-bot-${originalChar}">?</span>
            `;

            alphabetStrip.appendChild(cell);
        }

        updateAlphabetStrip();
    }

    function updateAlphabetStrip() {
        const s = ((currentShift % 26) + 26) % 26;

        for (let i = 0; i < 26; i++) {
            const orig = String.fromCharCode(65 + i);
            const shifted = String.fromCharCode(65 + ((i + s) % 26));
            const shiftedEl = document.getElementById(`ribbon-bot-${orig}`);
            if (shiftedEl) {
                shiftedEl.textContent = shifted;
            }
        }

        const shiftedA = String.fromCharCode(65 + s);
        if (visualizerPreview) {
            visualizerPreview.textContent = `Shift +${s}: A \u2192 ${shiftedA}`;
        }
    }

    // Highlight visualizer columns corresponding to input letters
    function highlightActiveLetters() {
        if (!alphabetStrip || !cipherInput) return;
        const text = cipherInput.value.toUpperCase();
        const activeChars = new Set(text.replace(/[^A-Z]/g, '').split(''));

        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const cell = document.getElementById(`ribbon-cell-${letter}`);
            if (cell) {
                if (activeChars.has(letter)) {
                    cell.classList.add('active-input-char');
                } else {
                    cell.classList.remove('active-input-char');
                }
            }
        }
    }

    // ─── Telemetry Updater ───────────────────────────────────────────────────
    function updateTelemetry(outText) {
        const text = cipherInput ? cipherInput.value : '';
        if (statChars) {
            statChars.textContent = `${text.length} chars (${new Blob([text]).size} B)`;
        }
        if (statShift) {
            const s = currentShift;
            const inv = (26 - s) % 26;
            statShift.textContent = `K = ${s} (K⁻¹ = ${inv})`;
        }
        if (statScore) {
            const target = outText || text;
            if (target && target.trim().length > 0) {
                const sc = scoreEnglishText(target);
                statScore.textContent = `${sc} pts`;
            } else {
                statScore.textContent = '—';
            }
        }
    }

    // ─── Shift Synchronizer (Stepper & Slider) ───────────────────────────────
    function setShift(val) {
        let parsed = parseInt(val, 10);
        if (isNaN(parsed)) parsed = 0;
        parsed = ((parsed % 26) + 26) % 26;

        currentShift = parsed;
        if (shiftInput && parseInt(shiftInput.value, 10) !== currentShift) {
            shiftInput.value = currentShift;
        }
        if (shiftRange && parseInt(shiftRange.value, 10) !== currentShift) {
            shiftRange.value = currentShift;
        }
        if (shiftBadgeVal) {
            shiftBadgeVal.textContent = `K = ${currentShift}`;
        }

        updateAlphabetStrip();
        updateTelemetry();
        if (window.CyberSFX) CyberSFX.shift();

        // If in encrypt/decrypt mode and output is already visible, update live
        if (outputContentText && outputContentText.style.display !== 'none' && currentMode !== 'crack') {
            performCipher();
        }
    }

    if (btnShiftMinus) {
        btnShiftMinus.addEventListener('click', () => {
            setShift(currentShift - 1);
        });
    }

    if (btnShiftPlus) {
        btnShiftPlus.addEventListener('click', () => {
            setShift(currentShift + 1);
        });
    }

    if (shiftInput) {
        shiftInput.addEventListener('input', () => {
            setShift(shiftInput.value);
        });
    }

    if (shiftRange) {
        shiftRange.addEventListener('input', (e) => {
            setShift(e.target.value);
        });
    }

    // ─── Mode Switching (Encrypt / Decrypt / Crack) ───────────────────────────
    function setMode(mode) {
        currentMode = mode;

        // Sync mode tab buttons
        modeTabBtns.forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Sync header nav pills
        navModeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.navMode === mode);
        });

        if (mode === 'encrypt') {
            if (inputLabelText) inputLabelText.textContent = 'Plaintext Input';
            if (outputLabelText) outputLabelText.textContent = 'Ciphertext Output';
            if (executeBtnLabel) executeBtnLabel.textContent = 'Encrypt Message';
            if (executeBtnIcon) executeBtnIcon.textContent = '🔒';
            if (shiftControlsCont) shiftControlsCont.style.display = 'flex';
            if (crackSection) crackSection.classList.remove('active');
        } else if (mode === 'decrypt') {
            if (inputLabelText) inputLabelText.textContent = 'Ciphertext Input';
            if (outputLabelText) outputLabelText.textContent = 'Plaintext Output';
            if (executeBtnLabel) executeBtnLabel.textContent = 'Decrypt Message';
            if (executeBtnIcon) executeBtnIcon.textContent = '🔓';
            if (shiftControlsCont) shiftControlsCont.style.display = 'flex';
            if (crackSection) crackSection.classList.remove('active');
        } else if (mode === 'crack') {
            if (inputLabelText) inputLabelText.textContent = 'Ciphertext to Crack';
            if (outputLabelText) outputLabelText.textContent = 'Best Candidate Match';
            if (executeBtnLabel) executeBtnLabel.textContent = 'Crack Cipher';
            if (executeBtnIcon) executeBtnIcon.textContent = '⚡';
            if (crackSection) crackSection.classList.add('active');
        }

        if (window.CyberSFX) CyberSFX.click();
    }

    modeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.dataset.mode);
        });
    });

    navModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.dataset.navMode);
            const ws = document.getElementById('workbench');
            if (ws) ws.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ─── Execution Logic ─────────────────────────────────────────────────────
    function performCipher() {
        const text = cipherInput ? cipherInput.value : '';
        if (!text.trim()) {
            showToast('Please enter text first');
            if (cipherInput) cipherInput.focus();
            return;
        }

        if (currentMode === 'crack') {
            performCrack(text);
            return;
        }

        const effectiveShift = currentMode === 'encrypt' ? currentShift : -currentShift;
        const result = caesarTransform(text, effectiveShift);

        // Render result in output panel
        if (outputEmptyState) outputEmptyState.style.display = 'none';
        if (outputContentText) {
            outputContentText.textContent = result;
            outputContentText.style.display = 'block';
        }
        if (outputMetaStatus) {
            outputMetaStatus.textContent = currentMode === 'encrypt' ? 'Encrypted' : 'Decrypted';
        }

        updateTelemetry(result);
        if (window.CyberSFX) CyberSFX.success();
    }

    // ─── Exhaustive 26-Shift Brute Force Crack ────────────────────────────────
    function performCrack(text) {
        const candidates = [];
        for (let shift = 0; shift < 26; shift++) {
            const decrypted = caesarTransform(text, -shift);
            const score = scoreEnglishText(decrypted);
            candidates.push({
                shift: shift,
                text: decrypted,
                score: score
            });
        }

        // Sort descending by score for ranked list
        const sorted = [...candidates].sort((a, b) => b.score - a.score);
        const best = sorted[0];

        // Populate top match into main output area
        if (outputEmptyState) outputEmptyState.style.display = 'none';
        if (outputContentText) {
            outputContentText.textContent = best.text;
            outputContentText.style.display = 'block';
        }
        if (outputMetaStatus) {
            outputMetaStatus.textContent = `Shift ${best.shift} (Score: ${best.score})`;
        }

        // Render all 26 rows into shadcn table
        if (crackTableBody) {
            crackTableBody.innerHTML = '';
            sorted.forEach((cand, idx) => {
                const isBest = idx === 0;
                const tr = document.createElement('tr');
                if (isBest) tr.className = 'top-candidate-row';

                tr.innerHTML = `
                    <td style="font-family: var(--font-mono); font-weight: 600;">
                        ${isBest ? '<span class="badge badge-emerald">#1 Best</span>' : `#${idx + 1}`}
                    </td>
                    <td>
                        <span class="badge ${isBest ? 'badge-amber' : 'badge-secondary'}">
                            ROT-${String(cand.shift).padStart(2, '0')} (Shift ${cand.shift})
                        </span>
                    </td>
                    <td>
                        <div class="candidate-preview-text" title="${cand.text}">
                            ${cand.text}
                        </div>
                    </td>
                    <td style="font-family: var(--font-mono); font-weight: 600; color: ${isBest ? 'var(--emerald-accent)' : 'var(--muted-foreground)'};">
                        ${cand.score} pts
                    </td>
                    <td style="text-align: right;">
                        <button type="button" class="btn btn-outline btn-sm apply-key-btn">
                            Apply Key &rarr;
                        </button>
                    </td>
                `;

                // Handle clicking row or apply button
                tr.addEventListener('click', () => {
                    setShift(cand.shift);
                    setMode('decrypt');
                    if (outputContentText) outputContentText.textContent = cand.text;
                    if (outputMetaStatus) outputMetaStatus.textContent = `Applied Shift ${cand.shift}`;
                    updateTelemetry(cand.text);
                    showToast(`Applied Shift ${cand.shift}`);
                    const ws = document.getElementById('workbench');
                    if (ws) ws.scrollIntoView({ behavior: 'smooth' });
                    if (window.CyberSFX) CyberSFX.click();
                });

                crackTableBody.appendChild(tr);
            });
        }

        if (crackEmptyNotice) crackEmptyNotice.style.display = 'none';
        if (crackTableContainer) crackTableContainer.style.display = 'block';
        if (crackSection) crackSection.classList.add('active');
        if (crackMetaPill) crackMetaPill.textContent = `Top Match: Shift ${best.shift} (${best.score} pts)`;

        updateTelemetry(best.text);
        if (window.CyberSFX) CyberSFX.success();
        showToast(`Analyzed 26 shifts. Top candidate: Shift ${best.shift}`);
    }

    if (btnExecute) {
        btnExecute.addEventListener('click', () => {
            if (window.CyberSFX) CyberSFX.execute();
            performCipher();
        });
    }

    // ─── Input Events & Live Character Counter ───────────────────────────────
    if (cipherInput) {
        cipherInput.addEventListener('input', () => {
            if (inputCharCount) inputCharCount.textContent = cipherInput.value.length;
            highlightActiveLetters();
            updateTelemetry();
        });

        // Enter key to execute (Shift+Enter for newline)
        cipherInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (btnExecute) btnExecute.click();
            }
        });
    }

    // ─── Presets & Action Buttons ────────────────────────────────────────────
    if (btnLoadSample) {
        btnLoadSample.addEventListener('click', () => {
            if (cipherInput) {
                cipherInput.value = 'THE EAGLE FLIES AT MIDNIGHT. RENDEZVOUS AT SECTOR SEVEN.';
                if (inputCharCount) inputCharCount.textContent = cipherInput.value.length;
                highlightActiveLetters();
                updateTelemetry();
            }
            if (window.CyberSFX) CyberSFX.click();
            showToast('Sample transmission loaded');
        });
    }

    if (btnRot13) {
        btnRot13.addEventListener('click', () => {
            setShift(13);
            showToast('Shift set to ROT-13');
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (cipherInput) {
                cipherInput.value = '';
                if (inputCharCount) inputCharCount.textContent = '0';
            }
            if (outputContentText) {
                outputContentText.textContent = '';
                outputContentText.style.display = 'none';
            }
            if (outputEmptyState) outputEmptyState.style.display = 'flex';
            if (outputMetaStatus) outputMetaStatus.textContent = 'Ready';
            highlightActiveLetters();
            updateTelemetry();
            if (window.CyberSFX) CyberSFX.click();
            showToast('Workspace reset');
        });
    }

    // Copy Result to Clipboard
    if (btnCopyOutput) {
        btnCopyOutput.addEventListener('click', () => {
            if (!outputContentText || !outputContentText.textContent) {
                showToast('No output to copy');
                return;
            }
            navigator.clipboard.writeText(outputContentText.textContent).then(() => {
                if (window.CyberSFX) CyberSFX.copy();
                showToast('Copied to clipboard');
            }).catch(() => {
                showToast('Clipboard copy failed');
            });
        });
    }

    // Swap Output into Input
    if (btnSwapOutput) {
        btnSwapOutput.addEventListener('click', () => {
            if (!outputContentText || !outputContentText.textContent) {
                showToast('No output to swap');
                return;
            }
            const currentOut = outputContentText.textContent;
            if (cipherInput) {
                cipherInput.value = currentOut;
                if (inputCharCount) inputCharCount.textContent = currentOut.length;
                highlightActiveLetters();
            }
            // Invert mode
            if (currentMode === 'encrypt') {
                setMode('decrypt');
            } else if (currentMode === 'decrypt') {
                setMode('encrypt');
            }
            updateTelemetry(currentOut);
            if (window.CyberSFX) CyberSFX.click();
            showToast('Output swapped into input');
        });
    }

    // Download .txt Payload
    if (btnDownloadOutput) {
        btnDownloadOutput.addEventListener('click', () => {
            if (!outputContentText || !outputContentText.textContent) {
                showToast('No output to export');
                return;
            }
            const blob = new Blob([outputContentText.textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CIPHER_LAB_${currentMode.toUpperCase()}_SHIFT_${currentShift}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.CyberSFX) CyberSFX.copy();
            showToast('Exported as .txt file');
        });
    }

    // ─── Initial Setup ───────────────────────────────────────────────────────
    initAlphabetStrip();
    setShift(3);
    if (cipherInput) {
        if (inputCharCount) inputCharCount.textContent = cipherInput.value.length;
        highlightActiveLetters();
        updateTelemetry();
    }
});
