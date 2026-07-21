"use client";

import { useEffect, useRef } from "react";

/* Footer pool-tile mosaic: a left-to-right dark→light dithered gradient.
   Each tile picks from the brand ramp based on its horizontal position plus
   per-tile noise, so the bands blend into each other — with occasional light
   tiles scattered on the dark side (and vice versa) for the pool-glint look.
   Painted once per resize on canvas; a per-position hash keeps it stable. */

const TILE = 11;
const GROUT = "#02034A";
const RAMP = ["#03045E", "#023E8A", "#0077B6", "#00B4D8", "#90E0EF"];
const SPARKLE = "#CAF0F8";

function hash2(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function MosaicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function paint() {
      if (!canvas || !ctx) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = GROUT;
      ctx.fillRect(0, 0, w, h);

      const cols = Math.ceil(w / TILE);
      const rows = Math.ceil(h / TILE);
      const last = RAMP.length - 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n1 = hash2(c, r);
          const n2 = hash2(c + 7919, r + 104729);

          // Base position in the ramp + dithering noise around the bands.
          let f = c / (cols - 1) + (n1 - 0.5) * 0.4;
          if (n2 > 0.97) f += 0.35; // stray light tile on the dark side
          else if (n2 < 0.03) f -= 0.35; // stray dark tile on the light side
          f = Math.min(1, Math.max(0, f));

          let color = RAMP[Math.round(f * last)];
          if (n2 > 0.995) color = SPARKLE;

          ctx.globalAlpha = 0.82 + hash2(c + 31, r + 57) * 0.18;
          ctx.fillStyle = color;
          ctx.fillRect(c * TILE + 1, r * TILE + 1, TILE - 1, TILE - 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    paint();

    let queued = false;
    const ro = new ResizeObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        paint();
      });
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => ro.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />;
}
