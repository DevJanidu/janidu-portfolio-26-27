"use client";

import { useEffect, useRef } from "react";

/* The footer wordmark, Laravel-style: the text is rasterized once, then
   rebuilt as a dense field of tiny 1/0 digits on canvas. Each digit is a
   particle that gravitates toward the pointer and springs back home. */

type Particle = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
};

const PULL_RADIUS = 150;
const PULL_STRENGTH = 1.6;
const SPRING = 0.03;
const DAMPING = 0.86;

function pickColor(gx: number, gy: number) {
  // Deterministic mix: mostly ice, some soft blue, occasional white sparkle.
  const r = (gx * 7 + gy * 13) % 10;
  if (r === 9) return "#FFFFFF";
  if (r >= 6) return "#90E0EF";
  return "#CAF0F8";
}

export function BinaryName({ text }: { text: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const mouse = { x: -9999, y: -9999, active: false };
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let digit = 7;
    let raf = 0;
    let running = false;
    let visible = false;

    function build() {
      if (!wrap || !canvas || !ctx) return;
      width = wrap.clientWidth;
      const fontSize = Math.max(64, width * 0.21);
      height = Math.ceil(fontSize * 1.05);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rasterize the wordmark offscreen, then sample it on a small grid.
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText(text, width / 2, height / 2);
      const alpha = octx.getImageData(0, 0, width, height).data;

      const step = Math.max(6, Math.round(fontSize / 34));
      digit = Math.max(5, step - 2);
      particles = [];
      for (let y = step >> 1; y < height; y += step) {
        for (let x = step >> 1; x < width; x += step) {
          if (alpha[(y * width + x) * 4 + 3] > 128) {
            const gx = Math.round(x / step);
            const gy = Math.round(y / step);
            particles.push({
              hx: x,
              hy: y,
              x,
              y,
              vx: 0,
              vy: 0,
              char: (gx + gy) % 2 === 0 ? "1" : "0",
              color: pickColor(gx, gy),
            });
          }
        }
      }
      drawFrame();
    }

    function drawFrame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${digit}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillText(p.char, p.x, p.y);
      }
    }

    function tick() {
      for (const p of particles) {
        let ax = (p.hx - p.x) * SPRING;
        let ay = (p.hy - p.y) * SPRING;
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < PULL_RADIUS * PULL_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / PULL_RADIUS) * PULL_STRENGTH;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }
        p.vx = (p.vx + ax) * DAMPING;
        p.vy = (p.vy + ay) * DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }
      drawFrame();
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function onMove(e: PointerEvent) {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    }

    function onLeave() {
      mouse.active = false;
    }

    build();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    let resizeQueued = false;
    const ro = new ResizeObserver(() => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        build();
      });
    });
    ro.observe(wrap);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return (
    <div ref={wrapRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="block w-full [filter:drop-shadow(0_0_3px_rgba(0,180,216,0.45))]"
        aria-hidden="true"
      />
    </div>
  );
}
