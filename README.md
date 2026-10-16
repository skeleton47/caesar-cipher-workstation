# CIPHER STUDIO SUITE // WARM BENTO BRUTALISM EDITION

A modern, high-precision Cryptographic Suite designed with **Warm Bento Brutalism** (`#FCF9F4` paper canvas, crisp charcoal borders, citron lime accents `#D8EE48`, and tactile neo-brutalist shadows).

Engineered with six fully featured cryptographic studios, real-time mathematical analysis, step-by-step visualizers, zero-dependency Web Audio bubble typing synthesis, and a unified Python Flask REST backend (with 100% standalone static web and offline compatibility).

---

## The Six Harmonized Studios

### 1. Caesar Cipher Studio (`/` or `index.html`)
- **Interactive Shift Controller:** Responsive stepper buttons, fine-grained range slider (1 to 25), and key badge telemetry.
- **Bento Workspace:** Two-column split layout with instantaneous live bi-directional cipher translation (Plaintext <-> Ciphertext).
- **Fast Preset Chips:** One-click toggles for `ROT-3 (Caesar)`, `ROT-13`, `ROT-5`, and `ROT-25`.
- **Case & Punctuation Toggles:** Independent switches to preserve or normalize letter cases and punctuation marks.
- **Live Heuristic Auto-Cracker:** Computes real-time chi-squared fitness across all 25 candidate shifts simultaneously and presents top matches as selectable candidate cards.

### 2. Vigenère Cipher Studio (`/vigenere` or `vigenere.html`)
- **Polyalphabetic Keystream Engine:** Repeating keyword stream visualization with dynamic character length tracking.
- **Live Keystream Alignment Matrix:** Visual character-by-character alignment grid comparing `[Plaintext Letter]`, `[Key Letter]`, and `[Ciphertext Result]`.
- **Interactive Tabula Recta Inspection:** Miniature 26x26 Vigenère square showing the exact coordinate intersection of the current cipher character.
- **Kasiski & Cryptanalysis Telemetry:** Live calculation of estimated period length, Index of Coincidence ($I_c$), and keyspace entropy ($26^L$ states).

### 3. Playfair Cipher Studio (`/playfair` or `playfair.html`)
- **Interactive 5x5 Matrix:** Dynamic key matrix generator merging `I/J` into `I`, deduplicating keyword letters, and filling remaining cells alphabetically.
- **Cell Inspection:** Clickable matrix cells showing exact row/col coordinates and letter index.
- **Intelligent Digraph Preparation:** Live text normalization card explaining pair breakdown, duplicate letter splitting with filler `'X'` (or `'Q'` if the duplicate is `'X'`), and odd-length trailing padding `'X'` (or `'Z'`).
- **Step-by-Step Visualizer:** Play/Pause automatic playback and Next/Prev step stepper animating the exact Playfair geometric rules:
  - *Same Row Rule:* Right shift (+1 mod 5) for encryption, left shift (-1 mod 5) for decryption.
  - *Same Column Rule:* Down shift (+1 mod 5) for encryption, up shift (-1 mod 5) for decryption.
  - *Rectangle Rule:* Opposite corner column swap across the matrix.
- **Learning & Practice Mode:** Dedicated interactive learning panel explaining rules with visual examples, plus an interactive prediction challenge to test digraph encryption skills.

### 4. Hill Cipher Laboratory (`/hill` or `hill.html`)
- **Multi-Dimension Support:** Full support for **2x2**, **3x3**, **4x4**, and **5x5** linear transformation matrices.
- **Exact Modular Inversion Engine:**
  - Determinant calculation $\det(K) \pmod{26}$.
  - Strict invertibility validation: $\gcd(\det(K), 26) = 1$. Rejects singular and non-coprime matrices with immediate diagnostics.
  - Multiplicative inverse calculation $\det(K)^{-1} \pmod{26}$ using the Extended Euclidean Algorithm.
  - Adjugate matrix $\operatorname{adj}(K)$ and modular inverse matrix $K^{-1} \equiv \det(K)^{-1} \cdot \operatorname{adj}(K) \pmod{26}$.
  - Modular identity verification checking $K \cdot K^{-1} \equiv I \pmod{26}$.
- **Interactive Matrix Grid:** Direct numeric cell editing with auto-normalization modulo 26, live validation status pill, determinant readout, and inverse preview.
- **Random Invertible Key Generator:** Deterministic sampling until a valid invertible matrix is produced.
- **Vector Arithmetic Walkthrough:** Step-by-step matrix-vector multiplication breakdown:
  $$\mathbf{c} = K \cdot \mathbf{p} \pmod{26} \quad \text{and} \quad \mathbf{p} = K^{-1} \cdot \mathbf{c} \pmod{26}$$
  Shows vector mapping ($A=0, \dots, Z=25$), dot products, modulo reduction, and resulting ciphertext blocks with visual highlight synchronization.

