/* ==========================================================================
   CIPHER_OS // INTEL SPEC INTERACTIVE DOSSIER MODULE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const liveUtcClock = document.getElementById('live-utc-clock');
    if (liveUtcClock) {
        function updateClock() {
            const now = new Date();
            const pad = (n, l = 2) => String(n).padStart(l, '0');
            liveUtcClock.textContent = `UTC ${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}.${pad(Math.floor(now.getUTCMilliseconds() / 10), 2)}`;
        }
        setInterval(updateClock, 100);
        updateClock();
    }

    const tabMath = document.getElementById('tab-dossier-math');
    const tabCrypto = document.getElementById('tab-dossier-crypto');
    const tabDefense = document.getElementById('tab-dossier-defense');
    const shellScriptText = document.querySelector('.shell-script-text');
    const specDetailBox = document.querySelector('.spec-detail-box');

    const dossierData = {
        math: {
            cmd: '$ ./INSPECT_ALGORITHM <span class="param-red">--MATHEMATICS --VERBOSE</span>',
            lines: [
                '[ ORIGIN ] JULIUS CAESAR (58 BCE) // GALLIC CAMPAIGN DISPATCHES',
                '[ ALGEBRAIC FIELD ] FINITE RING &Zopf; / 26&Zopf; (ADDITIVE CYCLIC GROUP &Zopf;₂₆)',
                '[ ENCRYPTION ] <span class="vector-highlight">C &equiv; (P + K) mod 26</span> (WHERE K &isin; [1, 25])',
                '[ DECRYPTION ] <span class="vector-highlight">P &equiv; (C - K) mod 26</span>',
                '<span class="param-red">[ ENTROPY CEILING ] log&sub2;(25) &approx; 4.643 BITS (TRIVIAL KEYSPACE)</span>'
            ],
            header: '&gt; ALGEBRAIC & MODULAR CHARACTERISTICS:',
            cards: [
                { k: 'HOMOMORPHIC PROPERTY:', v: 'E(m₁) + E(m₂) &equiv; E(m₁ + m₂) mod 26' },
                { k: 'AUTOMORPHISM ORDER:', v: 'ORDER 26 // IDENTITY ROT-00 &equiv; ROT-26' },
                { k: 'KEY EXHAUSTION:', v: '25 NON-TRIVIAL PERMUTATIONS' },
                { k: 'ISOMORPHISM:', v: 'MONOALPHABETIC ROTATION OVER ALPHABET &Sigma;' }
            ]
        },
        crypto: {
            cmd: '$ ./INSPECT_ALGORITHM <span class="param-red">--CRYPTANALYSIS --ATTACK-VECTORS</span>',
            lines: [
                '[ THREAT VECTOR 1 ] EXHAUSTIVE BRUTE FORCE (&tau; &lt; 0.0001 MS)',
                '[ THREAT VECTOR 2 ] UNIGRAM FREQUENCY ANALYSIS (&chi;&sup2; TEST)',
                '[ THREAT VECTOR 3 ] KNOWN PLAINTEXT ATTACK (SINGLE CHAR REVEALS K)',
                '[ INDEX OF COINCIDENCE ] <span class="vector-highlight">I&subc; = 0.0667 (UNCHANGED FROM ENGLISH)</span>',
                '<span class="param-red">[ CONCLUSION ] ZERO CIPHERTEXT INDISTINGUISHABILITY (IND-CPA INSECURE)</span>'
            ],
            header: '&gt; HEURISTIC & STATISTICAL BREAKDOWN:',
            cards: [
                { k: 'UNIGRAM E ATTACK:', v: 'HIGH PEAK &approx; 12.7% REVEALS SHIFT INSTANTLY' },
                { k: 'BIGRAM CORRELATION:', v: 'COMMON DIGRAPHS (TH, HE, IN, ER) PRESERVED' },
                { k: 'KASISKI EXAMINATION:', v: 'TRIVIAL IDENTIFICATION OF PERIOD (L=1)' },
                { k: 'TIME COMPLEXITY:', v: 'O(1) CONSTANT TIME TO CRACK' }
            ]
        },
        defense: {
            cmd: '$ ./INSPECT_ALGORITHM <span class="param-red">--DEFENSE-RECOMMENDATIONS</span>',
            lines: [
                '[ LEVEL 1 ] SYMMETRIC: AES-256-GCM (NIST FIPS 197) // AUTHENTICATED',
                '[ LEVEL 2 ] STREAM: CHACHA20-POLY1305 (RFC 8439) // CONSTANT-TIME',
                '[ LEVEL 3 ] ASYMMETRIC: ED25519 (RFC 8032) // SCHNORR SIGNATURES',
                '[ LEVEL 4 ] KEY EXCHANGE: X25519 DIFFIE-HELLMAN // FORWARD SECRECY',
                '<span class="param-red">[ RISK ADVISORY ] NEVER RETAIN ROT-26 FOR RESTRICTED DATA</span>'
            ],
            header: '&gt; CONTEMPORARY CRYPTOGRAPHIC STANDARDS:',
            cards: [
                { k: 'CONFIDENTIALITY:', v: '256-BIT SECURITY MARGIN (&ge; 2²⁵⁶ OPS)' },
                { k: 'AUTHENTICATED ENCRYPTION:', v: 'AEAD PREVENTS BIT-FLIPPING / TAMPERING' },
                { k: 'POST-QUANTUM READINESS:', v: 'ML-KEM (CRYSTALS-KYBER) NIST STANDARDIZED' },
                { k: 'DEPLOYMENT TARGET:', v: 'TLS 1.3 / IPSEC / SSH-2 / SIGNAL PROTOCOL' }
            ]
        }
    };

    function renderDossier(tabKey) {
        const data = dossierData[tabKey];
        if (!data || !shellScriptText || !specDetailBox) return;

        let scriptHtml = `<div class="shell-line shell-cmd">${data.cmd}</div>`;
        data.lines.forEach(l => {
            scriptHtml += `<div class="shell-line">${l}</div>`;
        });
        shellScriptText.innerHTML = scriptHtml;

        let boxHtml = `<div class="spec-section-header">${data.header}</div><div class="spec-kv-grid">`;
        data.cards.forEach(c => {
            boxHtml += `
                <div class="kv-card">
                    <span class="kv-key">${c.k}</span>
                    <span class="kv-val">${c.v}</span>
                </div>
            `;
        });
        boxHtml += `</div>`;
        specDetailBox.innerHTML = boxHtml;
    }

    [
        { btn: tabMath, key: 'math' },
        { btn: tabCrypto, key: 'crypto' },
        { btn: tabDefense, key: 'defense' }
    ].forEach(({ btn, key }) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            [tabMath, tabCrypto, tabDefense].forEach(b => b && b.classList.remove('active'));
            btn.classList.add('active');
            renderDossier(key);
            if (window.CyberSFX) CyberSFX.click();
        });
    });
});
