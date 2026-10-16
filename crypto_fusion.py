"""
Cipher Fusion Engine — Multi-Cipher Cascade Encryption & Decryption
Chains four classical ciphers: Caesar, Vigenère, Playfair, and Hill in a configurable pipeline.
Supports Classic Mode and Reversible Package Mode with exact metadata round-tripping.
"""

import string
import math
import copy
from typing import List, Dict, Any, Tuple, Optional

import crypto_playfair
import crypto_hill


# ─── Default Keys & Constants ───────────────────────────────────────────────
DEFAULT_CAESAR_KEY = 3
DEFAULT_VIGENERE_KEY = "LEMON"
DEFAULT_PLAYFAIR_KEY = "MONARCHY"
DEFAULT_PLAYFAIR_FILLER = "X"
DEFAULT_HILL_MATRIX_2X2 = [[3, 3], [2, 5]]  # det = 9, gcd(9, 26) = 1, inv = [[15, 17], [20, 9]]
DEFAULT_HILL_MATRIX_3X3 = [[6, 24, 1], [13, 16, 10], [20, 17, 15]]  # det = 25, gcd = 1, inv = [[8, 5, 10], [21, 8, 21], [21, 12, 8]]


def get_default_pipeline_config() -> List[Dict[str, Any]]:
    """Return default 4-stage pipeline configuration."""
    return [
        {
            "id": "caesar",
            "name": "Caesar Cipher",
            "enabled": True,
            "key": {"shift": DEFAULT_CAESAR_KEY}
        },
        {
            "id": "vigenere",
            "name": "Vigenère Cipher",
            "enabled": True,
            "key": {"keyword": DEFAULT_VIGENERE_KEY}
        },
        {
            "id": "playfair",
            "name": "Playfair Cipher",
            "enabled": True,
            "key": {
                "keyword": DEFAULT_PLAYFAIR_KEY,
                "filler": DEFAULT_PLAYFAIR_FILLER
            }
        },
        {
            "id": "hill",
            "name": "Hill Cipher",
            "enabled": True,
            "key": {
                "dimension": 2,
                "matrix": copy.deepcopy(DEFAULT_HILL_MATRIX_2X2),
                "pad_char": "X"
            }
        }
    ]


# ─── Caesar & Vigenère Primitives ───────────────────────────────────────────
def caesar_transform(text: str, shift: int, decrypt: bool = False) -> Tuple[str, List[Dict[str, Any]]]:
    """Apply Caesar shift to text. Only affects A-Z."""
    actual_shift = (-shift if decrypt else shift) % 26
    steps = []
    result = []

    for i, ch in enumerate(text):
        if 'A' <= ch <= 'Z':
            base = ord('A')
            in_val = ord(ch) - base
            out_val = (in_val + actual_shift) % 26
            out_ch = chr(base + out_val)
            result.append(out_ch)
            steps.append({
                "index": i,
                "char_in": ch,
                "val_in": in_val,
                "shift": actual_shift,
                "val_out": out_val,
                "char_out": out_ch
            })
        else:
            result.append(ch)

    return "".join(result), steps


def vigenere_transform(text: str, keyword: str, decrypt: bool = False) -> Tuple[str, List[Dict[str, Any]]]:
    """Apply Vigenère transform to text using keyword."""
    clean_key = "".join([c.upper() for c in keyword if 'A' <= c.upper() <= 'Z'])
    if not clean_key:
        clean_key = "A"

    steps = []
    result = []
    key_len = len(clean_key)
    key_idx = 0

    for i, ch in enumerate(text):
        if 'A' <= ch <= 'Z':
            base = ord('A')
            k_char = clean_key[key_idx % key_len]
            k_shift = ord(k_char) - base
            actual_shift = (-k_shift if decrypt else k_shift) % 26

            in_val = ord(ch) - base
            out_val = (in_val + actual_shift) % 26
            out_ch = chr(base + out_val)

            result.append(out_ch)
            steps.append({
                "index": i,
                "char_in": ch,
                "key_char": k_char,
                "key_index": key_idx % key_len,
                "shift": k_shift,
                "direction": "-" if decrypt else "+",
                "val_out": out_val,
                "char_out": out_ch
            })
            key_idx += 1
        else:
            result.append(ch)

    return "".join(result), steps


