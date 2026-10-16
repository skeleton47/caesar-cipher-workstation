"""
Hill Cipher Cryptographic Lab Engine
Handles exact integer modular arithmetic modulo 26, 2x2 and 3x3 key validation,
determinant computation, modular multiplicative inverse, matrix inversion,
verification, and step-by-step vector matrix multiplication.
"""

import math
import random
from typing import List, Tuple, Dict, Any, Optional


def egcd(a: int, b: int) -> Tuple[int, int, int]:
    """Extended Euclidean Algorithm: returns (gcd, x, y) such that a*x + b*y = gcd."""
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = egcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd, x, y


def mod_inverse(a: int, m: int = 26) -> Optional[int]:
    """
    Compute the modular multiplicative inverse of a modulo m.
    Returns x such that (a * x) % m == 1, or None if gcd(a, m) != 1.
    """
    a = a % m
    gcd, x, _ = egcd(a, m)
    if gcd != 1:
        return None
    return (x % m + m) % m


def determinant_2x2(matrix: List[List[int]]) -> int:
    """Compute determinant of a 2x2 matrix."""
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]


def determinant_3x3(matrix: List[List[int]]) -> int:
    """Compute determinant of a 3x3 matrix via cofactor expansion along row 0."""
    m = matrix
    c0 = m[1][1] * m[2][2] - m[1][2] * m[2][1]
    c1 = m[1][0] * m[2][2] - m[1][2] * m[2][0]
    c2 = m[1][0] * m[2][1] - m[1][1] * m[2][0]
    return m[0][0] * c0 - m[0][1] * c1 + m[0][2] * c2


def determinant(matrix: List[List[int]]) -> int:
    """Compute determinant for supported sizes (2 or 3)."""
    n = len(matrix)
    if n == 2:
        return determinant_2x2(matrix)
    elif n == 3:
        return determinant_3x3(matrix)
    else:
        raise ValueError(f"Unsupported matrix dimension: {n}x{n}. Supported: 2x2, 3x3.")


def adjugate_2x2(matrix: List[List[int]]) -> List[List[int]]:
    """Compute adjugate of 2x2 matrix modulo 26."""
    m = matrix
    # [ [ d, -b ], [ -c, a ] ]
    return [
        [m[1][1] % 26, (-m[0][1]) % 26],
        [(-m[1][0]) % 26, m[0][0] % 26]
    ]


def adjugate_3x3(matrix: List[List[int]]) -> List[List[int]]:
    """Compute classical adjoint (transpose of cofactor matrix) for 3x3 matrix modulo 26."""
    m = matrix
    adj = [[0] * 3 for _ in range(3)]
    for r in range(3):
        for c in range(3):
            # Minor submatrix 2x2
            minor = []
            for i in range(3):
                if i == r:
                    continue
                row = []
                for j in range(3):
                    if j == c:
                        continue
                    row.append(m[i][j])
                minor.append(row)
            det_minor = determinant_2x2(minor)
            cofactor = ((-1) ** (r + c)) * det_minor
            # Adjugate is transpose of cofactors: adj[c][r] = cofactor
            adj[c][r] = cofactor % 26
    return adj


def matrix_inverse_mod26(matrix: List[List[int]]) -> Tuple[bool, Optional[List[List[int]]], Dict[str, Any]]:
    """
    Compute the exact modular inverse of matrix K modulo 26.
    Returns: (is_valid, inverse_matrix, diagnostics_dict)
    """
    n = len(matrix)
    det_raw = determinant(matrix)
    det_mod26 = det_raw % 26
    gcd_val = math.gcd(det_mod26, 26)
    det_inv = mod_inverse(det_mod26, 26)

    diag: Dict[str, Any] = {
        "dimension": n,
        "det_raw": det_raw,
        "det_mod26": det_mod26,
        "gcd": gcd_val,
        "det_inv": det_inv,
        "is_invertible": (gcd_val == 1 and det_inv is not None)
    }

    if gcd_val != 1 or det_inv is None:
        reasons = []
        if gcd_val != 1:
            reasons.append(f"gcd(det mod 26, 26) = gcd({det_mod26}, 26) = {gcd_val} ≠ 1.")
        if det_mod26 % 2 == 0:
            reasons.append("Determinant is even (shares factor 2 with 26).")
        if det_mod26 % 13 == 0:
            reasons.append("Determinant is divisible by 13 (shares factor 13 with 26).")
        diag["error_reason"] = " ".join(reasons)
        return False, None, diag

    # Compute adjugate
    if n == 2:
        adj = adjugate_2x2(matrix)
    elif n == 3:
        adj = adjugate_3x3(matrix)
    else:
        return False, None, {"error_reason": "Unsupported matrix dimension."}

    diag["adjugate"] = adj

    # Inverse = (det_inv * adj) mod 26
    inv = [[(det_inv * adj[r][c]) % 26 for c in range(n)] for r in range(n)]
    diag["inverse"] = inv

    # Verification: check K * K^-1 mod 26 == Identity
    check_id = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            s = sum((matrix[i][k] * inv[k][j]) for k in range(n))
            check_id[i][j] = s % 26

    is_identity = all(
        check_id[i][j] == (1 if i == j else 0) for i in range(n) for j in range(n)
    )
    diag["identity_verified"] = is_identity

    return is_identity, inv, diag


