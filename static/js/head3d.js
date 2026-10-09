/* ==========================================================================
   CIPHER_OS // 3D WIREFRAME CYBERNETIC HEAD ENGINE
   High-Fidelity 3D Mathematical Mesh Renderer with Perspective Projection,
   Interactive Mouse Parallax, Censor Bar, and Forensic Laser Scan
   Zero external dependencies — 100% Pure Canvas 2D API
   ========================================================================== */

(function () {
    function init3DHead() {
        const canvas = document.getElementById('head-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Retina display scaling
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = 260;
        const displayHeight = 310;
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        // ─── Generate 3D Head Mesh Geometry ─────────────────────────────────
        const vertices = [];
        const edges = [];
        const rings = 15;
        const segments = 16;

        for (let r = 0; r <= rings; r++) {
            const v = r / rings; // 0.0 (top cranium) to 1.0 (chin)
            // Height range: -115 to +115
            const y = -110 + v * 220;

            // Radius profile: cranium sphere tapering into human jawline & chin
            let radius = Math.sin(v * Math.PI) * 78;
            if (v > 0.58) {
                // Jawline taper towards chin
                radius *= (1 - (v - 0.58) * 1.25);
            }

            const ringStart = vertices.length;

            for (let s = 0; s < segments; s++) {
                const u = (s / segments) * Math.PI * 2;
                let z = Math.cos(u) * radius;
                let x = Math.sin(u) * radius * 0.96;

                // Human head depth ratio: cranial elongation along z-axis
                if (z < 0) {
                    z *= 1.15; // occipital lobe curvature
                } else {
                    z *= 0.95; // facial flatness
                }

                // Sculpting facial anatomy:
                // 1. Eye sockets depression (v between 0.36 and 0.44)
                if (v >= 0.36 && v <= 0.44 && z > 0 && Math.abs(x) > 12 && Math.abs(x) < 40) {
                    z -= 6;
                }

                // 2. Nose bridge protrusion (v between 0.40 and 0.58)
                if (v >= 0.40 && v <= 0.58 && z > 0 && Math.abs(x) < 20) {
                    const noseProtrusion = (1 - Math.abs(x) / 20) * 18 * Math.sin(((v - 0.40) / 0.18) * Math.PI);
                    z += noseProtrusion;
                }

                // 3. Mouth & lips (v between 0.65 and 0.74)
                if (v >= 0.65 && v <= 0.74 && z > 0 && Math.abs(x) < 26) {
                    z += (1 - Math.abs(x) / 26) * 6;
                }

                vertices.push({ x, y, z });

                // Connect circumferential edges in ring
                if (s > 0) {
                    edges.push([ringStart + s - 1, ringStart + s]);
                }
                if (s === segments - 1) {
                    edges.push([ringStart + s, ringStart]);
                }

                // Connect longitudinal edges between rings + diagonal triangles
                if (r > 0) {
                    const prevRingStart = ringStart - segments;
                    edges.push([prevRingStart + s, ringStart + s]);
                    edges.push([prevRingStart + s, ringStart + ((s + 1) % segments)]);
                }
            }
        }

        // Additional contouring lines for ears
        const leftEar = [
            { x: -74, y: -8, z: -10 },
            { x: -84, y: 10, z: -15 },
            { x: -82, y: 32, z: -12 },
            { x: -72, y: 36, z: -5 }
        ];
        const rightEar = [
            { x: 74, y: -8, z: -10 },
            { x: 84, y: 10, z: -15 },
            { x: 82, y: 32, z: -12 },
            { x: 72, y: 36, z: -5 }
        ];
        function addContour(pts) {
            const startIdx = vertices.length;
            pts.forEach(p => vertices.push(p));
            for (let i = 0; i < pts.length - 1; i++) {
                edges.push([startIdx + i, startIdx + i + 1]);
            }
        }
        addContour(leftEar);
        addContour(rightEar);

        // ─── Interaction & Rotation State ───────────────────────────────────
        let currentRotY = 0.28; // default 3/4 poster angle
        let currentRotX = 0.05;
        let targetRotY = 0.28;
        let targetRotX = 0.05;
        let scanPos = 0;
        let scanDirection = 1;

        const container = canvas.closest('.card-wireframe-display') || canvas;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;
            targetRotY = 0.28 + relX * 0.55;
            targetRotX = 0.05 + relY * 0.40;
        });

        container.addEventListener('mouseleave', () => {
            targetRotY = 0.28;
            targetRotX = 0.05;
        });

        // ─── 3D Projection Math ─────────────────────────────────────────────
        const fov = 380;
        const cx = (displayWidth * dpr) / 2;
        const cy = (displayHeight * dpr) / 2 + 10 * dpr;

        function render(timestamp) {
            // Smooth LERP towards mouse target + tiny idle breathing
            const idleOffset = Math.sin(timestamp * 0.0012) * 0.035;
            currentRotY += (targetRotY + idleOffset - currentRotY) * 0.06;
            currentRotX += (targetRotX - currentRotX) * 0.06;

            const cosY = Math.cos(currentRotY);
            const sinY = Math.sin(currentRotY);
            const cosX = Math.cos(currentRotX);
            const sinX = Math.sin(currentRotX);

            // Project all 3D vertices into 2D screen coordinates
            const projected = new Array(vertices.length);
            for (let i = 0; i < vertices.length; i++) {
                const v = vertices[i];

                // Y-axis rotation (Yaw)
                const x1 = v.x * cosY + v.z * sinY;
                const z1 = -v.x * sinY + v.z * cosY;

                // X-axis rotation (Pitch)
                const y1 = v.y * cosX - z1 * sinX;
                const z2 = v.y * sinX + z1 * cosX;

                // Perspective projection: fov / (fov + z)
                const depth = fov + z2;
                const scale = (fov / depth) * dpr;

                projected[i] = {
                    x: cx + x1 * scale,
                    y: cy + y1 * scale,
                    z: z2,
                    scale: scale
                };
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Subtle dark background backing
            ctx.fillStyle = '#08090d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw wireframe edges
            ctx.lineWidth = 0.8 * dpr;
            for (let i = 0; i < edges.length; i++) {
                const [i1, i2] = edges[i];
                const p1 = projected[i1];
                const p2 = projected[i2];

                // Depth-based fading (front vertices are bright bone, back vertices are dim)
                const avgZ = (p1.z + p2.z) * 0.5;
                const alpha = Math.max(0.12, Math.min(0.85, (avgZ + 110) / 210));

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);

                if (avgZ > 15) {
                    ctx.strokeStyle = `rgba(236, 231, 222, ${alpha * 0.95})`;
                } else {
                    ctx.strokeStyle = `rgba(236, 231, 222, ${alpha * 0.45})`;
                }
                ctx.stroke();
            }

            // ─── SOLID BLACK CENSOR BAR OVER EYES (IDENTICAL TO POSTER!) ────
            // Eye center reference points (approx vertices in eye band)
            const eyeLevelY = cy - 22 * dpr + (currentRotX * 40 * dpr);
            const eyeCenterX = cx + (currentRotY * 18 * dpr);
            const barWidth = 160 * dpr;
            const barHeight = 44 * dpr;
            const barX = eyeCenterX - barWidth / 2;
            const barY = eyeLevelY - barHeight / 2;

            // Solid black fill to obscure wireframe eye geometry
            ctx.fillStyle = '#08090d';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Clean, stark off-white / bone border
            ctx.lineWidth = 1.6 * dpr;
            ctx.strokeStyle = '#ece7de';
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            // ─── FORENSIC RED LASER SCANNER LINE ────────────────────────────
            scanPos += scanDirection * 1.4 * dpr;
            if (scanPos > canvas.height - 10 * dpr) {
                scanDirection = -1;
            } else if (scanPos < 10 * dpr) {
                scanDirection = 1;
            }

            const scanGrad = ctx.createLinearGradient(0, scanPos, canvas.width, scanPos);
            scanGrad.addColorStop(0, 'rgba(230, 50, 62, 0)');
            scanGrad.addColorStop(0.2, 'rgba(230, 50, 62, 0.7)');
            scanGrad.addColorStop(0.5, 'rgba(230, 50, 62, 1)');
            scanGrad.addColorStop(0.8, 'rgba(230, 50, 62, 0.7)');
            scanGrad.addColorStop(1, 'rgba(230, 50, 62, 0)');

            ctx.lineWidth = 1.5 * dpr;
            ctx.strokeStyle = scanGrad;
            ctx.beginPath();
            ctx.moveTo(20 * dpr, scanPos);
            ctx.lineTo(canvas.width - 20 * dpr, scanPos);
            ctx.stroke();

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DHead);
    } else {
        init3DHead();
    }
})();
