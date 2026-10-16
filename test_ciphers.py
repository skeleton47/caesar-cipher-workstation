"""
Comprehensive Unit Tests for Playfair and Hill Ciphers
Validates algorithmic correctness, matrix mathematics, edge cases, and roundtrip consistency.
"""

import unittest
import math
from crypto_playfair import (
    generate_playfair_matrix,
    prepare_playfair_text,
    playfair_encrypt,
    playfair_decrypt,
    playfair_transform_pair,
)
from crypto_hill import (
    determinant_2x2,
    determinant_3x3,
    mod_inverse,
    matrix_inverse_mod26,
    generate_invertible_matrix,
    prepare_hill_text,
    hill_transform,
)


class TestPlayfairCipher(unittest.TestCase):

    def test_matrix_generation_deduplication(self):
        matrix = generate_playfair_matrix("MONARCHY")
        # Flatten
        flat = [cell for row in matrix for cell in row]
        self.assertEqual(len(flat), 25)
        self.assertEqual(len(set(flat)), 25)
        # J should never be in standard matrix
        self.assertNotIn("J", flat)
        # First letters should be M, O, N, A, R, C, H, Y
        self.assertEqual(flat[:8], ["M", "O", "N", "A", "R", "C", "H", "Y"])

    def test_text_preparation_balloon(self):
        # BALLOON -> BA, LX, LO, ON
        digraphs = prepare_playfair_text("BALLOON", filler="X")
        self.assertEqual(digraphs, [("B", "A"), ("L", "X"), ("L", "O"), ("O", "N")])

    def test_text_preparation_odd_padding(self):
        # HELLO -> HE, LX, LO -> length 5 is odd, so HE, LX, LO
        digraphs = prepare_playfair_text("HELLO", filler="X")
        self.assertEqual(digraphs, [("H", "E"), ("L", "X"), ("L", "O")])

    def test_repeated_xx_uses_alternate_filler(self):
        # Two consecutive X's should be separated by alternate filler 'Q'
        digraphs = prepare_playfair_text("XX", filler="X")
        self.assertEqual(digraphs, [("X", "Q"), ("X", "Z")])

    def test_rectangle_rule(self):
        matrix = generate_playfair_matrix("MONARCHY")
        # 'E' and 'A':
        # Let's verify transform
        step = playfair_transform_pair("E", "A", matrix, decrypt=False)
        self.assertEqual(step["rule"], "rectangle")
        # Decrypt should restore
        inv = playfair_transform_pair(step["out_pair"][0], step["out_pair"][1], matrix, decrypt=True)
        self.assertEqual(inv["out_pair"], ("E", "A"))

    def test_playfair_roundtrip(self):
        keyword = "MONARCHY"
        plaintext = "ATTACK AT DAWN ON THE NORTH WALL"
        enc = playfair_encrypt(plaintext, keyword)
        dec = playfair_decrypt(enc["ciphertext"], keyword)
        # Decrypted text should equal the prepared digraph text
        expected_normalized = "".join(enc["digraphs"])
        self.assertEqual(dec["plaintext"], expected_normalized)


