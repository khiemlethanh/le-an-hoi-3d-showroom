import * as THREE from 'three';
import { PEDESTALS, PEDESTAL_RADIUS } from './scene-config.js';

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

// Seven traditional offerings, one builder per tray (index matches TRAP_NAMES).
const CONTENTS = [
  (g) => { // betel leaves and areca nuts
    const nut = std('#6fa544'), leafMat = std('#3f7d3a', 0.7);
    ring(8, 0.15, (x, z) => add(g, sphere, leafMat, [x, 0.012, z], [0.07, 0.008, 0.05]).rotation.y = Math.atan2(-z, x));
    ring(7, 0.1, (x, z) => add(g, sphere, nut, [x, 0.05, z], [0.034, 0.046, 0.034]));
    ring(3, 0.045, (x, z) => add(g, sphere, nut, [x, 0.115, z], [0.034, 0.046, 0.034]));
  },
  (g, m) => { // tea tins
    const tin = std('#c9202c', 0.3);
    const place = (x, y, z) => { add(g, can, tin, [x, y, z], [0.05, 0.1, 0.05]); add(g, can, m.gold, [x, y + 0.055, z], [0.051, 0.012, 0.051]); };
    ring(6, 0.125, (x, z) => place(x, 0.05, z));
    place(0, 0.05, 0); place(0, 0.165, 0);
  },
  (g, m) => { // wine bottles
    ring(3, 0.085, (x, z) => {
      add(g, can, m.lacquer, [x, 0.085, z], [0.04, 0.17, 0.04]);
      add(g, can, m.lacquer, [x, 0.2, z], [0.015, 0.07, 0.015]);
      add(g, can, m.gold, [x, 0.24, z], [0.018, 0.03, 0.018]);
    });
  },
  (g) => { // green rice cakes stacked as a pyramid
    const cake = std('#7fb24f', 0.7), band = std('#c9202c');
    [[3, 0.03], [2, 0.09], [1, 0.15]].forEach(([n, y]) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = (i - (n - 1) / 2) * 0.1, z = (j - (n - 1) / 2) * 0.1;
        add(g, box, cake, [x, y, z], [0.09, 0.055, 0.09]);
        add(g, box, band, [x, y, z], [0.092, 0.057, 0.014]);
      }
    });
  },
  (g) => { // fruit
    const fruits = ['#f29d2e', '#d83a3a', '#f6d44b', '#8fc04e', '#f08a5b'].map(c => std(c, 0.45));
    ring(7, 0.125, (x, z, i) => add(g, sphere, fruits[i % 5], [x, 0.05, z], [0.05, 0.05, 0.05]));
    ring(4, 0.065, (x, z, i) => add(g, sphere, fruits[(i + 2) % 5], [x, 0.125, z], [0.048, 0.048, 0.048]));
    add(g, sphere, fruits[1], [0, 0.2, 0], [0.045, 0.045, 0.045]);
  },
  (g, m) => { // red sticky rice dome with a gold mark
    add(g, new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#e2531f', 0.85), [0, 0, 0], [0.17, 0.13, 0.17]);
    add(g, can, m.gold, [0, 0.13, 0], [0.035, 0.006, 0.035]);
  },
  (g) => { // husband-and-wife cakes in pastel boxes
    const mats = [std('#f7b6c9'), std('#f8e7a4'), std('#b9dba0')];
    [[0, 0.03, 4, 0.11], [0.4, 0.09, 4, 0.075], [0.8, 0.15, 1, 0]].forEach(([rot, y, n, r], layer) =>
      ring(n, r, (x, z, i) => add(g, box, mats[(i + layer) % 3], [x, y, z], [0.085, 0.055, 0.085]).rotation.y = rot));
  },
];

// Lacquer tray + offerings + clear acrylic (mica) cover with a silk bow.
function buildTrap(index, m) {
  const g = new THREE.Group();
  add(g, can, m.lacquer, [0, 0.045, 0], [0.25, 0.09, 0.25]);
  const rimGeo = new THREE.TorusGeometry(0.25, 0.008, 8, 48).rotateX(Math.PI / 2);
  add(g, rimGeo, m.gold, [0, 0.09, 0], [1, 1, 1]);
  add(g, rimGeo, m.gold, [0, 0.004, 0], [1, 1, 1]);

  const contents = new THREE.Group();
  contents.position.y = 0.09;
  CONTENTS[index](contents, m);
  g.add(contents);

  // Alternate round and hexagonal covers for a modern mix.
  const sides = index % 2 ? 6 : 40;
  const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.232, 0.232, 0.34, sides, 1, true), m.mica);
  cover.position.y = 0.26;
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.232, sides).rotateX(-Math.PI / 2), m.mica);
  lid.position.y = 0.43;
  lid.rotation.y = cover.rotation.y = sides === 6 ? Math.PI / 6 : 0;
  g.add(cover, lid);
  add(g, new THREE.TorusGeometry(0.232, 0.005, 6, sides).rotateX(Math.PI / 2), m.silver, [0, 0.43, 0], [1, 1, 1]).rotation.y = lid.rotation.y;

  for (const s of [-1, 1]) add(g, sphere, m.lacquer, [s * 0.04, 0.45, 0], [0.04, 0.02, 0.026]).rotation.z = s * 0.35;
  add(g, sphere, m.gold, [0, 0.448, 0], [0.014, 0.014, 0.014]);
  return g;
}

export function buildPedestals(m) {
  const group = new THREE.Group();
  const bandGeo = new THREE.TorusGeometry(PEDESTAL_RADIUS + 0.002, 0.01, 8, 64).rotateX(Math.PI / 2);
  PEDESTALS.forEach(p => {
    const stand = new THREE.Group();
    const column = add(stand, new THREE.CylinderGeometry(PEDESTAL_RADIUS, PEDESTAL_RADIUS, p.height, 48), m[p.color], [0, p.height / 2, 0], [1, 1, 1]);
    column.receiveShadow = true;
    add(stand, bandGeo, m.silver, [0, p.height - 0.03, 0], [1, 1, 1]);
    add(stand, bandGeo, m.silver, [0, 0.03, 0], [1, 1, 1]);
    const trap = buildTrap(p.trap, m);
    trap.position.y = p.height;
    stand.add(trap);
    stand.position.set(p.x, 0, p.z);
    group.add(stand);
  });
  return group;
}
