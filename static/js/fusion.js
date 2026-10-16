/**
 * Cipher Fusion Studio — Frontend Engine
 * Handles multi-cipher cascade pipeline execution (Caesar, Vigenère, Playfair, Hill),
 * dynamic stage reordering, key validation, step-by-step visual journey,
 * and Reversible Package Mode with 100% loss-free round-trip restoration.
 */

(function(global) {
  'use strict';

  // ─── Constants & Reference Baselines ─────────────────────────────────────────
  const DEFAULT_CAESAR_KEY = 3;
  const DEFAULT_VIGENERE_KEY = "LEMON";
  const DEFAULT_PLAYFAIR_KEY = "MONARCHY";
  const DEFAULT_PLAYFAIR_FILLER = "X";
  const DEFAULT_HILL_2X2 = [[3, 3], [2, 5]];
  const DEFAULT_HILL_3X3 = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];

  // ─── Mathematical Primitives ────────────────────────────────────────────────
  function egcd(a, b) {
    if (a === 0) return { gcd: b, x: 0, y: 1 };
    const res = egcd(b % a, a);
    const x = res.y - Math.floor(b / a) * res.x;
    const y = res.x;
    return { gcd: res.gcd, x: x, y: y };
  }

  function modInverse(a, m = 26) {
    const positiveA = ((a % m) + m) % m;
    const res = egcd(positiveA, m);
    if (res.gcd !== 1) return null;
    return ((res.x % m) + m) % m;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  // ─── Caesar Primitive ───────────────────────────────────────────────────────
  function caesarTransform(text, shift, decrypt = false) {
    const s = decrypt ? ((-shift % 26) + 26) % 26 : (shift % 26 + 26) % 26;
    const steps = [];
    const result = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch >= 'A' && ch <= 'Z') {
        const base = 65;
        const inVal = ch.charCodeAt(0) - base;
        const outVal = (inVal + s) % 26;
        const outCh = String.fromCharCode(base + outVal);
        result.push(outCh);
        steps.push({
          index: i,
          charIn: ch,
          valIn: inVal,
          shift: s,
          valOut: outVal,
          charOut: outCh
        });
      } else {
        result.push(ch);
      }
    }
    return { text: result.join(''), steps: steps };
  }

  // ─── Vigenère Primitive ─────────────────────────────────────────────────────
  function vigenereTransform(text, keyword, decrypt = false) {
    let cleanKey = (keyword || "A").toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) cleanKey = "A";

    const steps = [];
    const result = [];
    const keyLen = cleanKey.length;
    let keyIdx = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch >= 'A' && ch <= 'Z') {
        const base = 65;
        const kChar = cleanKey[keyIdx % keyLen];
        const kShift = kChar.charCodeAt(0) - base;
        const s = decrypt ? ((-kShift % 26) + 26) % 26 : (kShift % 26);

        const inVal = ch.charCodeAt(0) - base;
        const outVal = (inVal + s) % 26;
        const outCh = String.fromCharCode(base + outVal);

        result.push(outCh);
        steps.push({
          index: i,
          charIn: ch,
          keyChar: kChar,
          shift: kShift,
          valOut: outVal,
          charOut: outCh
        });
        keyIdx++;
      } else {
        result.push(ch);
      }
    }
    return { text: result.join(''), steps: steps };
  }

  // ─── Playfair Primitives ────────────────────────────────────────────────────
  function generatePlayfairMatrix(keyword) {
    const clean = (keyword || "MONARCHY").toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const seen = new Set();
    const letters = [];

    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      if (!seen.has(ch)) {
        seen.add(ch);
        letters.push(ch);
      }
    }

    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J omitted
    for (let i = 0; i < alphabet.length; i++) {
      const ch = alphabet[i];
      if (!seen.has(ch)) {
        seen.add(ch);
        letters.push(ch);
      }
    }

    const grid = [];
    for (let r = 0; r < 5; r++) {
      grid.push(letters.slice(r * 5, (r + 1) * 5));
    }
    return grid;
  }

  function findMatrixPos(matrix, char) {
    const target = char === 'J' ? 'I' : char;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (matrix[r][c] === target) return { r, c };
      }
    }
    return { r: 0, c: 0 };
  }

  function playfairTransformPair(p1, p2, matrix, decrypt = false) {
    const pos1 = findMatrixPos(matrix, p1);
    const pos2 = findMatrixPos(matrix, p2);
    const shift = decrypt ? 4 : 1; // mod 5 subtraction is +4

    let rule = "";
    let out1 = "", out2 = "";
    let outR1 = 0, outC1 = 0, outR2 = 0, outC2 = 0;

    if (pos1.r === pos2.r) {
      rule = "same_row";
      outR1 = pos1.r;
      outC1 = (pos1.c + shift) % 5;
      outR2 = pos2.r;
      outC2 = (pos2.c + shift) % 5;
      out1 = matrix[outR1][outC1];
      out2 = matrix[outR2][outC2];
    } else if (pos1.c === pos2.c) {
      rule = "same_column";
      outR1 = (pos1.r + shift) % 5;
      outC1 = pos1.c;
      outR2 = (pos2.r + shift) % 5;
      outC2 = pos2.c;
      out1 = matrix[outR1][outC1];
      out2 = matrix[outR2][outC2];
    } else {
      rule = "rectangle";
      outR1 = pos1.r;
      outC1 = pos2.c;
      outR2 = pos2.r;
      outC2 = pos1.c;
      out1 = matrix[outR1][outC1];
      out2 = matrix[outR2][outC2];
    }

    return {
      inPair: [p1, p2],
      outPair: [out1, out2],
      rule: rule,
      coordsIn: [pos1, pos2],
      coordsOut: [{ r: outR1, c: outC1 }, { r: outR2, c: outC2 }]
    };
  }

  function playfairCascade(text, keyword, filler = 'X', decrypt = false) {
    const matrix = generatePlayfairMatrix(keyword);

    if (!decrypt) {
      const jIndices = [];
      for (let idx = 0; idx < text.length; idx++) {
        if (text[idx].toUpperCase() === 'J') jIndices.push(idx);
      }
      const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

      let fillerChar = (filler || 'X').toUpperCase();
      if (fillerChar === 'J') fillerChar = 'I';

      const digraphs = [];
      const insertions = [];
      let cleanIdx = 0;
      let streamLen = 0;

      while (cleanIdx < clean.length) {
        const c1 = clean[cleanIdx];
        if (cleanIdx + 1 < clean.length) {
          const c2 = clean[cleanIdx + 1];
          if (c1 === c2) {
            const f = (c1 === fillerChar) ? 'Q' : fillerChar;
            digraphs.push([c1, f]);
            insertions.push({ index: streamLen + 1, char: f, type: 'duplicate_separator' });
            streamLen += 2;
            cleanIdx += 1;
          } else {
            digraphs.push([c1, c2]);
            streamLen += 2;
            cleanIdx += 2;
          }
        } else {
          const f = (c1 === fillerChar) ? 'Z' : fillerChar;
          digraphs.push([c1, f]);
          insertions.push({ index: streamLen + 1, char: f, type: 'odd_pad' });
          streamLen += 2;
          cleanIdx += 1;
        }
      }

      const steps = [];
      const outChars = [];
      for (let i = 0; i < digraphs.length; i++) {
        const p = digraphs[i];
        const step = playfairTransformPair(p[0], p[1], matrix, false);
        steps.push(step);
        outChars.push(step.outPair[0] + step.outPair[1]);
      }

      return {
        text: outChars.join(''),
        matrix: matrix,
        digraphs: digraphs,
        insertions: insertions,
        jIndices: jIndices,
        steps: steps,
        keyword: keyword
      };
    } else {
      let clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
      if (clean.length % 2 !== 0) clean += 'X';

      const digraphs = [];
      for (let i = 0; i < clean.length; i += 2) {
        digraphs.push([clean[i], clean[i + 1]]);
      }

      const steps = [];
      const outChars = [];
      for (let i = 0; i < digraphs.length; i++) {
        const p = digraphs[i];
        const step = playfairTransformPair(p[0], p[1], matrix, true);
        steps.push(step);
        outChars.push(step.outPair[0] + step.outPair[1]);
      }

      return {
        text: outChars.join(''),
        matrix: matrix,
        digraphs: digraphs,
        steps: steps,
        keyword: keyword
      };
    }
  }

  // ─── Hill Primitives ────────────────────────────────────────────────────────
  function det2x2(m) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  }

  function det3x3(m) {
    const c0 = m[1][1] * m[2][2] - m[1][2] * m[2][1];
    const c1 = m[1][0] * m[2][2] - m[1][2] * m[2][0];
    const c2 = m[1][0] * m[2][1] - m[1][1] * m[2][0];
    return m[0][0] * c0 - m[0][1] * c1 + m[0][2] * c2;
  }

  function calcDet(m) {
    return m.length === 2 ? det2x2(m) : det3x3(m);
  }

  function adjugate2x2(m) {
    return [
      [((m[1][1] % 26) + 26) % 26, ((-m[0][1] % 26) + 26) % 26],
      [((-m[1][0] % 26) + 26) % 26, ((m[0][0] % 26) + 26) % 26]
    ];
  }

  function adjugate3x3(m) {
    const adj = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const minor = [];
        for (let i = 0; i < 3; i++) {
          if (i === r) continue;
          const row = [];
          for (let j = 0; j < 3; j++) {
            if (j === c) continue;
            row.push(m[i][j]);
          }
          minor.push(row);
        }
        const detMinor = det2x2(minor);
        const cofactor = Math.pow(-1, r + c) * detMinor;
        adj[c][r] = ((cofactor % 26) + 26) % 26; // transpose
      }
    }
    return adj;
  }

  function computeMatrixInverse(m) {
    const n = m.length;
    const rawDet = calcDet(m);
    const modDet = ((rawDet % 26) + 26) % 26;
    const g = gcd(modDet, 26);
    const detInv = modInverse(modDet, 26);

    const diag = {
      dimension: n,
      rawDet: rawDet,
      modDet: modDet,
      gcd: g,
      detInv: detInv,
      isInvertible: (g === 1 && detInv !== null)
    };

    if (g !== 1 || detInv === null) {
      diag.errorReason = `Determinant mod 26 is ${modDet}. gcd(${modDet}, 26) = ${g} ≠ 1 (Not invertible modulo 26).`;
      return { isValid: false, inverse: null, diag: diag };
    }

    const adj = n === 2 ? adjugate2x2(m) : adjugate3x3(m);
    const inv = [];
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) {
        row.push((detInv * adj[r][c]) % 26);
      }
      inv.push(row);
    }

    diag.adjugate = adj;
    diag.inverse = inv;
    return { isValid: true, inverse: inv, diag: diag };
  }

  function generateRandomInvertibleHill(n = 2) {
    while (true) {
      const candidate = [];
      for (let r = 0; r < n; r++) {
        const row = [];
        for (let c = 0; c < n; c++) {
          row.push(Math.floor(Math.random() * 26));
        }
        candidate.push(row);
      }
      const rawDet = calcDet(candidate);
      const modDet = ((rawDet % 26) + 26) % 26;
      if (gcd(modDet, 26) === 1) {
        return candidate;
      }
    }
  }

  function hillCascade(text, matrix, decrypt = false, padChar = 'X') {
    const n = matrix.length;
    const invCheck = computeMatrixInverse(matrix);
    if (!invCheck.isValid || !invCheck.inverse) {
      throw new Error(invCheck.diag.errorReason || "Hill matrix is not invertible modulo 26.");
    }

    const activeMatrix = decrypt ? invCheck.inverse : matrix;
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');

    const remainder = clean.length % n;
    const padCount = remainder === 0 ? 0 : (n - remainder);
    const padCharacter = (padChar || 'X').toUpperCase();
    const padded = clean + padCharacter.repeat(padCount);

    const blocks = [];
    for (let i = 0; i < padded.length; i += n) {
      blocks.push(padded.slice(i, i + n));
    }

    const steps = [];
    const outputChars = [];

    for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
      const block = blocks[bIdx];
      const pVec = [];
      for (let i = 0; i < block.length; i++) {
        pVec.push(block.charCodeAt(i) - 65);
      }

      const cVec = [];
      const breakdown = [];

      for (let r = 0; r < n; r++) {
        let rowSum = 0;
        const terms = [];
        for (let c = 0; c < n; c++) {
          const kVal = ((activeMatrix[r][c] % 26) + 26) % 26;
          const pVal = pVec[c];
          rowSum += kVal * pVal;
          terms.push(`(${kVal} × ${pVal})`);
        }
        const cVal = rowSum % 26;
        cVec.push(cVal);
        breakdown.push({
          row: r,
          expr: terms.join(' + '),
          sum: rowSum,
          mod26: cVal,
          char: String.fromCharCode(65 + cVal)
        });
      }

      const outBlock = cVec.map(v => String.fromCharCode(65 + v)).join('');
      outputChars.push(outBlock);

      steps.push({
        blockIndex: bIdx,
        inputBlock: block,
        inputVector: pVec,
        outputVector: cVec,
        outputBlock: outBlock,
        breakdown: breakdown
      });
    }

    return {
      text: outputChars.join(''),
      inputBlocks: blocks,
      padCount: padCount,
      inverseMatrix: invCheck.inverse,
      steps: steps
    };
  }

  // ─── Metadata Normalization & Reversible Restoration ────────────────────────
  function extractMetadata(text) {
    const cleanChars = [];
    const caseMask = [];
    const formattingTokens = [];

    let cleanPos = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
        cleanChars.push(ch.toUpperCase());
        caseMask.push(ch >= 'A' && ch <= 'Z' ? 1 : 0);
        cleanPos++;
      } else {
        formattingTokens.push({ pos: i, char: ch });
      }
    }

    return {
      clean: cleanChars.join(''),
      metadata: {
        originalLength: text.length,
        cleanLength: cleanChars.length,
        caseMask: caseMask,
        formattingTokens: formattingTokens,
        stageMetadata: {}
      }
    };
  }

  function restoreMetadata(cleanDecrypted, metadata) {
    const chars = cleanDecrypted.split('');

    // Restore case
    const caseMask = metadata.caseMask || [];
    for (let i = 0; i < Math.min(chars.length, caseMask.length); i++) {
      if (caseMask[i] === 0) {
        chars[i] = chars[i].toLowerCase();
      }
    }

    // Restore formatting (spaces, punctuation)
    const tokens = metadata.formattingTokens || [];
    const tokenMap = {};
    for (let i = 0; i < tokens.length; i++) {
      tokenMap[tokens[i].pos] = tokens[i].char;
    }

    const totalLen = metadata.originalLength || (chars.length + tokens.length);
    const result = [];
    let charPtr = 0;

    for (let pos = 0; pos < totalLen; pos++) {
      if (tokenMap[pos] !== undefined) {
        result.push(tokenMap[pos]);
      } else if (charPtr < chars.length) {
        result.push(chars[charPtr]);
        charPtr++;
      }
    }

    return result.join('');
  }

  // ─── Pipeline Validation ────────────────────────────────────────────────────
  function validatePipeline(pipeline) {
    const errors = [];
    const warnings = [];
    const active = pipeline.filter(s => s.enabled !== false);

    if (active.length === 0) {
      errors.push("At least one cipher stage must be enabled in the pipeline.");
    }

    active.forEach((stage, idx) => {
      const id = stage.id;
      const key = stage.key || {};

      if (id === 'caesar') {
        const shift = parseInt(key.shift, 10);
        if (isNaN(shift)) errors.push(`Stage ${idx + 1} (Caesar): Shift must be an integer (0-25).`);
      } else if (id === 'vigenere') {
        const kw = (key.keyword || "").replace(/[^A-Za-z]/g, '');
        if (!kw) errors.push(`Stage ${idx + 1} (Vigenère): Keyword must contain at least one letter.`);
      } else if (id === 'playfair') {
        const kw = (key.keyword || "").replace(/[^A-Za-z]/g, '');
        if (!kw) errors.push(`Stage ${idx + 1} (Playfair): Keyword must contain at least one letter.`);
      } else if (id === 'hill') {
        const mat = key.matrix;
        if (!mat || !Array.isArray(mat) || (mat.length !== 2 && mat.length !== 3)) {
          errors.push(`Stage ${idx + 1} (Hill): Matrix must be 2×2 or 3×3.`);
        } else {
          const inv = computeMatrixInverse(mat);
          if (!inv.isValid) {
            errors.push(`Stage ${idx + 1} (Hill): ${inv.diag.errorReason}`);
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  // ─── Sequential Cascade Engine: Encrypt ──────────────────────────────────────
  function runFusionEncrypt(plaintext, pipeline, mode = 'classic') {
    const val = validatePipeline(pipeline);
    if (!val.isValid) {
      return { success: false, error: val.errors.join(' ') };
    }

    const norm = extractMetadata(plaintext);
    if (!norm.clean) {
      return { success: false, error: "Input text contains no alphabetic characters to encrypt." };
    }

    let current = norm.clean;
    const stagesTelemetry = [];
    const stageMetadata = {};

    for (let stageIdx = 0; stageIdx < pipeline.length; stageIdx++) {
      const stage = pipeline[stageIdx];
      if (stage.enabled === false) continue;

      const id = stage.id;
      const key = stage.key || {};
      const stageName = stage.name || id.toUpperCase();
      const inputForStage = current;

      if (id === 'caesar') {
        const shift = parseInt(key.shift, 10) || DEFAULT_CAESAR_KEY;
        const res = caesarTransform(inputForStage, shift, false);
        stagesTelemetry.push({
          id: id,
          name: stageName,
          input: inputForStage,
          output: res.text,
          keyUsed: { shift: shift },
          explanation: `Shifted ${inputForStage.length} letters by +${shift} modulo 26.`,
          steps: res.steps
        });
        current = res.text;
      } else if (id === 'vigenere') {
        const kw = key.keyword || DEFAULT_VIGENERE_KEY;
        const res = vigenereTransform(inputForStage, kw, false);
        stagesTelemetry.push({
          id: id,
          name: stageName,
          input: inputForStage,
          output: res.text,
          keyUsed: { keyword: kw },
          explanation: `Applied polyalphabetic substitution using keyword "${kw}".`,
          steps: res.steps
        });
        current = res.text;
      } else if (id === 'playfair') {
        const kw = key.keyword || DEFAULT_PLAYFAIR_KEY;
        const filler = key.filler || DEFAULT_PLAYFAIR_FILLER;
        const res = playfairCascade(inputForStage, kw, filler, false);

        stageMetadata[`stage_${stageIdx}_playfair`] = {
          insertions: res.insertions,
          jIndices: res.jIndices
        };

        stagesTelemetry.push({
          id: id,
          name: stageName,
          input: inputForStage,
          output: res.text,
          keyUsed: { keyword: kw, filler: filler },
          matrix: res.matrix,
          digraphs: res.digraphs,
          insertions: res.insertions,
          explanation: `Created ${res.digraphs.length} digraphs and transformed using 5×5 key matrix.`,
          steps: res.steps
        });
        current = res.text;
      } else if (id === 'hill') {
        const mat = key.matrix || DEFAULT_HILL_2X2;
        const padChar = key.padChar || 'X';
        const res = hillCascade(inputForStage, mat, false, padChar);

        stageMetadata[`stage_${stageIdx}_hill`] = {
          padCount: res.padCount,
          padChar: padChar
        };

        stagesTelemetry.push({
          id: id,
          name: stageName,
          input: inputForStage,
          output: res.text,
          keyUsed: { matrix: mat, dimension: mat.length },
          inverseMatrix: res.inverseMatrix,
          padCount: res.padCount,
          blocks: res.inputBlocks,
          explanation: `Multiplied ${res.steps.length} vector blocks by ${mat.length}×${mat.length} matrix modulo 26.`,
          steps: res.steps
        });
        current = res.text;
      }
    }

    norm.metadata.stageMetadata = stageMetadata;

    const packageEnvelope = {
      version: "1.0",
      format: "cipher_fusion_package",
      mode: mode,
      ciphertext: current,
      pipelineSequence: pipeline.filter(s => s.enabled !== false).map(s => s.id),
      metadata: norm.metadata
    };

    return {
      success: true,
      mode: mode,
      originalInput: plaintext,
      normalizedInput: norm.clean,
      finalCiphertext: current,
      finalCiphertextSpaced: current.match(/.{1,4}/g)?.join(' ') || current,
      stages: stagesTelemetry,
      packageEnvelope: packageEnvelope,
      metadata: norm.metadata
    };
  }

  // ─── Sequential Cascade Engine: Decrypt ──────────────────────────────────────
  function runFusionDecrypt(ciphertext, pipeline, mode = 'classic', packageMetadata = null) {
    const val = validatePipeline(pipeline);
    if (!val.isValid) {
      return { success: false, error: val.errors.join(' ') };
    }

    const clean = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    if (!clean) {
      return { success: false, error: "Ciphertext contains no alphabetic characters to decrypt." };
    }

    const activeWithIndices = [];
    for (let i = 0; i < pipeline.length; i++) {
      if (pipeline[i].enabled !== false) {
        activeWithIndices.push({ origIdx: i, stage: JSON.parse(JSON.stringify(pipeline[i])) });
      }
    }
    const reverseStages = activeWithIndices.slice().reverse();

    let current = clean;
    const stagesTelemetry = [];
    const stMeta = (mode === 'reversible' && packageMetadata) ? (packageMetadata.stageMetadata || {}) : {};

    for (let rIdx = 0; rIdx < reverseStages.length; rIdx++) {
      const item = reverseStages[rIdx];
      const stage = item.stage;
      const origStageIdx = item.origIdx;
      const id = stage.id;
      const key = stage.key || {};
      const stageName = stage.name || id.toUpperCase();
      const inputForStage = current;

      if (id === 'hill') {
        const mat = key.matrix || DEFAULT_HILL_2X2;
        const padChar = key.padChar || 'X';
        const res = hillCascade(inputForStage, mat, true, padChar);
        let outText = res.text;

        const hillMetaKey = `stage_${origStageIdx}_hill`;
        if (mode === 'reversible' && stMeta[hillMetaKey]) {
          const padCnt = stMeta[hillMetaKey].padCount || 0;
          if (padCnt > 0 && outText.length >= padCnt) {
            outText = outText.slice(0, outText.length - padCnt);
          }
        }

        stagesTelemetry.push({
          id: id,
          name: `${stageName} (Inverse)`,
          input: inputForStage,
          output: outText,
          keyUsed: { matrix: mat, inverse: res.inverseMatrix },
          explanation: `Multiplied ${res.steps.length} blocks by inverse key matrix modulo 26.`,
          steps: res.steps
        });
        current = outText;
      } else if (id === 'playfair') {
        const kw = key.keyword || DEFAULT_PLAYFAIR_KEY;
        const res = playfairCascade(inputForStage, kw, 'X', true);
        let outText = res.text;

        const pfMetaKey = `stage_${origStageIdx}_playfair`;
        if (mode === 'reversible' && stMeta[pfMetaKey]) {
          const pfData = stMeta[pfMetaKey];
          const insertions = pfData.insertions || [];
          const jIndices = pfData.jIndices || [];

          const chars = outText.split('');
          const sortedIns = insertions.slice().sort((a, b) => b.index - a.index);
          for (let k = 0; k < sortedIns.length; k++) {
            const idx = sortedIns[k].index;
            if (idx < chars.length) chars.splice(idx, 1);
          }
          for (let k = 0; k < jIndices.length; k++) {
            const jIdx = jIndices[k];
            if (jIdx < chars.length && chars[jIdx] === 'I') chars[jIdx] = 'J';
          }
          outText = chars.join('');
        }

        stagesTelemetry.push({
          id: id,
          name: `${stageName} (Inverse)`,
          input: inputForStage,
          output: outText,
          keyUsed: { keyword: kw },
          matrix: res.matrix,
          digraphs: res.digraphs,
          explanation: `Reversed Playfair digraph transformations with inverse shift rules.`,
          steps: res.steps
        });
        current = outText;
      } else if (id === 'vigenere') {
        const kw = key.keyword || DEFAULT_VIGENERE_KEY;
        const res = vigenereTransform(inputForStage, kw, true);
        stagesTelemetry.push({
          id: id,
          name: `${stageName} (Inverse)`,
          input: inputForStage,
          output: res.text,
          keyUsed: { keyword: kw },
          explanation: `Subtracted repeating keyword shifts modulo 26.`,
          steps: res.steps
        });
        current = res.text;
      } else if (id === 'caesar') {
        const shift = parseInt(key.shift, 10) || DEFAULT_CAESAR_KEY;
        const res = caesarTransform(inputForStage, shift, true);
        stagesTelemetry.push({
          id: id,
          name: `${stageName} (Inverse)`,
          input: inputForStage,
          output: res.text,
          keyUsed: { shift: shift },
          explanation: `Shifted letters backwards by -${shift} modulo 26.`,
          steps: res.steps
        });
        current = res.text;
      }
    }

    let finalPlaintext = current;
    let restoredFormatted = null;

    if (mode === 'reversible' && packageMetadata) {
      try {
        restoredFormatted = restoreMetadata(current, packageMetadata);
        finalPlaintext = restoredFormatted;
      } catch (e) {
        finalPlaintext = current;
      }
    }

    return {
      success: true,
      mode: mode,
      inputCiphertext: ciphertext,
      decryptedRaw: current,
      finalPlaintext: finalPlaintext,
      restoredFormatted: restoredFormatted,
      stages: stagesTelemetry,
      executionOrder: reverseStages.map(item => item.stage.id)
    };
  }

  // ─── Export to Global Scope ─────────────────────────────────────────────────
  global.CipherFusion = {
    getDefaultPipeline: function() {
      return [
        { id: "caesar", name: "Caesar Cipher", enabled: true, key: { shift: DEFAULT_CAESAR_KEY } },
        { id: "vigenere", name: "Vigenère Cipher", enabled: true, key: { keyword: DEFAULT_VIGENERE_KEY } },
        { id: "playfair", name: "Playfair Cipher", enabled: true, key: { keyword: DEFAULT_PLAYFAIR_KEY, filler: DEFAULT_PLAYFAIR_FILLER } },
        { id: "hill", name: "Hill Cipher", enabled: true, key: { dimension: 2, matrix: JSON.parse(JSON.stringify(DEFAULT_HILL_2X2)), padChar: "X" } }
      ];
    },
    validatePipeline: validatePipeline,
    encrypt: runFusionEncrypt,
    decrypt: runFusionDecrypt,
    computeMatrixInverse: computeMatrixInverse,
    generateRandomInvertibleHill: generateRandomInvertibleHill,
    generatePlayfairMatrix: generatePlayfairMatrix
  };

})(typeof window !== 'undefined' ? window : this);