# ─── Playfair Step Integration ──────────────────────────────────────────────
def playfair_transform_cascade(
    text: str, keyword: str, filler: str = 'X', decrypt: bool = False
) -> Tuple[str, Dict[str, Any]]:
    """
    Apply Playfair transformation for cascade.
    When encrypting: records inserted filler positions and J substitutions.
    """
    matrix = crypto_playfair.generate_playfair_matrix(keyword)

    if not decrypt:
        # Track J positions in input
        j_indices = [idx for idx, c in enumerate(text) if c.upper() == 'J']
        clean = [c.upper().replace('J', 'I') for c in text if 'A' <= c.upper() <= 'Z']

        filler_char = filler.upper() if filler and filler.isalpha() else 'X'
        if filler_char == 'J':
            filler_char = 'I'

        digraphs = []
        insertions = []  # List of {index_in_prepared_stream, char, type}
        clean_idx = 0
        prepared_stream = []

        while clean_idx < len(clean):
            c1 = clean[clean_idx]
            if clean_idx + 1 < len(clean):
                c2 = clean[clean_idx + 1]
                if c1 == c2:
                    f = 'Q' if c1 == filler_char else filler_char
                    digraphs.append((c1, f))
                    insertions.append({"index": len(prepared_stream) + 1, "char": f, "type": "duplicate_separator"})
                    prepared_stream.extend([c1, f])
                    clean_idx += 1
                else:
                    digraphs.append((c1, c2))
                    prepared_stream.extend([c1, c2])
                    clean_idx += 2
            else:
                f = 'Z' if c1 == filler_char else filler_char
                digraphs.append((c1, f))
                insertions.append({"index": len(prepared_stream) + 1, "char": f, "type": "odd_pad"})
                prepared_stream.extend([c1, f])
                clean_idx += 1

        steps = []
        out_chars = []
        for p1, p2 in digraphs:
            step = crypto_playfair.playfair_transform_pair(p1, p2, matrix, decrypt=False)
            steps.append(step)
            out_chars.append(step["out_pair"][0] + step["out_pair"][1])

        return "".join(out_chars), {
            "matrix": matrix,
            "digraphs": digraphs,
            "insertions": insertions,
            "j_indices": j_indices,
            "steps": steps,
            "keyword": keyword
        }
    else:
        # Decryption
        clean = [c.upper().replace('J', 'I') for c in text if 'A' <= c.upper() <= 'Z']
        if len(clean) % 2 != 0:
            clean.append('X')

        digraphs = [(clean[i], clean[i + 1]) for i in range(0, len(clean), 2)]
        steps = []
        out_chars = []
        for c1, c2 in digraphs:
            step = crypto_playfair.playfair_transform_pair(c1, c2, matrix, decrypt=True)
            steps.append(step)
            out_chars.append(step["out_pair"][0] + step["out_pair"][1])

        return "".join(out_chars), {
            "matrix": matrix,
            "digraphs": digraphs,
            "steps": steps,
            "keyword": keyword
        }


# ─── Hill Step Integration ──────────────────────────────────────────────────
def hill_transform_cascade(
    text: str, key_matrix: List[List[int]], decrypt: bool = False, pad_char: str = 'X'
) -> Tuple[str, Dict[str, Any]]:
    """Apply Hill transformation with pad tracking."""
    result = crypto_hill.hill_transform(text, key_matrix, decrypt=decrypt, pad_char=pad_char)
    if not result.get("success", False):
        raise ValueError(result.get("error", "Hill cipher matrix is not invertible modulo 26."))

    return result["result"], result


