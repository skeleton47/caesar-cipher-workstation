/* ==========================================================================
   WIREFRAME 3D HEAD RENDERER
   Renders a rotating 3D low-poly humanoid mesh with a censor bar on canvas
   ========================================================================== */

(function () {
    const canvas = document.getElementById('wireframe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.parentElement.clientWidth || 320;
    let height = canvas.height = 360;

    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth || 320;
        height = canvas.height = 360;
    });

    // ─── Generate 3D Humanoid Head Geometry ──────────────────────────────────
    // Rings of vertices along the Y axis representing the head anatomy
    const rawVertices = [];
    const edges = [];

    // Layer 0: Crown (top of skull)
    rawVertices.push([0, -110, 0]); // 0: peak

    // Layer 1: Cranium upper ring (y = -85)
    const r1 = 52;
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        rawVertices.push([Math.cos(a) * r1, -85, Math.sin(a) * (r1 * 1.15)]);
    }

    // Layer 2: Forehead ring (y = -50)
    const r2 = 62;
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        rawVertices.push([Math.cos(a) * r2, -50, Math.sin(a) * (r2 * 1.18)]);
    }

    // Layer 3: Eyes / Temple ring (y = -20)
    const r3 = 64;
    for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const zScale = Math.sin(a) > 0 ? 1.25 : 1.05; // nose bridge protrudes
        rawVertices.push([Math.cos(a) * r3, -20, Math.sin(a) * (r3 * zScale)]);
    }

    // Layer 4: Cheekbones / Upper nose (y = 10)
    const r4 = 58;
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const zScale = Math.sin(a) > 0 ? 1.3 : 1.0;
        rawVertices.push([Math.cos(a) * r4, 10, Math.sin(a) * (r4 * zScale)]);
    }

    // Layer 5: Mouth / Jawline ring (y = 45)
    const r5 = 46;
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const zScale = Math.sin(a) > 0 ? 1.2 : 0.95;
        rawVertices.push([Math.cos(a) * r5, 45, Math.sin(a) * (r5 * zScale)]);
    }

    // Layer 6: Chin / Jaw bottom (y = 80)
    const r6 = 30;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const zScale = Math.sin(a) > 0 ? 1.15 : 0.9;
        rawVertices.push([Math.cos(a) * r6, 80, Math.sin(a) * (r6 * zScale)]);
    }

    // Layer 7: Chin tip
    rawVertices.push([0, 105, 25]); // Chin point
    // Layer 8: Neck base
    rawVertices.push([0, 120, -10]);

    // ─── Build Wireframe Edges ───────────────────────────────────────────────
    // Connect peak to layer 1
    for (let i = 1; i <= 10; i++) {
        edges.push([0, i]);
        edges.push([i, i === 10 ? 1 : i + 1]); // ring edge
    }

    // Helper to connect ring A to ring B
    function connectRings(startA, countA, startB, countB) {
        for (let i = 0; i < countA; i++) {
            const idxA = startA + i;
            const nextA = startA + (i + 1) % countA;
            edges.push([idxA, nextA]); // Ring edge

            // Connect to nearest on ring B
            const ratio = i / countA;
            const idxB = startB + Math.floor(ratio * countB);
            edges.push([idxA, idxB]);
            const nextB = startB + (Math.floor(ratio * countB) + 1) % countB;
            edges.push([idxA, nextB]);
        }
        for (let j = 0; j < countB; j++) {
            edges.push([startB + j, startB + (j + 1) % countB]);
        }
    }

    connectRings(1, 10, 11, 12);
    connectRings(11, 12, 23, 14);
    connectRings(23, 14, 37, 12);
    connectRings(37, 12, 49, 10);
    connectRings(49, 10, 59, 8);

    // Connect to chin
    const chinIdx = rawVertices.length - 2;
    for (let k = 59; k < 59 + 8; k++) {
        edges.push([k, chinIdx]);
    }

    // ─── Rotation & Animation Engine ─────────────────────────────────────────
    let angleY = 0.3;
    let angleX = -0.12;
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / width - 0.5) * 1.5;
        mouseY = ((e.clientY - rect.top) / height - 0.5) * 0.8;
        isHovered = true;
    });

    canvas.addEventListener('mouseleave', () => {
        isHovered = false;
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Rotation angles
        if (!isHovered) {
            angleY += 0.012;
        } else {
            angleY += (mouseX - angleY) * 0.08 + 0.005;
            angleX += (mouseY - angleX) * 0.08;
        }

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        const fov = 340;
        const cx = width / 2;
        const cy = height / 2 - 10;

        // Project vertices
        const projected = rawVertices.map(v => {
            // Rotate Y
            let x1 = v[0] * cosY + v[2] * sinY;
            let y1 = v[1];
            let z1 = -v[0] * sinY + v[2] * cosY;

            // Rotate X
            let y2 = y1 * cosX - z1 * sinX;
            let z2 = y1 * sinX + z1 * cosX;

            const scale = fov / (fov + z2 + 220);
            return {
                x: x1 * scale + cx,
                y: y2 * scale + cy,
                z: z2,
                scale: scale
            };
        });

        const isNeo = document.body.classList.contains('neo-brutalist-theme');

        // Draw wireframe lines
        ctx.strokeStyle = isNeo ? '#000000' : 'rgba(238, 233, 220, 0.45)';
        ctx.lineWidth = isNeo ? 1.4 : 1;

        ctx.beginPath();
        edges.forEach(([i, j]) => {
            const p1 = projected[i];
            const p2 = projected[j];
            if (p1 && p2) {
                // Back-face line dimming
                if (p1.z > 40 && p2.z > 40) {
                    return; // skip far back lines for cleaner mesh
                }
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
        });
        ctx.stroke();

        // Draw node vertices
        if (isNeo) {
            projected.forEach(p => {
                if (p.z < 30) {
                    ctx.fillStyle = (p.z < 0) ? '#00C2CB' : '#FF00FF'; // Teal & Magenta nodes!
                    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
                }
            });
        } else {
            ctx.fillStyle = 'rgba(238, 233, 220, 0.7)';
            projected.forEach(p => {
                if (p.z < 30) {
                    ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
                }
            });
        }

        // ─── ICONIC CENSOR RECTANGLE ACROSS EYE REGION ─────────────────────────
        const eyeRef = projected[23] || { x: cx, y: cy - 25 };
        const boxWidth = width * 0.7;
        const boxHeight = 44;
        const boxX = cx - boxWidth / 2;
        const boxY = eyeRef.y - boxHeight / 2;

        const shiftVal = document.getElementById('shift-value');
        const shiftStr = shiftVal ? String(shiftVal.value).padStart(2, '0') : '03';

        if (isNeo) {
            // Neo-Brutalist: Solid black box, 3px cyan border, yellow bold text
            ctx.fillStyle = '#000000';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            ctx.strokeStyle = '#00C2CB';
            ctx.lineWidth = 3;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 11px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`[NEO-SYSTEM // ROT-${shiftStr}]`, cx, boxY + boxHeight / 2);
        } else {
            // Cyber Noir: Black box, crimson border, off-white text
            ctx.fillStyle = '#0c0d11';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            ctx.strokeStyle = '#ff2442';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = '#eee9dc';
            ctx.font = '10px "Chakra Petch", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`[IDENTITY_LOCKED // ROT-${shiftStr}]`, cx, boxY + boxHeight / 2);
        }

        requestAnimationFrame(render);
    }

    render();
})();
