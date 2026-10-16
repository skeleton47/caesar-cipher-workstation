"""
Cipher Fusion Comprehensive Test Suite
Tests:
- Individual cipher components
- Sequential cascade execution: E4(E3(E2(E1(P))))
- Order reversibility: D1(D2(D3(D4(C))))
- Custom stage ordering & bypass toggles
- Classic Mode vs Reversible Package Mode
- Hill key invertibility validation
- Playfair duplicate separation & odd padding
- Reference cryptographic vectors
- Round-trip fidelity
"""

import unittest
import copy
import crypto_fusion
import crypto_playfair
import crypto_hill


class TestCipherFusionEngine(unittest.TestCase):

    def setUp(self):
        self.default_pipeline = crypto_fusion.get_default_pipeline_config()

    def test_default_pipeline_structure(self):
        """Test default pipeline contains Caesar, Vigenere, Playfair, Hill in order."""
        ids = [stage["id"] for stage in self.default_pipeline]
        self.assertEqual(ids, ["caesar", "vigenere", "playfair", "hill"])
        for stage in self.default_pipeline:
            self.assertTrue(stage["enabled"])

    def test_caesar_component(self):
        """Test Caesar transformation independent component."""
        text = "HELLOWORLD"
        enc, steps = crypto_fusion.caesar_transform(text, shift=3, decrypt=False)
        self.assertEqual(enc, "KHOORZRUOG")
        dec, _ = crypto_fusion.caesar_transform(enc, shift=3, decrypt=True)
        self.assertEqual(dec, text)

    def test_vigenere_component(self):
        """Test Vigenere transformation with reference vector."""
        text = "ATTACKATDAWN"
        key = "LEMON"
        enc, _ = crypto_fusion.vigenere_transform(text, key, decrypt=False)
        self.assertEqual(enc, "LXFOPVEFRNHR")
        dec, _ = crypto_fusion.vigenere_transform(enc, key, decrypt=True)
        self.assertEqual(dec, text)

    def test_playfair_component(self):
        """Test Playfair cascade transform and duplicate insertion."""
        # BALLOON has double L -> BALXLOON
        keyword = "MONARCHY"
        enc, info = crypto_fusion.playfair_transform_cascade("BALLOON", keyword, filler="X", decrypt=False)
        self.assertTrue(len(enc) >= 8)
        self.assertTrue(len(info["insertions"]) > 0)
        dec, _ = crypto_fusion.playfair_transform_cascade(enc, keyword, decrypt=True)
        # Decrypted raw should contain the filler X between L's
        self.assertIn("LXL", dec)

    def test_hill_component(self):
        """Test Hill 2x2 modular matrix multiplication and inversion."""
        matrix = [[3, 3], [2, 5]]
        text = "HELP"
        enc, info = crypto_fusion.hill_transform_cascade(text, matrix, decrypt=False)
        dec, _ = crypto_fusion.hill_transform_cascade(enc, matrix, decrypt=True)
        self.assertEqual(dec[:4], "HELP")

    def test_cascade_sequential_data_flow(self):
        """
        Critical Rule: Verify each stage receives the output of the preceding stage,
        never the original plaintext directly.
        """
        text = "SECRET"
        res = crypto_fusion.fusion_encrypt(text, self.default_pipeline)
        self.assertTrue(res["success"])

        stages = res["stages"]
        self.assertEqual(len(stages), 4)

        # Stage 1 input is normalized plaintext
        self.assertEqual(stages[0]["input"], "SECRET")
        # Stage 2 input must match Stage 1 output
        self.assertEqual(stages[1]["input"], stages[0]["output"])
        # Stage 3 input must match Stage 2 output
        self.assertEqual(stages[2]["input"], stages[1]["output"])
        # Stage 4 input must match Stage 3 output
        self.assertEqual(stages[3]["input"], stages[2]["output"])
        # Final ciphertext must match Stage 4 output
        self.assertEqual(res["final_ciphertext"], stages[3]["output"])

    def test_reverse_decryption_order(self):
        """
        Verify decryption executes in the exact reverse order:
        Hill (Inverse) -> Playfair (Inverse) -> Vigenere (Inverse) -> Caesar (Inverse).
        """
        text = "CRYPTO"
        enc_res = crypto_fusion.fusion_encrypt(text, self.default_pipeline)
        dec_res = crypto_fusion.fusion_decrypt(enc_res["final_ciphertext"], self.default_pipeline)

        self.assertTrue(dec_res["success"])
        dec_stages = dec_res["stages"]
        self.assertEqual(len(dec_stages), 4)

        self.assertEqual(dec_stages[0]["id"], "hill")
        self.assertEqual(dec_stages[1]["id"], "playfair")
        self.assertEqual(dec_stages[2]["id"], "vigenere")
        self.assertEqual(dec_stages[3]["id"], "caesar")

        self.assertEqual(dec_stages[1]["input"], dec_stages[0]["output"])
        self.assertEqual(dec_stages[2]["input"], dec_stages[1]["output"])
        self.assertEqual(dec_stages[3]["input"], dec_stages[2]["output"])

    def test_reversible_package_mode_round_trip(self):
        """
        Test Reversible Package Mode restores 100% exact plaintext with
        spaces, numbers, punctuation, casing, and 'J' characters restored.
        """
        original = "Julius Caesar said: 'Attack at Dawn!' (Year 2026)"
        enc_res = crypto_fusion.fusion_encrypt(original, self.default_pipeline, mode="reversible")
        self.assertTrue(enc_res["success"])

        pkg = enc_res["reversible_package"]
        # Package must NOT contain secrets or plaintext
        self.assertNotIn("plaintext", pkg)
        self.assertNotIn("shift", pkg["metadata"])
        self.assertNotIn("keyword", pkg["metadata"])

        dec_res = crypto_fusion.fusion_decrypt(
            pkg["ciphertext"],
            self.default_pipeline,
            mode="reversible",
            package_metadata=pkg["metadata"]
        )

        self.assertTrue(dec_res["success"])
        self.assertEqual(dec_res["final_plaintext"], original)

    def test_custom_stage_reordering(self):
        """
        Test pipeline works with non-default ordering (e.g. Hill -> Vigenere -> Caesar -> Playfair).
        """
        custom_pipeline = [
            self.default_pipeline[3],  # Hill
            self.default_pipeline[1],  # Vigenere
            self.default_pipeline[0],  # Caesar
            self.default_pipeline[2],  # Playfair
        ]

        text = "ORDERTEST"
        enc = crypto_fusion.fusion_encrypt(text, custom_pipeline, mode="reversible")
        self.assertTrue(enc["success"])
        self.assertEqual([s["id"] for s in enc["stages"]], ["hill", "vigenere", "caesar", "playfair"])

        dec = crypto_fusion.fusion_decrypt(
            enc["final_ciphertext"],
            custom_pipeline,
            mode="reversible",
            package_metadata=enc["metadata"]
        )
        self.assertTrue(dec["success"])
        self.assertEqual(dec["final_plaintext"], text)

    def test_bypassing_stages(self):
        """
        Test pipeline when one or more stages are disabled (e.g. only Caesar and Hill enabled).
        """
        pipeline = copy.deepcopy(self.default_pipeline)
        pipeline[1]["enabled"] = False  # disable Vigenere
        pipeline[2]["enabled"] = False  # disable Playfair

        text = "BYPASSME"
        enc = crypto_fusion.fusion_encrypt(text, pipeline, mode="reversible")
        self.assertEqual(len(enc["stages"]), 2)
        self.assertEqual([s["id"] for s in enc["stages"]], ["caesar", "hill"])

        dec = crypto_fusion.fusion_decrypt(
            enc["final_ciphertext"],
            pipeline,
            mode="reversible",
            package_metadata=enc["metadata"]
        )
        self.assertEqual(dec["final_plaintext"], text)

    def test_invalid_hill_key_handling(self):
        """Test pipeline validation flags non-invertible Hill matrices."""
        invalid_pipeline = copy.deepcopy(self.default_pipeline)
        invalid_pipeline[3]["key"]["matrix"] = [[2, 4], [4, 8]]  # det = 0, not invertible

        val = crypto_fusion.validate_pipeline(invalid_pipeline)
        self.assertFalse(val["valid"])
        self.assertTrue(any("Hill" in err for err in val["errors"]))

        # Attempting encryption fails gracefully without producing misleading ciphertext
        res = crypto_fusion.fusion_encrypt("FAILTEST", invalid_pipeline)
        self.assertFalse(res["success"])
        self.assertIn("validation failed", res["error"])

    def test_empty_input_handling(self):
        """Test empty or symbol-only input does not crash."""
        res = crypto_fusion.fusion_encrypt("   1234 !! ??  ", self.default_pipeline)
        self.assertFalse(res["success"])
        self.assertIn("no alphabetic characters", res["error"])


if __name__ == '__main__':
    unittest.main()