class TestHillCipher(unittest.TestCase):

    def test_mod_inverse(self):
        # Coprime to 26
        coprimes = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
        for c in coprimes:
            inv = mod_inverse(c, 26)
            self.assertIsNotNone(inv)
            self.assertEqual((c * inv) % 26, 1)

        # Non-coprime (even or div by 13)
        non_coprimes = [0, 2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24]
        for nc in non_coprimes:
            self.assertIsNone(mod_inverse(nc, 26))

    def test_2x2_invertibility_and_roundtrip(self):
        # Classic key: [[3, 3], [2, 5]]
        # det = 3*5 - 3*2 = 15 - 6 = 9. gcd(9, 26) = 1.
        key = [[3, 3], [2, 5]]
        det = determinant_2x2(key)
        self.assertEqual(det, 9)
        self.assertEqual(math.gcd(det % 26, 26), 1)

        is_valid, inv_mat, diag = matrix_inverse_mod26(key)
        self.assertTrue(is_valid)
        self.assertTrue(diag["identity_verified"])

        # Test encrypt & decrypt of "HELP" -> H=7, E=4, L=11, P=15
        # Block 1: [7, 4] -> 3*7+3*4 = 33 % 26 = 7 (H)
        #                    2*7+5*4 = 34 % 26 = 8 (I)
        # Block 2: [11, 15] -> 3*11+3*15 = 78 % 26 = 0 (A)
        #                      2*11+5*15 = 97 % 26 = 19 (T)
        # Expected ciphertext: "HIAT"
        enc = hill_transform("HELP", key, decrypt=False)
        self.assertTrue(enc["success"])
        self.assertEqual(enc["result"], "HIAT")

        dec = hill_transform(enc["result"], key, decrypt=True)
        self.assertTrue(dec["success"])
        self.assertEqual(dec["result"], "HELP")

    def test_non_invertible_matrix_rejection(self):
        # Determinant is even or multiple of 13
        invalid_key = [[2, 4], [1, 6]]  # det = 12 - 4 = 8 (even)
        is_valid, inv_mat, diag = matrix_inverse_mod26(invalid_key)
        self.assertFalse(is_valid)
        self.assertIsNone(inv_mat)
        self.assertIn("error_reason", diag)

        enc = hill_transform("SECRET", invalid_key, decrypt=False)
        self.assertFalse(enc["success"])
        self.assertIn("error", enc)

    def test_3x3_invertibility_and_roundtrip(self):
        # Classic 3x3 invertible key
        # K = [[6, 24, 1], [13, 16, 10], [20, 17, 15]]
        key = [[6, 24, 1], [13, 16, 10], [20, 17, 15]]
        det_val = determinant_3x3(key) % 26
        if math.gcd(det_val, 26) != 1:
            key = generate_invertible_matrix(3)

        is_valid, inv_mat, diag = matrix_inverse_mod26(key)
        self.assertTrue(is_valid)
        self.assertTrue(diag["identity_verified"])

        plaintext = "ACTING"
        enc = hill_transform(plaintext, key, decrypt=False)
        self.assertTrue(enc["success"])

        dec = hill_transform(enc["result"], key, decrypt=True)
        self.assertTrue(dec["success"])
        self.assertEqual(dec["result"], plaintext)

    def test_padding_behavior(self):
        # Text "CAT" with 2x2 key should be padded to 4 chars with 'X'
        blocks, padded, pad_count = prepare_hill_text("CAT", block_size=2, pad_char="X")
        self.assertEqual(padded, "CATX")
        self.assertEqual(pad_count, 1)
        self.assertEqual(blocks, ["CA", "TX"])

    def test_4x4_invertibility_and_roundtrip(self):
        # Invertible 4x4 matrix
        key_4x4 = [[7, 4, 6, 5], [9, 4, 6, 2], [8, 3, 7, 9], [2, 9, 8, 6]]
        is_valid, inv_mat, diag = matrix_inverse_mod26(key_4x4)
        self.assertTrue(is_valid)
        self.assertTrue(diag["identity_verified"])

        plaintext = "TOPSECRETMSG"
        enc = hill_transform(plaintext, key_4x4, decrypt=False)
        self.assertTrue(enc["success"])
        dec = hill_transform(enc["result"], key_4x4, decrypt=True)
        self.assertTrue(dec["success"])
        self.assertEqual(dec["result"], plaintext)

    def test_5x5_invertibility_and_roundtrip(self):
        # Invertible 5x5 matrix
        key_5x5 = [[1, 2, 4, 3, 1], [2, 9, 8, 7, 8], [3, 5, 4, 3, 4], [6, 7, 1, 3, 1], [8, 3, 2, 8, 2]]
        is_valid, inv_mat, diag = matrix_inverse_mod26(key_5x5)
        self.assertTrue(is_valid)
        self.assertTrue(diag["identity_verified"])

        plaintext = "ATTACKATDAWN"  # 12 chars -> padded to 15 chars (3 blocks of 5)
        enc = hill_transform(plaintext, key_5x5, decrypt=False, pad_char="X")
        self.assertTrue(enc["success"])
        self.assertEqual(len(enc["result"]), 15)

        dec = hill_transform(enc["result"], key_5x5, decrypt=True)
        self.assertTrue(dec["success"])
        self.assertEqual(dec["result"], "ATTACKATDAWNXXX")

    def test_arbitrary_nxn_generation(self):
        # Test random generation for dimensions 2, 3, 4, 5
        for dim in [2, 3, 4, 5]:
            mat = generate_invertible_matrix(dim)
            self.assertEqual(len(mat), dim)
            self.assertEqual(len(mat[0]), dim)
            is_valid, _, diag = matrix_inverse_mod26(mat)
            self.assertTrue(is_valid)
            self.assertTrue(diag["identity_verified"])


if __name__ == "__main__":
    unittest.main()
