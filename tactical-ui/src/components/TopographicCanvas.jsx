import React, { useEffect, useRef } from 'react';

/**
 * 2D seeded gradient noise (3-octave layered) for organic topographic elevation contours.
 */
class Noise2D {
  constructor(seed = 7) {
    this.p = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = perm[i];
      perm[i] = perm[j];
      perm[j] = tmp;
    }
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }

  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const u = this.fade(fx);
    const v = this.fade(fy);
    const p = this.p;
    const aa = p[X + p[Y]];
    const ab = p[X + p[Y + 1]];
    const ba = p[X + 1 + p[Y]];
    const bb = p[X + 1 + p[Y + 1]];
    return this.lerp(
      this.lerp(this.grad(aa, fx, fy), this.grad(ba, fx - 1, fy), u),
      this.lerp(this.grad(ab, fx, fy - 1), this.grad(bb, fx - 1, fy - 1), u),
      v
    );
  }
}

const TopographicCanvas = ({ className = '', speed = 0.14 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const noise = new Noise2D(7);
    const GRID = 82;
    const LEVELS = 14;
    let W = 0;
    let H = 0;
    let rows = 46;
    let field = new Float32Array((GRID + 1) * (rows + 1));
    let rafId = 0;
    let lastFrame = 0;
    let t = 0;

    const resize = () => {
      const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      rows = Math.max(24, Math.round(GRID * (H / Math.max(1, W))));
      field = new Float32Array((GRID + 1) * (rows + 1));
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const fieldValue = (gx, gy, time) => {
      const nx = (gx / GRID) * 3.2;
      const ny = (gy / Math.max(1, rows)) * 3.2;
      const v =
        noise.noise(nx + time, ny - time * 0.6) * 1.0 +
        noise.noise(nx * 2 + 50, ny * 2 - 50 + time * 0.3) * 0.5 +
        noise.noise(nx * 4 + 100 - time * 0.2, ny * 4 + 100) * 0.25;
      return v / 1.75;
    };

    const interp = (x1, y1, x2, y2, v1, v2, iso) => {
      const ratio = (iso - v1) / (v2 - v1 + 1e-6);
      return [x1 + ratio * (x2 - x1), y1 + ratio * (y2 - y1)];
    };

    const drawContours = (time) => {
      ctx.clearRect(0, 0, W, H);

      const cols = GRID;
      const cellW = W / cols;
      const cellH = H / rows;

      for (let j = 0; j <= rows; j++) {
        const rowOff = j * (cols + 1);
        for (let i = 0; i <= cols; i++) {
          field[rowOff + i] = fieldValue(i, j, time);
        }
      }

      for (let L = 0; L < LEVELS; L++) {
        const iso = -0.9 + (1.8 * L) / (LEVELS - 1);
        const isMid = Math.abs(iso) < 0.08;
        const isMajor = L % 4 === 0;

        ctx.beginPath();
        ctx.strokeStyle = isMid
          ? 'rgba(198, 214, 122, 0.42)'
          : isMajor
            ? 'rgba(163, 201, 119, 0.24)'
            : 'rgba(127, 168, 114, 0.14)';
        ctx.lineWidth = isMid ? 1.35 : isMajor ? 1.0 : 0.75;

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
            if (v0 > iso) idx |= 1;
            if (v1 > iso) idx |= 2;
            if (v2 > iso) idx |= 4;
            if (v3 > iso) idx |= 8;
            if (idx === 0 || idx === 15) continue;

            const x0 = i * cellW;
            const x1 = x0 + cellW;

            const pTop = () => interp(x0, y0, x1, y0, v0, v1, iso);
            const pRight = () => interp(x1, y0, x1, y1, v1, v2, iso);
            const pBottom = () => interp(x0, y1, x1, y1, v3, v2, iso);
            const pLeft = () => interp(x0, y0, x0, y1, v0, v3, iso);

            const drawSeg = (a, b) => {
              ctx.moveTo(a[0], a[1]);
              ctx.lineTo(b[0], b[1]);
            };

            switch (idx) {
              case 1:
              case 14:
                drawSeg(pLeft(), pTop());
                break;
              case 2:
              case 13:
                drawSeg(pTop(), pRight());
                break;
              case 3:
              case 12:
                drawSeg(pLeft(), pRight());
                break;
              case 4:
              case 11:
                drawSeg(pRight(), pBottom());
                break;
              case 6:
              case 9:
                drawSeg(pTop(), pBottom());
                break;
              case 7:
              case 8:
                drawSeg(pLeft(), pBottom());
                break;
              case 5:
                drawSeg(pLeft(), pTop());
                drawSeg(pRight(), pBottom());
                break;
              case 10:
                drawSeg(pTop(), pRight());
                drawSeg(pLeft(), pBottom());
                break;
              default:
                break;
            }
          }
        }
        ctx.stroke();
      }
    };

    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      if (now - lastFrame < 33) return; // smooth ~30 FPS
      lastFrame = now;
      t += 0.0015 * speed * 10;
      drawContours(t);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default TopographicCanvas;
