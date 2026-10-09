# ⚡ CAESAR CIPHER // TACTICAL CYBERNETIC WORKSTATION

A retro-cyberpunk, military-themed Caesar cipher workstation featuring symmetric encryption, modular vector decryption, and heuristic frequency cryptanalysis. Built with a Python Flask backend and vanilla Web Audio API sound synthesis.

---

## 🚀 Features

- **🔒 Real-Time Encryption & Decryption:** Cyclic modulo-26 substitution algorithm.
- **⚡ Heuristic Cryptanalysis (Crack Engine):** Automatically cracks intercepted ciphertexts using English letter frequency analysis and common word scoring.
- **🎧 Procedural Web Audio SFX:** 
  - Tactile high-tech clicks and frequency sweeps.
  - Laser warp execution sound.
  - Success decryption chime.
  - **Bubble Pop Typing Sound:** Satisfying water droplet / bubble popping effect on each keystroke.
  - Audio mute/unmute toggle.
- **🔮 Cyberpunk Visual Aesthetic:**
  - CRT scanlines, vignette darkening, and glitch accents.
  - Live vector HUD updating in real-time (`A [0x41] → D [0x44]`).
  - Smooth glitch wipe page transition curtain between routes.
  - Hidden result payload revealed only on user execution.
- **🐍 Python Flask REST API:**
  - `/api/encrypt`
  - `/api/decrypt`
  - `/api/crack`

---

## 🛠️ Tech Stack

- **Backend:** Python 3.x, Flask
- **Frontend:** HTML5, CSS3 (Custom Cyberpunk Theme), Vanilla JavaScript
- **Audio:** Web Audio API (zero external asset dependencies)
- **Typography:** Chakra Petch, Press Start 2P, Silkscreen, Share Tech Mono

---

## 💻 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/skeleton47/caesar-cipher-workstation.git
cd caesar-cipher-workstation
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the application
```bash
python app.py
```

Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📜 License
MIT License. Open source and built for educational cryptanalysis research.
