document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const messageInput = document.getElementById('message-input');
    const shiftValueInput = document.getElementById('shift-value');
    const shiftMinusBtn = document.getElementById('shift-minus');
    const shiftPlusBtn = document.getElementById('shift-plus');
    const actionBtn = document.getElementById('action-btn');
    const resultArea = document.getElementById('result-area');
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const shiftGroup = document.getElementById('shift-group');
    const charCount = document.getElementById('char-count');

    let currentMode = 'encrypt';

    // Character counter
    messageInput.addEventListener('input', () => {
        let len = messageInput.value.length;
        if (len > 500) {
            messageInput.value = messageInput.value.substring(0, 500);
            len = 500;
        }
        charCount.textContent = `${len}/500`;
    });

    // Tabs switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.mode;
            
            // Update UI based on mode
            if (currentMode === 'encrypt') {
                actionBtn.innerHTML = '🔒 ENCRYPT MESSAGE';
                shiftGroup.style.display = 'block';
            } else if (currentMode === 'decrypt') {
                actionBtn.innerHTML = '🔓 DECRYPT MESSAGE';
                shiftGroup.style.display = 'block';
            } else if (currentMode === 'crack') {
                actionBtn.innerHTML = '🔍 CRACK MESSAGE';
                shiftGroup.style.display = 'none';
            }
            
            resultArea.classList.add('hidden');
        });
    });

    // Shift controls
    shiftMinusBtn.addEventListener('click', () => {
        let val = parseInt(shiftValueInput.value);
        if (val > 1) shiftValueInput.value = val - 1;
        else shiftValueInput.value = 25;
    });

    shiftPlusBtn.addEventListener('click', () => {
        let val = parseInt(shiftValueInput.value);
        if (val < 25) shiftValueInput.value = val + 1;
        else shiftValueInput.value = 1;
    });

    shiftValueInput.addEventListener('change', () => {
        let val = parseInt(shiftValueInput.value);
        if (isNaN(val) || val < 1) shiftValueInput.value = 1;
        else if (val > 25) shiftValueInput.value = 25;
    });

    // Caesar Cipher Logic
    function shiftChar(char, shift) {
        const code = char.charCodeAt(0);
        // Uppercase
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
        }
        // Lowercase
        else if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
        }
        return char; // Non-alphabetic
    }

    function processMessage(text, shift, mode) {
        if (mode === 'decrypt') shift = -shift;
        return text.split('').map(char => shiftChar(char, shift)).join('');
    }

    // Heuristic function to guess the best English shift
    function scoreEnglishText(text) {
        // Standard English letter frequencies
        const freqs = {
            'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0, 'n': 6.7,
            's': 6.3, 'h': 6.1, 'r': 6.0, 'd': 4.3, 'l': 4.0, 'c': 2.8,
            'u': 2.8, 'm': 2.4, 'w': 2.4, 'f': 2.2, 'g': 2.0, 'y': 2.0,
            'p': 1.9, 'b': 1.3, 'v': 1.0, 'k': 0.8, 'j': 0.2, 'x': 0.2,
            'q': 0.1, 'z': 0.1
        };
        let score = 0;
        const lowerText = text.toLowerCase();
        for (let char of lowerText) {
            if (freqs[char]) {
                score += freqs[char];
            }
        }
        return score;
    }

    // Action button
    actionBtn.addEventListener('click', () => {
        const text = messageInput.value;
        if (!text) return;

        let shift = parseInt(shiftValueInput.value);
        if (isNaN(shift)) shift = 3;

        resultArea.classList.remove('hidden');

        if (currentMode === 'crack') {
            // Generate all 25 shifts and score them
            let crackResults = [];
            for (let i = 1; i < 26; i++) {
                // To crack, we decrypt. Decrypting by shift i is like encrypting by -i
                const crackedText = processMessage(text, i, 'decrypt');
                const score = scoreEnglishText(crackedText);
                crackResults.push({ shift: i, text: crackedText, score: score });
            }

            // Sort by score (highest first)
            crackResults.sort((a, b) => b.score - a.score);

            let crackHTML = '<div class="crack-results">';
            crackResults.forEach((res, idx) => {
                let highlightClass = idx === 0 ? 'best-match' : '';
                let badge = idx === 0 ? '<span class="badge">⭐ BEST MATCH</span>' : '';
                crackHTML += `
                    <div class="crack-item ${highlightClass}">
                        <div class="crack-shift">SHIFT: ${res.shift} ${badge}</div>
                        <div class="crack-text">${res.text}</div>
                    </div>
                `;
            });
            crackHTML += '</div>';
            resultOutput.innerHTML = crackHTML;
            copyBtn.style.display = 'none'; // Disable copy for the list view
        } else {
            const result = processMessage(text, shift, currentMode);
            resultOutput.textContent = result;
            copyBtn.style.display = 'block';
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(resultOutput.textContent).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = '✅ COPIED!';
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        });
    });
});
