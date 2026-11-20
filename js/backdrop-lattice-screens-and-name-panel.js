import * as THREE from 'three';
import { BACKDROP, COLORS, screenCenterX } from './scene-config.js';
import { doubleHappinessBars } from './double-happiness-symbol-strokes.js';

const PX_PER_M = 420;

// Fretwork pattern (traditional window-lattice feel) drawn as opaque strokes on a
// transparent canvas; the mesh uses it as an alpha cut-out so the backlight shows through.
function latticeTexture(width, height) {
  const { cell, strip, frame, medallionRadius } = BACKDROP.lattice;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * PX_PER_M);
  canvas.height = Math.round(height * PX_PER_M);
  const ctx = canvas.getContext('2d');
  const px = m => m * PX_PER_M;
  ctx.strokeStyle = ctx.fillStyle = '#fff';
  ctx.lineWidth = px(strip);
  ctx.lineJoin = 'miter';

  const inner = { x: frame, y: frame, w: width - frame * 2, h: height - frame * 2 };
  const cols = Math.max(2, Math.round(inner.w / cell)), rows = Math.max(2, Math.round(inner.h / cell));
  const cw = inner.w / cols, ch = inner.h / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = inner.x + i * cw, y = inner.y + j * ch;
    ctx.strokeRect(px(x), px(y), px(cw), px(ch));
    // Alternating wide / tall inner rectangle tied to the cell edges.
    const wide = (i + j) % 2 === 0;
    const rw = cw * (wide ? 0.62 : 0.3), rh = ch * (wide ? 0.3 : 0.62);
    const rx = x + (cw - rw) / 2, ry = y + (ch - rh) / 2;
    ctx.strokeRect(px(rx), px(ry), px(rw), px(rh));
    ctx.beginPath();
    if (wide) { ctx.moveTo(px(x + cw / 2), px(y)); ctx.lineTo(px(x + cw / 2), px(ry)); ctx.moveTo(px(x + cw / 2), px(ry + rh)); ctx.lineTo(px(x + cw / 2), px(y + ch)); }
    else { ctx.moveTo(px(x), px(y + ch / 2)); ctx.lineTo(px(rx), px(y + ch / 2)); ctx.moveTo(px(rx + rw), px(y + ch / 2)); ctx.lineTo(px(x + cw), px(y + ch / 2)); }
    ctx.stroke();
  }

  // Round medallion with a simplified double-happiness mark, set in the upper part of the screen.
  const mx = width / 2, my = height * 0.36, R = Math.min(medallionRadius, width / 2 - frame - 0.03);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(px(mx), px(my), px(R), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(px(mx), px(my), px(R - strip / 2), 0, Math.PI * 2); ctx.stroke();
  const S = R * 0.58;
  doubleHappinessBars(0.12).forEach(([x, y, w, h]) =>
    ctx.fillRect(px(mx + (x - w / 2) * S), px(my - (y + h / 2) * S), px(w * S), px(h * S)));

  // Solid outer frame.
  ctx.lineWidth = px(frame);
  ctx.strokeRect(px(frame / 2), px(frame / 2), px(width - frame), px(height - frame));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function buildScreen(spec, mats) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    map: latticeTexture(spec.width, spec.height), alphaTest: 0.5, color: COLORS.cream, roughness: 0.55, side: THREE.DoubleSide,
  });
  const plane = new THREE.PlaneGeometry(spec.width, spec.height);
  // Three stacked cut-outs fake the 3 cm thickness of a CNC-cut board.
  for (let i = 0; i < 3; i++) {
    const layer = new THREE.Mesh(plane, material);
    layer.position.set(0, spec.height / 2, -i * 0.012);
    layer.castShadow = i === 0;
    group.add(layer);
  }
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(spec.width - 0.04, spec.height - 0.04), mats.backlight);
  glow.position.set(0, spec.height / 2, -0.07);
  group.add(glow);
  return group;
}

function buildNamePanel(mats) {
  const { width, height, frame, inlayInset, inlay } = BACKDROP.panel;
  const group = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.06), mats.butter);
  board.position.set(0, height / 2, -0.03);
  board.castShadow = board.receiveShadow = true;
  group.add(board);

  // Rectangular border made of four bars (brass frame at the edge, terracotta inlay line inside).
  const border = (inset, thickness, depth, material) => {
    const w = width - inset * 2, h = height - inset * 2;
    [[0, h / 2, w, thickness], [0, -h / 2, w, thickness], [-w / 2, 0, thickness, h], [w / 2, 0, thickness, h]].forEach(([x, y, bw, bh]) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(bw + (bw > bh ? thickness : 0), bh, depth), material);
      bar.position.set(x, height / 2 + y, depth / 2);
      group.add(bar);
    });
  };
  border(frame / 2, frame, 0.03, mats.brass);
  border(inlayInset, inlay, 0.006, mats.terracotta);
  return group;
}

export function buildBackdrop(mats) {
  const group = new THREE.Group();
  const { wall, panel, screens } = BACKDROP;

  const rear = new THREE.Mesh(new THREE.BoxGeometry(wall.width, wall.height, 0.1), mats.wall);
  rear.position.set(0, wall.height / 2, -0.05);
  rear.castShadow = rear.receiveShadow = true;
  group.add(rear);

  const namePanel = buildNamePanel(mats);
  namePanel.position.z = panel.offset;
  group.add(namePanel);

  screens.forEach((spec, i) => {
    for (const side of [-1, 1]) {
      const screen = buildScreen(spec, mats);
      screen.position.set(side * screenCenterX(i), 0, spec.offset);
      group.add(screen);
    }
  });
  group.position.z = BACKDROP.z;
  return group;
}