def generate_invertible_matrix(n: int = 2) -> List[List[int]]:
    """
    Generate a random, strictly invertible matrix modulo 26.
    Loops until gcd(det, 26) == 1.
    """
    while True:
        candidate = [[random.randint(0, 25) for _ in range(n)] for _ in range(n)]
        det_m = determinant(candidate) % 26
        if math.gcd(det_m, 26) == 1:
            return candidate


def prepare_hill_text(text: str, block_size: int = 2, pad_char: str = 'X') -> Tuple[List[str], str, int]:
    """
    Normalize plaintext to uppercase A-Z and group into blocks of size block_size.
    Pads incomplete final block with pad_char.
    Returns: (blocks, full_padded_text, pad_count)
    """
    clean = "".join([c.upper() for c in text if c.isalpha()])
    pad_char = pad_char.upper() if pad_char and pad_char.isalpha() else 'X'

    remainder = len(clean) % block_size
    pad_count = (block_size - remainder) % block_size
    padded = clean + (pad_char * pad_count)

    blocks = [padded[i:i + block_size] for i in range(0, len(padded), block_size)]
    return blocks, padded, pad_count


def hill_transform(
    text: str,
    key_matrix: List[List[int]],
    decrypt: bool = False,
    pad_char: str = 'X'
) -> Dict[str, Any]:
    """
    Encrypt or decrypt text using Hill cipher with full step-by-step telemetry.
    """
    n = len(key_matrix)
    is_valid, inv_matrix, diag = matrix_inverse_mod26(key_matrix)

    if not is_valid or inv_matrix is None:
        return {
            "success": False,
            "error": diag.get("error_reason", "Key matrix is not invertible modulo 26."),
            "diagnostics": diag
        }

    active_matrix = inv_matrix if decrypt else key_matrix
    blocks, padded_text, pad_count = prepare_hill_text(text, n, pad_char)

    steps = []
    output_chars = []

    for block_idx, block in enumerate(blocks):
        # Convert chars to numeric vector
        p_vec = [ord(c) - ord('A') for c in block]
        c_vec = []
        arithmetic_breakdown = []

        for r in range(n):
            terms = []
            row_sum = 0
            for c in range(n):
                k_val = active_matrix[r][c] % 26
                p_val = p_vec[c]
                prod = k_val * p_val
                row_sum += prod
                terms.append(f"({k_val} × {p_val})")
            c_val = row_sum % 26
            c_vec.append(c_val)
            arithmetic_breakdown.append({
                "row": r,
                "expression": " + ".join(terms),
                "sum": row_sum,
                "mod26": c_val,
                "char": chr(ord('A') + c_val)
            })

        out_block = "".join(chr(ord('A') + v) for v in c_vec)
        output_chars.append(out_block)

        steps.append({
            "block_index": block_idx,
            "input_chars": block,
            "input_vector": p_vec,
            "output_vector": c_vec,
            "output_chars": out_block,
            "breakdown": arithmetic_breakdown
        })

    result_text = "".join(output_chars)

    return {
        "success": True,
        "mode": "decrypt" if decrypt else "encrypt",
        "result": result_text,
        "result_spaced": " ".join(output_chars),
        "input_blocks": blocks,
        "padded_input": padded_text,
        "pad_count": pad_count,
        "steps": steps,
        "key_matrix": key_matrix,
        "inverse_matrix": inv_matrix,
        "diagnostics": diag
    }
