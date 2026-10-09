"""
Cipher Studio Suite — Flask Backend
Warm Bento Brutalism Edition: Caesar Cipher, Vigenère Cipher, Frequency Analysis
"""

from flask import Flask, render_template, request, jsonify
import string
import math

app = Flask(__name__)

# ─── English letter frequency baseline (ETAOIN SHRDLU %) ────────────────────
ENGLISH_FREQ = {
    'a': 8.2, 'b': 1.5, 'c': 2.8, 'd': 4.3, 'e': 12.7, 'f': 2.2,
    'g': 2.0, 'h': 6.1, 'i': 7.0, 'j': 0.15, 'k': 0.77, 'l': 4.0,
    'm': 2.4, 'n': 6.7, 'o': 7.5, 'p': 1.9, 'q': 0.095, 'r': 6.0,
    's': 6.3, 't': 9.1, 'u': 2.8, 'v': 0.98, 'w': 2.4, 'x': 0.15,
    'y': 2.0, 'z': 0.074,
}

# Common English words for scoring
COMMON_WORDS = {
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
    'meet', 'forum', 'midnight', 'attack', 'caesar', 'secret', 'dawn',
}


# ─── Caesar Math ────────────────────────────────────────────────────────────
def caesar_shift(text: str, shift: int) -> str:
    """Shift every letter in text by shift positions (mod 26)."""
    result = []
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return ''.join(result)


# ─── Vigenère Math ──────────────────────────────────────────────────────────
def vigenere_shift(text: str, key: str, decrypt: bool = False) -> str:
    """Polyalphabetic substitution cipher over text with key."""
    if not key:
        return text
    clean_key = ''.join([c.upper() for c in key if c.isalpha()])
    if not clean_key:
        return text

    result = []
    key_idx = 0
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            k_char = clean_key[key_idx % len(clean_key)]
            shift = ord(k_char) - ord('A')
            if decrypt:
                shift = -shift
            result.append(chr((ord(ch) - base + shift) % 26 + base))
            key_idx += 1
        else:
            result.append(ch)
    return ''.join(result)


# ─── Cryptanalysis & Heuristics ─────────────────────────────────────────────
def score_text(text: str) -> float:
    """Score how English-like a text is."""
    lower = text.lower()
    letters = [ch for ch in lower if ch.isalpha()]
    if not letters:
        return 0.0

    freq_score = sum(ENGLISH_FREQ.get(ch, 0) for ch in letters) / len(letters)
    words = lower.split()
    word_hits = sum(1 for w in words if w.strip(string.punctuation) in COMMON_WORDS)
    word_bonus = (word_hits / max(len(words), 1)) * 18.0

    return freq_score + word_bonus


# ─── Routes ─────────────────────────────────────────────────────────────────
@app.route('/')
@app.route('/index.html')
@app.route('/caesar')
def home():
    return render_template('home.html', active_tab='caesar')


@app.route('/vigenere')
@app.route('/vigenere.html')
def vigenere_page():
    return render_template('vigenere.html', active_tab='vigenere')


@app.route('/frequency')
@app.route('/frequency.html')
def frequency_page():
    return render_template('frequency.html', active_tab='frequency')


@app.route('/tools')
def tools():
    return render_template('home.html', active_tab='caesar')


@app.route('/about')
def about():
    return render_template('about.html')


# ─── API Endpoints ──────────────────────────────────────────────────────────
@app.route('/api/encrypt', methods=['POST'])
def api_encrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    shift = int(data.get('shift', 3))
    result = caesar_shift(text, shift)
    return jsonify({'result': result, 'shift': shift})


@app.route('/api/decrypt', methods=['POST'])
def api_decrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    shift = int(data.get('shift', 3))
    result = caesar_shift(text, -shift)
    return jsonify({'result': result, 'shift': shift})


@app.route('/api/crack', methods=['POST'])
def api_crack():
    data = request.get_json(force=True)
    text = data.get('text', '')

    results = []
    for shift in range(1, 26):
        decrypted = caesar_shift(text, -shift)
        sc = score_text(decrypted)
        results.append({'shift': shift, 'text': decrypted, 'score': round(sc, 2)})

    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({'results': results})


@app.route('/api/vigenere/encrypt', methods=['POST'])
def api_vigenere_encrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    key = data.get('key', 'LEMON')
    result = vigenere_shift(text, key, decrypt=False)
    return jsonify({'result': result, 'key': key})


@app.route('/api/vigenere/decrypt', methods=['POST'])
def api_vigenere_decrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    key = data.get('key', 'LEMON')
    result = vigenere_shift(text, key, decrypt=True)
    return jsonify({'result': result, 'key': key})


@app.route('/api/frequency', methods=['POST'])
def api_frequency():
    data = request.get_json(force=True)
    text = data.get('text', '')
    clean = [c.lower() for c in text if c.isalpha()]
    total = len(clean)

    counts = {c: clean.count(c) for c in string.ascii_lowercase}
    percentages = {c: round((cnt / total * 100), 2) if total else 0 for c, cnt in counts.items()}

    return jsonify({
        'total': total,
        'counts': counts,
        'percentages': percentages
    })


# ─── Run ────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n  [*] Cipher Studio Suite (Warm Bento Edition) running!")
    print("  [>] Open http://localhost:5000 in your browser\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