### 5. Cipher Fusion Cascade Engine (`/fusion` or `fusion.html`)
- **Cascade Encryption Pipeline:** Chains four ciphers sequentially: Caesar -> Vigenère -> Playfair -> Hill -> Final Ciphertext.
- **Reverse Decryption Pipeline:** Inverses the stages in exact reverse order (Hill -> Playfair -> Vigenère -> Caesar) with identical keys.
- **Reversible Package Mode:** Exports non-secret structural metadata (digraph insertions, padding lengths, and case mappings) allowing lossless restoration.
- **Configurable Stages:** Drag-and-drop or stepper ordering, stage bypass toggles, and step-by-step journey player with live vector and digraph inspection.

### 6. Frequency Analysis Studio (`/frequency` or `frequency.html`)
- **Monogram Cryptanalysis Distribution:** Dual-bar comparative histogram plotting observed character frequency against standard English language distribution (`ETAOIN SHRDLU`).
- **Precision Closeness Matching:** Matches observed frequencies to the nearest standard English letters with tie detection (e.g. C / U, M / W), similarity fit score %, and dual-lens Caesar decryption projection.
- **Statistical Telemetry Cards:** Real-time Chi-Square ($\chi^2$) goodness-of-fit score, Shannon entropy in bits/char, and Index of Coincidence ($I_c$).
- **Dynamic N-Grams & Digraphs:** Real-time identification of repeating trigrams and bigrams with automatic shift deduction against common English patterns (`THE`, `AND`, `ING`, `TH`, `AT`).

---

## Procedural Web Audio API Sound Engine (Zero Assets)

Built-in zero-latency Web Audio API engine (`static/js/sfx.js`):
- **Bubble Pop Typing ASMR:** Organic, fluid droplet sound on every keystroke in input fields.
- **Tactile UI Clicks:** Crisp mechanical feedback for mode switches, presets, steppers, and matrix dimension toggles.
- **Clipboard Sound:** Positive audio confirmation upon copying text.
- **Global SFX Toggle:** Clickable pill in the header with persistent state memory (`localStorage`).

---

## Tech Stack & Architecture

- **Frontend:** HTML5, Tailwind CSS v3 (JIT CDN with Forms & Container Queries), Plus Jakarta Sans, JetBrains Mono
- **Audio Synthesizer:** Pure Web Audio API waveforms (Sine, Triangle, Square with exponential ramp envelopes)
- **Backend:** Python 3.x with Flask
- **API Endpoints:**
  - `POST /api/encrypt` — Caesar cipher encryption
  - `POST /api/decrypt` — Caesar cipher decryption
  - `POST /api/crack` — Frequency-based Caesar brute-force scoring
  - `POST /api/vigenere/encrypt` — Vigenère cipher encryption
  - `POST /api/vigenere/decrypt` — Vigenère cipher decryption
  - `POST /api/playfair/encrypt` — Playfair cipher encryption with step telemetry
  - `POST /api/playfair/decrypt` — Playfair cipher decryption with step telemetry
  - `POST /api/hill/validate` — Hill matrix determinant & invertibility validation
  - `POST /api/hill/generate` — Generate random invertible 2x2, 3x3, 4x4, 5x5 matrix
  - `POST /api/hill/encrypt` — Hill cipher encryption with vector calculations
  - `POST /api/hill/decrypt` — Hill cipher decryption with inverse matrix vectors
  - `POST /api/fusion/encrypt` — Cascade pipeline encryption
  - `POST /api/fusion/decrypt` — Cascade pipeline decryption
  - `POST /api/frequency` — Character distribution & frequency percentage metrics

---

## Quick Start

### Option A: One-Click Windows Launcher
Double-click **`run.bat`** (or **`start.bat`**) in the project folder. It will:
1. Verify Python & install Flask if needed.
2. Automatically launch `app.py`.
3. Automatically open `http://localhost:5000` in your default web browser.

### Option B: Terminal Command
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
python app.py
```
Open **http://localhost:5000** in your web browser.

### Option C: Standalone Static Web / 100% Offline
Double-click `index.html` directly in your file explorer. All studios run completely client-side with zero external servers required.

---

## License
MIT License. Open-source educational cryptography suite.