# ─── Metadata Preparation & Reconstruction ──────────────────────────────────
def extract_normalization_metadata(text: str) -> Tuple[str, Dict[str, Any]]:
    """
    Extract formatting and casing metadata from original plaintext to enable
    100% loss-free reconstruction in Reversible Package Mode.
    No plaintexts or secrets are stored in this metadata.
    """
    clean_chars = []
    case_mask = []  # 1 for uppercase, 0 for lowercase
    formatting_tokens = []  # Characters that are not A-Z with their original positions

    clean_pos = 0
    for original_idx, ch in enumerate(text):
        if ch.isalpha():
            clean_chars.append(ch.upper())
            case_mask.append(1 if ch.isupper() else 0)
            clean_pos += 1
        else:
            formatting_tokens.append({
                "pos": original_idx,
                "char": ch
            })

    metadata = {
        "original_length": len(text),
        "clean_length": len(clean_chars),
        "case_mask": case_mask,
        "formatting_tokens": formatting_tokens,
        "stage_metadata": {}
    }

    return "".join(clean_chars), metadata


def restore_text_from_metadata(clean_decrypted: str, metadata: Dict[str, Any]) -> str:
    """
    Reconstruct original plaintext formatting, casing, spaces, and punctuation using metadata.
    Does not use any secret keys or saved plaintext.
    """
    chars = list(clean_decrypted)

    # 1. Restore casing
    case_mask = metadata.get("case_mask", [])
    for idx in range(min(len(chars), len(case_mask))):
        if case_mask[idx] == 0:
            chars[idx] = chars[idx].lower()

    # 2. Restore spaces, numbers, and punctuation
    formatting = metadata.get("formatting_tokens", [])
    result = []
    char_ptr = 0
    formatting_dict = {item["pos"]: item["char"] for item in formatting}
    total_len = metadata.get("original_length", len(chars) + len(formatting))

    for original_pos in range(total_len):
        if original_pos in formatting_dict:
            result.append(formatting_dict[original_pos])
        elif char_ptr < len(chars):
            result.append(chars[char_ptr])
            char_ptr += 1

    return "".join(result)


