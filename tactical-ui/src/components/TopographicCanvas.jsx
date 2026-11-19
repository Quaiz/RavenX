import React, { useEffect, useRef } from 'react';

/**
 * Lightweight animated topographic contour flow-field canvas (~30 FPS).
 * Uses linear-interpolated Marching Squares over a smooth drifting elevation field.
 */
const TopographicCanvas = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const cols = 54;
    const rows = 32;
    const field = new Float32Array((cols + 1) * (rows + 1));
    const levels = [-1.15, -0.8, -0.45, -0.1, 0.25, 0.6, 0.95, 1.3];

    // Marching squares lookup: pairs of edges [0=top, 1=right, 2=bottom, 3=left]
    const CASES = [
      [],
      [[3, 2]],
      [[2, 1]],
      [[3, 1]],
      [[0, 1]],
      [[3, 0], [2, 1]],
      [[0, 2]],
      [[3, 0]],
      [[3, 0]],
      [[0, 2]],
      [[0, 1], [3, 2]],
      [[0, 1]],
      [[3, 1]],
      [[2, 1]],
      [[3, 2]],
      [],
    ];

    const interp = (a, b, level) => {
      const d = b - a;
      if (Math.abs(d) < 1e-5) return 0.5;
      return Math.max(0, Math.min(1, (level - a) / d));
    };

    const draw = (now) => {
      rafId = requestAnimationFrame(draw);
      if (now - lastFrame < 33) return; // ~30 FPS cap for low CPU/GPU usage
      lastFrame = now;

      const t = now * 0.00032;
      ctx.clearRect(0, 0, width, height);

      const cellW = width / cols;
      const cellH = height / rows;

      // Compute smooth flowing elevation field
      for (let j = 0; j <= rows; j++) {
        const ny = (j / rows) * 4.4;
        const rowOff = j * (cols + 1);
        for (let i = 0; i <= cols; i++) {
          const nx = (i / cols) * 6.8;
          const v =
            Math.sin(nx * 0.85 + t * 0.9) * Math.cos(ny * 0.85 - t * 0.65) +
            0.55 * Math.sin((nx + ny) * 0.62 - t * 0.75) +
            0.38 * Math.cos(nx * 1.15 - ny * 1.05 + t * 0.55) +
            0.22 * Math.sin(ny * 1.6 + t * 0.4);
          field[rowOff + i] = v;
        }
      }

      // Render contour isolines
      for (let li = 0; li < levels.length; li++) {
        const level = levels[li];
        const isMajor = li % 3 === 1;
        ctx.beginPath();
        ctx.lineWidth = isMajor ? 1.15 : 0.75;
        ctx.strokeStyle = isMajor
          ? 'rgba(198, 214, 122, 0.22)'
          : 'rgba(127, 168, 114, 0.11)';

        for (let j = 0; j < rows; j++) {
          const r0 = j * (cols + 1);
          const r1 = (j + 1) * (cols + 1);
          const y0 = j * cellH;
          const y1 = y0 + cellH;

          for (let i = 0; i < cols; i++) {
            const v0 = field[r0 + i];
            const v1 = field[r0 + i + 1];
            const v2 = field[r1 + i + 1];
            const v3 = field[r1 + i];

            let idx = 0;
            if (v0 > level) idx |= 8;
            if (v1 > level) idx |= 4;
            if (v2 > level) idx |= 2;
            if (v3 > level) idx |= 1;

            const segs = CASES[idx];
            if (segs.length === 0) continue;

            const x0 = i * cellW;
            const x1 = x0 + cellW;

            const edgePt = (edge) => {
              if (edge === 0) return [x0 + interp(v0, v1, level) * cellW, y0];
              if (edge === 1) return [x1, y0 + interp(v1, v2, level) * cellH];
              if (edge === 2) return [x0 + interp(v3, v2, level) * cellW, y1];
              return [x0, y0 + interp(v0, v3, level) * cellH];
            };

            for (let s = 0; s < segs.length; s++) {
              const pA = edgePt(segs[s][0]);
              const pB = edgePt(segs[s][1]);
              ctx.moveTo(pA[0], pA[1]);
              ctx.lineTo(pB[0], pB[1]);
            }
          }
        }
        ctx.stroke();
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default TopographicCanvas;
