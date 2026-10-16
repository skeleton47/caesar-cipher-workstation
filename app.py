"""
Cipher Studio Suite — Flask Backend
Warm Bento Brutalism Edition: Caesar Cipher, Vigenère Cipher, Frequency Analysis
"""

from flask import Flask, render_template, request, jsonify
import string
import math
import crypto_playfair
import crypto_hill
import crypto_fusion

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


@app.route('/playfair')
@app.route('/playfair.html')
def playfair_page():
    return render_template('playfair.html', active_tab='playfair')


@app.route('/hill')
@app.route('/hill.html')
def hill_page():
    return render_template('hill.html', active_tab='hill')


@app.route('/fusion')
@app.route('/fusion.html')
def fusion_page():
    return render_template('fusion.html', active_tab='fusion')


@app.route('/frequency')
@app.route('/frequency.html')
def frequency_page():
    return render_template('frequency.html', active_tab='frequency')


@app.route('/tools')
def tools():
    return render_template('home.html', active_tab='caesar')


@app.route('/about')
@app.route('/about.html')
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


# ─── Playfair Cipher APIs ───────────────────────────────────────────────────
@app.route('/api/playfair/encrypt', methods=['POST'])
def api_playfair_encrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    keyword = data.get('keyword', 'MONARCHY')
    filler = data.get('filler', 'X')
    result = crypto_playfair.playfair_encrypt(text, keyword, filler)
    return jsonify(result)


@app.route('/api/playfair/decrypt', methods=['POST'])
def api_playfair_decrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    keyword = data.get('keyword', 'MONARCHY')
    result = crypto_playfair.playfair_decrypt(text, keyword)
    return jsonify(result)


# ─── Hill Cipher APIs ───────────────────────────────────────────────────────
@app.route('/api/hill/validate', methods=['POST'])
def api_hill_validate():
    data = request.get_json(force=True)
    matrix = data.get('matrix', [[3, 3], [2, 5]])
    is_valid, inv_mat, diag = crypto_hill.matrix_inverse_mod26(matrix)
    return jsonify({
        'valid': is_valid,
        'inverse': inv_mat,
        'diagnostics': diag
    })


@app.route('/api/hill/generate', methods=['POST'])
def api_hill_generate():
    data = request.get_json(force=True) if request.data else {}
    n = int(data.get('dimension', 2))
    matrix = crypto_hill.generate_invertible_matrix(n)
    is_valid, inv_mat, diag = crypto_hill.matrix_inverse_mod26(matrix)
    return jsonify({
        'matrix': matrix,
        'inverse': inv_mat,
        'diagnostics': diag
    })


@app.route('/api/hill/encrypt', methods=['POST'])
def api_hill_encrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    matrix = data.get('matrix', [[3, 3], [2, 5]])
    pad_char = data.get('pad_char', 'X')
    result = crypto_hill.hill_transform(text, matrix, decrypt=False, pad_char=pad_char)
    return jsonify(result)


@app.route('/api/hill/decrypt', methods=['POST'])
def api_hill_decrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    matrix = data.get('matrix', [[3, 3], [2, 5]])
    pad_char = data.get('pad_char', 'X')
    result = crypto_hill.hill_transform(text, matrix, decrypt=True, pad_char=pad_char)
    return jsonify(result)


# ─── Cipher Fusion APIs ─────────────────────────────────────────────────────
@app.route('/api/fusion/encrypt', methods=['POST'])
def api_fusion_encrypt():
    data = request.get_json(force=True)
    text = data.get('text', '')
    pipeline = data.get('pipeline', None)
    mode = data.get('mode', 'classic')
    result = crypto_fusion.fusion_encrypt(text, pipeline=pipeline, mode=mode)
    return jsonify(result)


@app.route('/api/fusion/decrypt', methods=['POST'])
def api_fusion_decrypt():
    data = request.get_json(force=True)
    ciphertext = data.get('ciphertext', '')
    pipeline = data.get('pipeline', None)
    mode = data.get('mode', 'classic')
    metadata = data.get('metadata', None)
    result = crypto_fusion.fusion_decrypt(ciphertext, pipeline=pipeline, mode=mode, package_metadata=metadata)
    return jsonify(result)


@app.route('/api/fusion/validate', methods=['POST'])
def api_fusion_validate():
    data = request.get_json(force=True)
    pipeline = data.get('pipeline', [])
    result = crypto_fusion.validate_pipeline(pipeline)
    return jsonify(result)


@app.route('/api/fusion/example-keys', methods=['GET'])
def api_fusion_example_keys():
    return jsonify({
        'pipeline': crypto_fusion.get_default_pipeline_config()
    })


def find_available_port(preferred_port: int = 5000, max_tries: int = 50) -> int:
    """Find a guaranteed available port to avoid [WinError 10048] address in use crashes."""
    import socket
    for p in range(preferred_port, preferred_port + max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('0.0.0.0', p))
                return p
            except OSError:
                continue
    return preferred_port


# ─── Run ────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    import os
    import webbrowser
    import threading

    port = find_available_port(5000)
    print("\n" + "=" * 65)
    print("  [*] CIPHER STUDIO SUITE // WARM BENTO BRUTALISM")
    print(f"  [>] Local Server Active:   http://localhost:{port}")
    print(f"  [>] Network Access:        http://127.0.0.1:{port}")
    print("=" * 65 + "\n")

    # Automatically launch browser on initial execution (ignoring Flask reloader child)
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        def _launch_browser():
            import time
            time.sleep(1.2)
            try:
                webbrowser.open(f"http://localhost:{port}")
            except Exception:
                pass
        threading.Thread(target=_launch_browser, daemon=True).start()

    app.run(debug=True, host='0.0.0.0', port=port)

