"""
Playfair Cipher Cryptographic Engine
Handles deterministic 5x5 key matrix generation, intelligent digraph text preparation,
strict row/col/rectangle transformations, and step-by-step telemetry.
"""

import string
from typing import List, Tuple, Dict, Any


def generate_playfair_matrix(keyword: str) -> List[List[str]]:
    """
    Generate a 5x5 Playfair key matrix from a keyword.
    Uses standard I/J combination ('J' is mapped to 'I').
    Removes duplicate letters in keyword, then fills remaining letters of the alphabet.
    """
    seen = set()
    matrix_letters = []

    # Process keyword
    clean_kw = keyword.upper().replace('J', 'I')
    for ch in clean_kw:
        if ch in string.ascii_uppercase and ch not in seen:
            seen.add(ch)
            matrix_letters.append(ch)

    # Alphabet excluding J
    alphabet = [c for c in string.ascii_uppercase if c != 'J']
    for ch in alphabet:
        if ch not in seen:
            seen.add(ch)
            matrix_letters.append(ch)

    # Reshape into 5x5
    return [matrix_letters[i * 5:(i + 1) * 5] for i in range(5)]


def prepare_playfair_text(text: str, filler: str = 'X') -> List[Tuple[str, str]]:
    """
    Intelligently prepare plaintext into digraphs (pairs of letters):
    1. Filter non-alpha, uppercase, map 'J' -> 'I'.
    2. Split into pairs. If duplicate letters occur within a pair, insert filler.
       If the duplicate letter is equal to filler, use alternate filler 'Q'.
    3. If the final length is odd, pad with filler (or 'Z' if odd character is filler).
    """
    clean = [c.upper().replace('J', 'I') for c in text if c.isalpha()]
    digraphs: List[Tuple[str, str]] = []
    i = 0
    filler = filler.upper() if filler else 'X'
    if filler == 'J':
        filler = 'I'

    while i < len(clean):
        c1 = clean[i]
        if i + 1 < len(clean):
            c2 = clean[i + 1]
            if c1 == c2:
                # Insert filler between duplicate characters
                f = 'Q' if c1 == filler else filler
                digraphs.append((c1, f))
                i += 1  # c2 remains for the next pair
            else:
                digraphs.append((c1, c2))
                i += 2
        else:
            # Single trailing letter: pad with filler
            f = 'Z' if c1 == filler else filler
            digraphs.append((c1, f))
            i += 1

    return digraphs


def _find_pos(matrix: List[List[str]], char: str) -> Tuple[int, int]:
    """Return (row, col) coordinates for a character in the 5x5 matrix."""
    for r in range(5):
        for c in range(5):
            if matrix[r][c] == char:
                return r, c
    raise ValueError(f"Character '{char}' not found in matrix.")


def playfair_transform_pair(
    p1: str, p2: str, matrix: List[List[str]], decrypt: bool = False
) -> Dict[str, Any]:
    """
    Apply Playfair rule to a single digraph pair.
    Returns details including rule applied, source/target coordinates, and resulting pair.
    """
    p1_clean = p1.upper().replace('J', 'I')
    p2_clean = p2.upper().replace('J', 'I')
    r1, c1 = _find_pos(matrix, p1_clean)
    r2, c2 = _find_pos(matrix, p2_clean)

    shift = -1 if decrypt else 1

    if r1 == r2:
        # Same Row Rule: shift columns horizontally modulo 5
        rule = "same_row"
        out1 = matrix[r1][(c1 + shift) % 5]
        out2 = matrix[r2][(c2 + shift) % 5]
        out_r1, out_c1 = r1, (c1 + shift) % 5
        out_r2, out_c2 = r2, (c2 + shift) % 5
    elif c1 == c2:
        # Same Column Rule: shift rows vertically modulo 5
        rule = "same_column"
        out1 = matrix[(r1 + shift) % 5][c1]
        out2 = matrix[(r2 + shift) % 5][c2]
        out_r1, out_c1 = (r1 + shift) % 5, c1
        out_r2, out_c2 = (r2 + shift) % 5, c2
    else:
        # Rectangle Rule: swap columns
        rule = "rectangle"
        out1 = matrix[r1][c2]
        out2 = matrix[r2][c1]
        out_r1, out_c1 = r1, c2
        out_r2, out_c2 = r2, c1

    return {
        "in_pair": (p1_clean, p2_clean),
        "out_pair": (out1, out2),
        "rule": rule,
        "coords_in": [(r1, c1), (r2, c2)],
        "coords_out": [(out_r1, out_c1), (out_r2, out_c2)],
    }


def playfair_encrypt(
    plaintext: str, keyword: str = "MONARCHY", filler: str = "X"
) -> Dict[str, Any]:
    """Encrypt plaintext using Playfair Cipher with full step data."""
    matrix = generate_playfair_matrix(keyword)
    digraphs = prepare_playfair_text(plaintext, filler)

    steps = []
    ciphertext_chars = []
    for p1, p2 in digraphs:
        step = playfair_transform_pair(p1, p2, matrix, decrypt=False)
        steps.append(step)
        ciphertext_chars.append(step["out_pair"][0] + step["out_pair"][1])

    ciphertext = "".join(ciphertext_chars)
    return {
        "ciphertext": ciphertext,
        "ciphertext_spaced": " ".join(ciphertext_chars),
        "digraphs": ["".join(d) for d in digraphs],
        "steps": steps,
        "matrix": matrix,
        "keyword": keyword,
    }


def playfair_decrypt(ciphertext: str, keyword: str = "MONARCHY") -> Dict[str, Any]:
    """
    Decrypt Playfair ciphertext (must be pairs of letters).
    Decryption processes consecutive 2-letter blocks using inverse rules.
    """
    matrix = generate_playfair_matrix(keyword)
    clean = [c.upper().replace('J', 'I') for c in ciphertext if c.isalpha()]

    # If ciphertext has odd characters, pad with X
    if len(clean) % 2 != 0:
        clean.append('X')

    digraphs = [(clean[i], clean[i + 1]) for i in range(0, len(clean), 2)]
    steps = []
    plaintext_chars = []
    for c1, c2 in digraphs:
        step = playfair_transform_pair(c1, c2, matrix, decrypt=True)
        steps.append(step)
        plaintext_chars.append(step["out_pair"][0] + step["out_pair"][1])

    plaintext = "".join(plaintext_chars)
    return {
        "plaintext": plaintext,
        "plaintext_spaced": " ".join(plaintext_chars),
        "digraphs": ["".join(d) for d in digraphs],
        "steps": steps,
        "matrix": matrix,
        "keyword": keyword,
    }
