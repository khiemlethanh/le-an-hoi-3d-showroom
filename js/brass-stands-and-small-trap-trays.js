import * as THREE from 'three';
import { TRAYS, TRAY } from './scene-config.js';

const std = (color, roughness = 0.5) => new THREE.MeshStandardMaterial({ color, roughness });
const sphere = new THREE.SphereGeometry(1, 16, 12);
const box = new THREE.BoxGeometry(1, 1, 1);
const can = new THREE.CylinderGeometry(1, 1, 1, 20);

function add(parent, geometry, material, [x, y, z], [sx, sy, sz]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

// Place `count` items on a circle; callback receives (x, z, index).
function ring(count, radius, fn) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    fn(Math.cos(a) * radius, Math.sin(a) * radius, i);
  }
}

// Nine petite offerings, one builder per tray (index matches TRAP_NAMES). All stay under ~22 cm.
const CONTENTS = [
  (g) => { // betel leaves and areca nuts
    const nut = std('#6fa544'), leaf = std('#3f7d3a', 0.7);
    ring(7, 0.1, (x, z) => add(g, sphere, leaf, [x, 0.01, z], [0.055, 0.007, 0.04]).rotation.y = Math.atan2(-z, x));
    ring(5, 0.06, (x, z) => add(g, sphere, nut, [x, 0.04, z], [0.027, 0.036, 0.027]));
    add(g, sphere, nut, [0, 0.09, 0], [0.027, 0.036, 0.027]);
  },
  (g, m) => { // tea tins
    const tin = std('#9c3b2a', 0.35);
    const place = (x, y, z) => { add(g, can, tin, [x, y, z], [0.038, 0.08, 0.038]); add(g, can, m.brass, [x, y + 0.044, z], [0.039, 0.01, 0.039]); };
    ring(4, 0.07, (x, z) => place(x, 0.04, z));
    place(0, 0.125, 0);
  },
  (g, m) => { // two small wine bottles
    for (const s of [-1, 1]) {
      add(g, can, std('#3a1a1c', 0.25), [s * 0.045, 0.07, 0], [0.03, 0.14, 0.03]);
      add(g, can, std('#3a1a1c', 0.25), [s * 0.045, 0.165, 0], [0.012, 0.05, 0.012]);
      add(g, can, m.brass, [s * 0.045, 0.195, 0], [0.014, 0.02, 0.014]);
    }
  },
  (g, m) => { // green rice cakes
    const cake = std('#86b457', 0.7);
    [[2, 0.022], [1, 0.066]].forEach(([n, y]) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = (i - (n - 1) / 2) * 0.085, z = (j - (n - 1) / 2) * 0.085;
        add(g, box, cake, [x, y, z], [0.075, 0.042, 0.075]);
        add(g, box, m.terracotta, [x, y, z], [0.077, 0.044, 0.012]);
      }
    });
  },
  (g) => { // husband-and-wife cakes in pastel wraps
    const wraps = [std('#f3d0a8'), std('#f3e2ad'), std('#e9b99a')];
    ring(4, 0.075, (x, z, i) => add(g, box, wraps[i % 3], [x, 0.025, z], [0.07, 0.045, 0.07]).rotation.y = 0.4);
    add(g, box, wraps[1], [0, 0.072, 0], [0.07, 0.045, 0.07]);
  },
  (g) => { // a little fruit
    const fruits = ['#f29d2e', '#c9463a', '#f3d34d', '#93bf55'].map(c => std(c, 0.45));
    ring(5, 0.085, (x, z, i) => add(g, sphere, fruits[i % 4], [x, 0.04, z], [0.04, 0.04, 0.04]));
    add(g, sphere, fruits[1], [0, 0.1, 0], [0.042, 0.042, 0.042]);
  },
  (g) => { // lotus seed sweets
    const seed = std('#f6ecd2', 0.6);
    ring(8, 0.09, (x, z) => add(g, sphere, seed, [x, 0.02, z], [0.024, 0.02, 0.024]));
    ring(5, 0.05, (x, z) => add(g, sphere, seed, [x, 0.05, z], [0.024, 0.02, 0.024]));
    add(g, sphere, seed, [0, 0.08, 0], [0.024, 0.02, 0.024]);
  },
  (g, m) => { // red sticky rice dome
    add(g, new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#d2552a', 0.85), [0, 0, 0], [0.12, 0.09, 0.12]);
    add(g, can, m.brass, [0, 0.09, 0], [0.025, 0.004, 0.025]);
  },
  (g, m) => { // two gift boxes
    const paper = std('#f6ecd2', 0.6);
    add(g, box, paper, [-0.03, 0.04, 0], [0.13, 0.08, 0.1]);
    add(g, box, m.terracotta, [-0.03, 0.04, 0], [0.132, 0.082, 0.016]);
    add(g, box, m.terracotta, [0.02, 0.115, 0.01], [0.08, 0.07, 0.07]);
    add(g, box, paper, [0.02, 0.115, 0.01], [0.082, 0.072, 0.012]);
  },
];

// Open brass cube frame (4 legs + top and bottom rings).
function buildStand(m) {
  const g = new THREE.Group();
  const { standHeight: H, standWidth: W } = TRAY, t = 0.014, half = W / 2;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, box, m.brass, [sx * half, H / 2, sz * half], [t, H, t]);
  for (const y of [t / 2, H - t / 2]) for (const s of [-1, 1]) {
    add(g, box, m.brass, [0, y, s * half], [W + t, t, t]);
    add(g, box, m.brass, [s * half, y, 0], [t, t, W + t]);
  }
  return g;
}

// Small round terracotta-lacquer tray, gold rim, cream silk bow at the front, one flower sprig.
function buildTray(index, m) {
  const g = new THREE.Group(), R = TRAY.diameter / 2, rim = TRAY.rim;
  add(g, can, m.terracotta, [0, rim / 2, 0], [R, rim, R]);
  add(g, new THREE.TorusGeometry(R, 0.006, 8, 48).rotateX(Math.PI / 2), m.brass, [0, rim, 0], [1, 1, 1]);
  const ribbon = std('#fbf3df', 0.55);
  add(g, can, ribbon, [0, rim / 2, 0], [R + 0.002, 0.022, R + 0.002]);
  for (const s of [-1, 1]) add(g, sphere, ribbon, [s * 0.04, rim / 2, R + 0.012], [0.04, 0.026, 0.012]).rotation.z = s * 0.4;
  add(g, sphere, ribbon, [0, rim / 2, R + 0.016], [0.014, 0.014, 0.012]);
  ['#fff3d6', '#f6d77a', '#fff9ee'].forEach((color, i) =>
    add(g, sphere, std(color, 0.6), [R - 0.05 - i * 0.03, rim + 0.03 + (i % 2) * 0.012, -R + 0.07 + i * 0.03], [0.026, 0.022, 0.026]));

  const contents = new THREE.Group();
  contents.position.y = rim;
  CONTENTS[index](contents, m);
  g.add(contents);
  return g;
}

export function buildTrays(m) {
  const group = new THREE.Group();
  TRAYS.forEach(t => {
    const unit = new THREE.Group();
    const tray = buildTray(t.trap, m);
    tray.position.y = TRAY.standHeight;
    unit.add(buildStand(m), tray);
    unit.position.set(t.x, 0, t.z);
    group.add(unit);
  });
  return group;
}
