# 🗃️ CIPHER STUDIO SUITE — WARM BENTO BRUTALISM EDITION

A modern, high-precision Cryptographic Suite designed with **Warm Bento Brutalism** (`#FCF9F4` paper canvas, crisp charcoal borders, citron lime accents `#D8EE48`, and tactile neo-brutalist shadows).

Engineered with three fully featured cryptographic studios, real-time mathematical analysis, zero-dependency Web Audio bubble typing synthesis, and a unified Python Flask REST backend (with 100% standalone static web compatibility).

---

## 🏛️ The Three Harmonized Studios

### 1. 🔤 Caesar Cipher Studio (`/` or `index.html`)
- **Interactive Shift Controller:** Responsive stepper buttons, fine-grained range slider (1 to 25), and key badge telemetry.
- **Bento Workspace:** Two-column split layout with instantaneous live bi-directional cipher translation (Plaintext ⇄ Ciphertext).
- **Fast Preset Chips:** One-click toggles for `ROT-3 (Caesar)`, `ROT-13`, `ROT-5`, and `ROT-25`.
- **Case & Punctuation Toggles:** Independent switches to preserve or normalize letter cases and punctuation marks.
- **Live Heuristic Auto-Cracker:** Computes real-time chi-squared fitness across all 25 candidate shifts simultaneously and presents top matches as selectable candidate cards.

### 2. 🔐 Vigenère Cipher Studio (`/vigenere` or `vigenere.html`)
- **Polyalphabetic Keystream Engine:** Repeating keyword stream visualization with dynamic character length tracking.
- **Live Keystream Alignment Matrix:** Visual character-by-character alignment grid comparing `[Plaintext Letter]`, `[Key Letter]`, and `[Ciphertext Result]`.
- **Interactive Tabula Recta Inspection:** Miniature 26×26 Vigenère square showing the exact coordinate intersection of the current cipher character.
- **Kasiski & Cryptanalysis Telemetry:** Live calculation of estimated period length, Index of Coincidence ($I_c$), and keyspace entropy ($26^L$ states).

### 3. 📊 Frequency Analysis Studio (`/frequency` or `frequency.html`)
- **Monogram Cryptanalysis Distribution:** Dual-bar comparative histogram plotting observed character frequency against standard English language distribution (`ETAOIN SHRDLU`).
- **Statistical Metric Cards:** Chi-Square ($\chi^2$) goodness-of-fit fitness score, payload character count, and unique letter diversity.
- **Automated Detection Heuristics:** Automated classification detecting whether ciphertext is likely Monoalphabetic (Caesar) or Polyalphabetic (Vigenère).
- **Interactive Top Peak Decryption:** One-click ROT shift deduction based on the highest frequency character peak.

---

## 🎧 Procedural Web Audio API Sound Engine (Zero Assets)

Built-in zero-latency Web Audio API engine (`static/js/sfx.js`):
- **Bubble Pop Typing ASMR:** Organic, fluid droplet sound on every keystroke in input fields.
- **Tactile UI Clicks:** Crisp mechanical feedback for mode switches, presets, and steppers.
- **Clipboard Sound:** Positive audio confirmation upon copying text.
- **Global SFX Toggle:** Clickable pill in the header with persistent state memory (`localStorage`).

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, Tailwind CSS v3 (JIT CDN with Forms & Container Queries), Plus Jakarta Sans, JetBrains Mono
- **Audio Synthesizer:** Pure Web Audio API waveforms (Sine, Triangle, Square with exponential ramp envelopes)
- **Backend:** Python 3.x with Flask
- **API Endpoints:**
  - `POST /api/encrypt` — Caesar cipher encryption
  - `POST /api/decrypt` — Caesar cipher decryption
  - `POST /api/crack` — Frequency-based Caesar brute-force scoring
  - `POST /api/vigenere/encrypt` — Vigenère cipher encryption
  - `POST /api/vigenere/decrypt` — Vigenère cipher decryption
  - `POST /api/frequency` — Character distribution & frequency percentage metrics

---

## 🚀 Quick Start

### Option A: Python Flask Backend
```bash
# Clone the repository
git clone https://github.com/skeleton47/caesar-cipher-workstation.git
cd caesar-cipher-workstation

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```
Open **http://127.0.0.1:5000** in your web browser.

### Option B: Standalone Static Web / GitHub Pages
Double-click `index.html` directly or host with GitHub Pages. All three studios (`index.html`, `vigenere.html`, `frequency.html`) run fully client-side with zero external servers required.

---

## 📜 License
MIT License. Open-source educational cryptography suite.
