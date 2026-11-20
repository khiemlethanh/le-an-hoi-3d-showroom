import * as THREE from 'three';
import { BACKDROP_Z, SIGNAGE, COLORS } from './scene-config.js';

const FONT = '800 280px Montserrat, "Be Vietnam Pro", Arial, sans-serif';

// Wait for the web font (needed for Vietnamese diacritics), but never block forever.
async function ensureFont() {
  try {
    await Promise.race([
      document.fonts.load('800 280px Montserrat', SIGNAGE.text),
      new Promise(resolve => setTimeout(resolve, 3500)),
    ]);
  } catch (err) {
    console.warn('Font load failed, using fallback font', err);
  }
}

function textCanvas(glow) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (glow) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 2048, 512); }
  ctx.font = FONT;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '14px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const scale = Math.min(1, 1800 / ctx.measureText(SIGNAGE.text).width);
  ctx.translate(1024, 280);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff';
  if (glow) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 46; }
  for (let i = 0; i < (glow ? 3 : 1); i++) ctx.fillText(SIGNAGE.text, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Raised lettering: stacked alpha-cut layers give real depth from any angle
// (silver sides, glossy rose face) with a back-lit LED halo behind.
function buildLettering() {
  const group = new THREE.Group();
  const plane = new THREE.PlaneGeometry(SIGNAGE.textWidth, SIGNAGE.textHeight);
  const map = textCanvas(false);
  const side = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, color: COLORS.silver, metalness: 0.9, roughness: 0.25 });
  const face = new THREE.MeshPhysicalMaterial({ map, alphaTest: 0.5, color: COLORS.rose, roughness: 0.22, clearcoat: 1 });
  const LAYERS = 14, DEPTH = 0.09;
  for (let i = 0; i < LAYERS; i++) {
    const layer = new THREE.Mesh(plane, i === LAYERS - 1 ? face : side);
    layer.position.z = 0.05 + (DEPTH * i) / (LAYERS - 1);
    group.add(layer);
  }
  const halo = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({
    map: textCanvas(true), color: COLORS.led, blending: THREE.AdditiveBlending,
    transparent: true, opacity: 0.55, depthWrite: false,
  }));
  halo.position.z = 0.02;
  group.add(halo);
  group.position.y = SIGNAGE.textY;
  return group;
}

// Minimal double-happiness mark built from straight bars, framed by a silver ring.
function buildDoubleHappiness(mats) {
  const group = new THREE.Group();
  const T = 0.085; // stroke thickness in symbol units
  const bars = [];
  const h = (y, x0, x1) => bars.push([(x0 + x1) / 2, y, x1 - x0 + T, T]);
  const v = (x, y0, y1) => bars.push([x, (y0 + y1) / 2, T, y1 - y0 + T]);
  for (const cx of [-0.5, 0.5]) {
    h(0.82, cx - 0.34, cx + 0.34);            // top bar
    v(cx, 0.62, 1.0);                         // stem
    h(0.62, cx - 0.5, cx + 0.5);              // long bar (joins both halves)
    h(0.44, cx - 0.26, cx + 0.26); h(0.22, cx - 0.26, cx + 0.26);
    v(cx - 0.26, 0.22, 0.44); v(cx + 0.26, 0.22, 0.44);     // upper box
    v(cx - 0.2, -0.04, 0.08); v(cx + 0.2, -0.04, 0.08);     // two ticks
    h(-0.1, cx - 0.5, cx + 0.5);              // long bar (joins both halves)
    h(-0.34, cx - 0.3, cx + 0.3); h(-0.72, cx - 0.3, cx + 0.3);
    v(cx - 0.3, -0.72, -0.34); v(cx + 0.3, -0.72, -0.34);   // lower box
  }
  const S = 0.36; // symbol units -> metres
  const symbol = new THREE.Group();
  bars.forEach(([x, y, w, hgt]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w * S, hgt * S, 0.05), mats.rose);
    bar.position.set(x * S, (y - 0.14) * S, 0.075);
    bar.castShadow = true;
    symbol.add(bar);
  });
  const R = SIGNAGE.ringRadius;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.022, 12, 96), mats.silver);
  ring.position.z = 0.1;
  ring.castShadow = true;
  const ringLed = new THREE.Mesh(new THREE.TorusGeometry(R, 0.02, 8, 96), mats.led);
  ringLed.position.z = 0.03;
  group.add(symbol, ring, ringLed);
  group.position.y = SIGNAGE.symbolY;
  return group;
}

export async function buildSignage(mats) {
  await ensureFont();
  const group = new THREE.Group();
  group.add(buildLettering(), buildDoubleHappiness(mats));
  const underline = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.018, 0.03), mats.silver);
  underline.position.set(0, SIGNAGE.textY - 0.47, 0.06);
  group.add(underline);
  group.position.z = BACKDROP_Z;
  return group;
}
