import * as THREE from 'three';
import { BACKDROP, LETTERING, COLORS } from './scene-config.js';
import { doubleHappinessBars } from './double-happiness-symbol-strokes.js';

const FONT_FAMILY = '"Playfair Display", "Times New Roman", serif';
const PX_PER_M = 1000;
const CAP_RATIO = 0.7; // cap height / font size for the serif used

// Wait for the web font (needed for Vietnamese diacritics), but never block forever.
async function ensureFont() {
  try {
    await Promise.race([
      document.fonts.load(`600 200px ${FONT_FAMILY}`, LETTERING.lines.map(l => l.text).join('')),
      new Promise(resolve => setTimeout(resolve, 3500)),
    ]);
  } catch (err) {
    console.warn('Font load failed, using fallback font', err);
  }
}

function letteringTexture() {
  const { blockTop, blockBottom, blockWidth, lines } = LETTERING;
  const canvas = document.createElement('canvas');
  canvas.width = blockWidth * PX_PER_M;
  canvas.height = (blockTop - blockBottom) * PX_PER_M;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach(line => {
    const size = (line.cap / CAP_RATIO) * PX_PER_M;
    ctx.font = `600 ${size}px ${FONT_FAMILY}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = line.cap < 0.15 ? '10px' : '2px';
    // Shrink a line that would overflow the block instead of clipping it.
    const fit = Math.min(1, (canvas.width * 0.96) / ctx.measureText(line.text).width);
    ctx.save();
    ctx.translate(canvas.width / 2, (blockTop - line.y) * PX_PER_M);
    ctx.scale(fit, fit);
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Raised brass lettering: stacked alpha-cut layers give real depth from any angle.
function buildLettering() {
  const { blockTop, blockBottom, blockWidth, depth } = LETTERING;
  const group = new THREE.Group();
  const map = letteringTexture();
  const brass = (color, roughness) => new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, color, metalness: 0.7, roughness });
  const side = brass('#9a7d48', 0.45), face = brass(COLORS.brass, 0.3);
  const plane = new THREE.PlaneGeometry(blockWidth, blockTop - blockBottom);
  const LAYERS = 10;
  for (let i = 0; i < LAYERS; i++) {
    const layer = new THREE.Mesh(plane, i === LAYERS - 1 ? face : side);
    layer.position.set(0, (blockTop + blockBottom) / 2, 0.008 + (depth * i) / (LAYERS - 1));
    group.add(layer);
  }
  return group;
}

function buildSeal(mats) {
  const { y, size } = LETTERING.seal;
  const group = new THREE.Group();
  const S = size / 2;
  doubleHappinessBars(0.11).forEach(([x, by, w, h]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, 0.02), mats.brass);
    bar.position.set(x * S, by * S, 0.018);
    group.add(bar);
  });
  group.position.y = y;
  return group;
}

export async function buildSignage(mats) {
  await ensureFont();
  const group = new THREE.Group();
  group.add(buildLettering(), buildSeal(mats));
  group.position.z = BACKDROP.z + BACKDROP.panel.offset;
  return group;
}