# ─── Pipeline Validation ────────────────────────────────────────────────────
def validate_pipeline(pipeline: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Validate each stage in the pipeline before execution."""
    errors = []
    warnings = []

    active_stages = [s for s in pipeline if s.get("enabled", True)]
    if not active_stages:
        errors.append("At least one cipher stage must be enabled in the pipeline.")

    for idx, stage in enumerate(active_stages):
        stage_id = stage.get("id")
        key = stage.get("key", {})

        if stage_id == "caesar":
            shift = key.get("shift")
            if shift is None:
                errors.append(f"Stage {idx+1} (Caesar): Shift value must be provided.")
            else:
                try:
                    int(shift)
                except (ValueError, TypeError):
                    errors.append(f"Stage {idx+1} (Caesar): Shift must be a valid integer between 0 and 25.")

        elif stage_id == "vigenere":
            kw = key.get("keyword", "")
            clean = [c for c in str(kw) if c.isalpha()]
            if not clean:
                errors.append(f"Stage {idx+1} (Vigenère): Keyword must contain at least one alphabetic letter.")

        elif stage_id == "playfair":
            kw = key.get("keyword", "")
            clean = [c for c in str(kw) if c.isalpha()]
            if not clean:
                errors.append(f"Stage {idx+1} (Playfair): Keyword must contain at least one alphabetic letter.")
            filler = key.get("filler", "X")
            if not filler or not str(filler).isalpha():
                warnings.append(f"Stage {idx+1} (Playfair): Filler character must be an alphabetic letter; defaulting to 'X'.")

        elif stage_id == "hill":
            matrix = key.get("matrix")
            if not matrix or not isinstance(matrix, list) or len(matrix) < 2 or any(len(r) != len(matrix) for r in matrix):
                errors.append(f"Stage {idx+1} (Hill): Matrix must be a square matrix (at least 2x2).")
            else:
                is_valid, inv, diag = crypto_hill.matrix_inverse_mod26(matrix)
                if not is_valid:
                    errors.append(f"Stage {idx+1} (Hill): {diag.get('error_reason', 'Matrix is not invertible modulo 26.')}")

        else:
            errors.append(f"Stage {idx+1}: Unknown cipher type '{stage_id}'.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "active_stages_count": len(active_stages)
    }


# ─── Full Pipeline Execution: Encrypt ───────────────────────────────────────
def fusion_encrypt(
    plaintext: str,
    pipeline: Optional[List[Dict[str, Any]]] = None,
    mode: str = "classic"
) -> Dict[str, Any]:
    """
    Execute full sequential encryption pipeline:
    Plaintext -> Stage 1 -> Stage 2 -> Stage 3 -> Stage 4 -> Final Ciphertext.
    Each stage receives the actual output of the preceding stage.
    """
    if pipeline is None:
        pipeline = get_default_pipeline_config()

    # 1. Validation
    val = validate_pipeline(pipeline)
    if not val["valid"]:
        return {
            "success": False,
            "error": "Pipeline validation failed: " + "; ".join(val["errors"]),
            "validation": val
        }

    # 2. Normalization
    clean_input, metadata = extract_normalization_metadata(plaintext)
    if not clean_input:
        return {
            "success": False,
            "error": "Input message contains no alphabetic characters to encrypt."
        }

    current_text = clean_input
    stages_telemetry = []
    stage_metadata = {}

    # 3. Sequential Stage Execution
    for stage_idx, stage in enumerate(pipeline):
        if not stage.get("enabled", True):
            continue

        stage_id = stage["id"]
        stage_name = stage.get("name", stage_id.title())
        stage_key = stage.get("key", {})
        input_for_stage = current_text

        if stage_id == "caesar":
            shift = int(stage_key.get("shift", DEFAULT_CAESAR_KEY))
            out_text, steps = caesar_transform(input_for_stage, shift, decrypt=False)
            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "caesar",
                "name": stage_name,
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"shift": shift},
                "explanation": f"Shifted {len(input_for_stage)} characters by +{shift} modulo 26.",
                "steps": steps
            })
            current_text = out_text

        elif stage_id == "vigenere":
            keyword = str(stage_key.get("keyword", DEFAULT_VIGENERE_KEY))
            out_text, steps = vigenere_transform(input_for_stage, keyword, decrypt=False)
            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "vigenere",
                "name": stage_name,
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"keyword": keyword},
                "explanation": f"Applied polyalphabetic substitution with repeating keyword '{keyword}'.",
                "steps": steps
            })
            current_text = out_text

        elif stage_id == "playfair":
            keyword = str(stage_key.get("keyword", DEFAULT_PLAYFAIR_KEY))
            filler = str(stage_key.get("filler", DEFAULT_PLAYFAIR_FILLER))
            out_text, pf_info = playfair_transform_cascade(input_for_stage, keyword, filler=filler, decrypt=False)

            # Record stage-specific metadata
            stage_metadata[f"stage_{stage_idx}_playfair"] = {
                "insertions": pf_info.get("insertions", []),
                "j_indices": pf_info.get("j_indices", [])
            }

            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "playfair",
                "name": stage_name,
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"keyword": keyword, "filler": filler},
                "matrix": pf_info["matrix"],
                "digraphs": pf_info["digraphs"],
                "insertions": pf_info["insertions"],
                "explanation": f"Formed {len(pf_info['digraphs'])} digraphs and applied 5x5 matrix rectangle/row/col rules.",
                "steps": pf_info["steps"]
            })
            current_text = out_text

        elif stage_id == "hill":
            matrix = stage_key.get("matrix", DEFAULT_HILL_MATRIX_2X2)
            pad_char = stage_key.get("pad_char", "X")
            out_text, hill_info = hill_transform_cascade(input_for_stage, matrix, decrypt=False, pad_char=pad_char)

            # Record stage-specific metadata
            stage_metadata[f"stage_{stage_idx}_hill"] = {
                "pad_count": hill_info.get("pad_count", 0),
                "pad_char": pad_char
            }

            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "hill",
                "name": stage_name,
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"matrix": matrix, "dimension": len(matrix)},
                "inverse_matrix": hill_info["inverse_matrix"],
                "pad_count": hill_info["pad_count"],
                "blocks": hill_info["input_blocks"],
                "explanation": f"Multiplied {len(hill_info['steps'])} vector blocks by {len(matrix)}x{len(matrix)} matrix modulo 26.",
                "steps": hill_info["steps"]
            })
            current_text = out_text

    final_ciphertext = current_text
    metadata["stage_metadata"] = stage_metadata

    # Reversible package construction
    package = {
        "version": "1.0",
        "format": "cipher_fusion_package",
        "mode": mode,
        "ciphertext": final_ciphertext,
        "pipeline_sequence": [s["id"] for s in pipeline if s.get("enabled", True)],
        "metadata": metadata
    }

    return {
        "success": True,
        "mode": mode,
        "original_input": plaintext,
        "normalized_input": clean_input,
        "final_ciphertext": final_ciphertext,
        "final_ciphertext_spaced": " ".join([final_ciphertext[i:i+4] for i in range(0, len(final_ciphertext), 4)]),
        "stages": stages_telemetry,
        "pipeline_used": pipeline,
        "reversible_package": package,
        "metadata": metadata
    }


# ─── Full Pipeline Execution: Decrypt ───────────────────────────────────────
def fusion_decrypt(
    ciphertext: str,
    pipeline: Optional[List[Dict[str, Any]]] = None,
    mode: str = "classic",
    package_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Execute full reverse decryption pipeline:
    Ciphertext -> Stage 4 (Inverse) -> Stage 3 (Inverse) -> Stage 2 (Inverse) -> Stage 1 (Inverse) -> Plaintext.
    Executes active ciphers in exact reverse order using their respective inverse keys.
    """
    if pipeline is None:
        pipeline = get_default_pipeline_config()

    # 1. Validation
    val = validate_pipeline(pipeline)
    if not val["valid"]:
        return {
            "success": False,
            "error": "Pipeline validation failed: " + "; ".join(val["errors"]),
            "validation": val
        }

    clean_cipher = "".join([c.upper() for c in ciphertext if 'A' <= c.upper() <= 'Z'])
    if not clean_cipher:
        return {
            "success": False,
            "error": "Ciphertext message contains no alphabetic characters to decrypt."
        }

    # 2. Reverse Active Pipeline Order with original stage indices
    active_stages_with_indices = [
        (idx, copy.deepcopy(stage))
        for idx, stage in enumerate(pipeline)
        if stage.get("enabled", True)
    ]
    reverse_stages = list(reversed(active_stages_with_indices))

    current_text = clean_cipher
    stages_telemetry = []
    st_meta = package_metadata.get("stage_metadata", {}) if (mode == "reversible" and package_metadata) else {}

    # 3. Sequential Reverse Execution
    for orig_stage_idx, stage in reverse_stages:
        stage_id = stage["id"]
        stage_name = stage.get("name", stage_id.title())
        stage_key = stage.get("key", {})
        input_for_stage = current_text

        if stage_id == "hill":
            matrix = stage_key.get("matrix", DEFAULT_HILL_MATRIX_2X2)
            pad_char = stage_key.get("pad_char", "X")
            out_text, hill_info = hill_transform_cascade(input_for_stage, matrix, decrypt=True, pad_char=pad_char)

            # In Reversible Mode: strip Hill padding if recorded for this stage
            hill_meta_key = f"stage_{orig_stage_idx}_hill"
            if mode == "reversible" and hill_meta_key in st_meta:
                pad_cnt = st_meta[hill_meta_key].get("pad_count", 0)
                if pad_cnt > 0 and len(out_text) >= pad_cnt:
                    out_text = out_text[:-pad_cnt]

            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "hill",
                "name": f"{stage_name} (Inverse Decrypt)",
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"matrix": matrix, "inverse": hill_info["inverse_matrix"]},
                "explanation": f"Multiplied {len(hill_info['steps'])} blocks by inverse matrix modulo 26.",
                "steps": hill_info["steps"]
            })
            current_text = out_text

        elif stage_id == "playfair":
            keyword = str(stage_key.get("keyword", DEFAULT_PLAYFAIR_KEY))
            out_text, pf_info = playfair_transform_cascade(input_for_stage, keyword, decrypt=True)

            # In Reversible Mode: strip Playfair inserted fillers and restore J letters
            pf_meta_key = f"stage_{orig_stage_idx}_playfair"
            if mode == "reversible" and pf_meta_key in st_meta:
                pf_data = st_meta[pf_meta_key]
                insertions = pf_data.get("insertions", [])
                j_indices = pf_data.get("j_indices", [])

                chars = list(out_text)
                # Remove insertions from highest index to lowest
                for ins in sorted(insertions, key=lambda x: x["index"], reverse=True):
                    idx = ins["index"]
                    if idx < len(chars):
                        chars.pop(idx)

                # Restore J substitutions
                for j_idx in j_indices:
                    if j_idx < len(chars) and chars[j_idx] == 'I':
                        chars[j_idx] = 'J'

                out_text = "".join(chars)

            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "playfair",
                "name": f"{stage_name} (Inverse Decrypt)",
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"keyword": keyword},
                "matrix": pf_info["matrix"],
                "digraphs": pf_info["digraphs"],
                "explanation": f"Applied inverse Playfair row/column shifts and rectangle rules.",
                "steps": pf_info["steps"]
            })
            current_text = out_text

        elif stage_id == "vigenere":
            keyword = str(stage_key.get("keyword", DEFAULT_VIGENERE_KEY))
            out_text, steps = vigenere_transform(input_for_stage, keyword, decrypt=True)
            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "vigenere",
                "name": f"{stage_name} (Inverse Decrypt)",
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"keyword": keyword},
                "explanation": f"Subtracted repeating keyword shifts modulo 26.",
                "steps": steps
            })
            current_text = out_text

        elif stage_id == "caesar":
            shift = int(stage_key.get("shift", DEFAULT_CAESAR_KEY))
            out_text, steps = caesar_transform(input_for_stage, shift, decrypt=True)
            stages_telemetry.append({
                "stage_index": len(stages_telemetry),
                "id": "caesar",
                "name": f"{stage_name} (Inverse Decrypt)",
                "input": input_for_stage,
                "output": out_text,
                "key_used": {"shift": shift},
                "explanation": f"Shifted characters backwards by -{shift} modulo 26.",
                "steps": steps
            })
            current_text = out_text

    raw_decrypted = current_text
    final_output = raw_decrypted

    # If in reversible mode and metadata provided, perform exact formatting restoration
    restored_formatted = None
    if mode == "reversible" and package_metadata:
        try:
            restored_formatted = restore_text_from_metadata(raw_decrypted, package_metadata)
            final_output = restored_formatted
        except Exception as e:
            final_output = raw_decrypted

    return {
        "success": True,
        "mode": mode,
        "input_ciphertext": ciphertext,
        "decrypted_raw": raw_decrypted,
        "final_plaintext": final_output,
        "restored_formatted": restored_formatted,
        "stages": stages_telemetry,
        "pipeline_used": pipeline,
        "execution_order": [stage["id"] for _, stage in reverse_stages]
    }
