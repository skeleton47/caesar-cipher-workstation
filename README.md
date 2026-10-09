# ✦ CIPHER LAB

An elegant, interactive cryptography instrument and developer playground for exploring Caesar substitution mechanics, modular arithmetic, and heuristic cryptanalysis.

---

## ✦ Overview

**CIPHER LAB** combines the rigor of classical cryptography with the responsiveness and refinement of contemporary developer tooling. All text encryption, decryption, and brute-force cracking execute client-side in real time with zero payload retention.

---

## ✦ Key Features

- **🔒 Real-Time Encryption & Decryption:**
  - Full cyclic $\mathbb{Z}_{26}$ modular arithmetic transformation: $C \equiv (P + K) \pmod{26}$.
  - Normalizes shifts from $0$ to $25$.
  - Preserves letter casing, whitespace, punctuation, numbers, and symbols intact.
- **⚡ Interactive Alphabet Mapping Visualizer:**
  - Dual-track alphabet ribbon showing immediate character transformations ($A \to D, B \to E, C \to F \dots$).
  - Dynamically updates as the shift slider and stepper change.
  - Interactive letter highlighting synchronized with active input text.
- **📊 Exhaustive 26-Shift Brute Force Crack:**
  - Tests all 26 possible Caesar shifts ($K = 0 \dots 25$) simultaneously.
  - Evaluates plaintext candidates using standard English unigram frequencies (ETAOIN SHRDLU) and common vocabulary matching.
  - Scannable card grid with one-click shift application.
- **🎧 Tactile Procedural Audio Engine:**
  - Zero-latency Web Audio API synthesizer (no audio files or external network requests).
  - Subtle bubble pop keystroke acoustics.
  - Soft mechanical clicks and harmonic completion chimes.
  - Persistent SFX toggle in the navigation header.
- **🛡️ Modern Design System:**
  - Midnight Navy (`#080C14` / `#0B0F19`), Luminous Cyan (`#00E5FF`), Mint (`#10B981`), and Warm Amber (`#F59E0B`).
  - Fluid typography with `Plus Jakarta Sans` and `JetBrains Mono`.
  - Accessible focus indicators and responsive layouts across desktop, tablet, and mobile.

---

## ✦ Architecture & Tech Stack

- **Frontend:** Semantic HTML5, CSS3 Custom Properties (Design Tokens), Modern ES6+ JavaScript.
- **Backend / Routing:** Python 3.x, Flask (with RESTful endpoints for `/api/encrypt`, `/api/decrypt`, `/api/crack`).
- **Audio Synthesizer:** HTML5 Web Audio API.

---

## ✦ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/skeleton47/caesar-cipher-workstation.git
cd caesar-cipher-workstation
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the development server
```bash
python app.py
```

Open your browser and navigate to:
```
http://localhost:5000
```
Or open `index.html` directly in any modern browser for standalone execution.

---

## ✦ Educational Context

The Caesar cipher is intended strictly for historical study and educational exploration. Because Latin alphabets yield only 25 non-trivial permutations, modern confidentiality requires authenticated symmetric ciphers such as **AES-256-GCM** (NIST FIPS 197) or **ChaCha20-Poly1305** (RFC 8439).

---

## ✦ License

MIT License. Open source and built for educational cryptanalysis exploration.
