import * as THREE from 'three';
import { PANELS, BACKDROP_Z, PANEL_DEPTH, CORNER_R } from './scene-config.js';

// Silhouette height at x, with quarter-circle rounding on both top corners.
export function panelTop(panel, x) {
  const edgeDist = Math.min(x - panel.x0, panel.x1 - x);
  let h = panel.top(x);
  if (edgeDist < CORNER_R) {
    const k = CORNER_R - edgeDist;
    h -= CORNER_R - Math.sqrt(Math.max(0, CORNER_R * CORNER_R - k * k));
  }
  return h;
}

function geometryFrom(positions, indices, colors) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (colors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Strip of quads between two equally long point lists.
function ribbon(a, b, colorA, colorB) {
  const pos = [], idx = [], col = [];
  a.forEach((p, i) => {
    pos.push(p.x, p.y, p.z, b[i].x, b[i].y, b[i].z);
    if (colorA !== undefined) col.push(colorA, colorA, colorA, colorB, colorB, colorB);
    if (i < a.length - 1) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  });
  return geometryFrom(pos, idx, col.length ? col : null);
}

function tube(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, points.length * 2, radius, 8), material);
}

function buildPanel(panel, mats) {
  const group = new THREE.Group();
  const SEG = 110;
  const z0 = BACKDROP_Z + panel.z;
  const top = [];
  for (let i = 0; i <= SEG; i++) {
    const x = panel.x0 + ((panel.x1 - panel.x0) * i) / SEG;
    top.push(new THREE.Vector3(x, panelTop(panel, x), z0 + panel.bend(x)));
  }
  const base = top.map(p => new THREE.Vector3(p.x, 0, p.z));
  const back = v => new THREE.Vector3(v.x, v.y, v.z - PANEL_DEPTH);

  // Front + back faces share one geometry.
  const faceGeo = ribbon(base, top);
  const front = new THREE.Mesh(faceGeo, mats[panel.color]);
  const rear = new THREE.Mesh(faceGeo, mats[panel.color]);
  rear.position.z = -PANEL_DEPTH;

  // Outline runs up the left edge, along the wavy top and down the right edge.
  const outline = [base[0], ...top, base[SEG]];
  const edge = new THREE.Mesh(ribbon(outline, outline.map(back)), mats[panel.color]);
  group.add(front, rear, edge);
  [front, rear, edge].forEach(m => { m.castShadow = true; m.receiveShadow = true; });

  // Mirror-silver metal trim on the front edge.
  const trim = tube(outline.map(p => new THREE.Vector3(p.x, p.y, p.z + 0.012)), 0.02, mats.silver);
  trim.castShadow = true;
  group.add(trim);

  // LED cove behind the wall: strip pushed slightly outward along the outline
  // normal so a thin line of light peeks past the edge, plus a soft wash.
  const led = [], washOuter = [];
  outline.forEach((p, i) => {
    const prev = outline[Math.max(0, i - 1)], next = outline[Math.min(outline.length - 1, i + 1)];
    const n = new THREE.Vector2(-(next.y - prev.y), next.x - prev.x).normalize();
    const zc = p.z - PANEL_DEPTH - 0.03;
    led.push(new THREE.Vector3(p.x + n.x * 0.05, p.y + n.y * 0.05, zc));
    washOuter.push(new THREE.Vector3(p.x + n.x * 0.6, p.y + n.y * 0.6, zc - 0.02));
  });
  group.add(tube(led, 0.026, mats.led));
  group.add(new THREE.Mesh(ribbon(led, washOuter, 1, 0), mats.ledGlow));
  return group;
}

export function buildBackdrop(mats) {
  const group = new THREE.Group();
  PANELS.forEach(panel => group.add(buildPanel(panel, mats)));
  return group;
}
