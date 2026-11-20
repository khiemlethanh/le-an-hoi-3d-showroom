import * as THREE from 'three';
import { FLOWER_CLUSTERS } from './scene-config.js';
import * as G from './flower-geometries.js';

// Mostly cream and butter yellow, with roughly one terracotta bloom in seven.
const ROSE_COLORS = ['#fff6e0', '#fbe7a8', '#f6d77a', '#fff9ee', '#f3c98b', '#c96a4a', '#fff1cf'];
const ANTH_COLORS = ['#ff86ad', '#ffffff', '#ff9f8f', '#ffc2d4'];
const LEAF_COLORS = ['#58894a', '#6f9c5a', '#86ad72', '#4d7a45'];

// Deterministic random so every visitor sees the same arrangement.
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Collects transforms, then emits one InstancedMesh (one draw call per flower type).
class InstanceBatch {
  constructor(geometry, material) { this.geometry = geometry; this.material = material; this.items = []; }
  add(dummy, color) { dummy.updateMatrix(); this.items.push([dummy.matrix.clone(), color]); }
  build() {
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.items.length);
    const c = new THREE.Color();
    this.items.forEach(([matrix, color], i) => {
      mesh.setMatrixAt(i, matrix);
      if (color) mesh.setColorAt(i, c.set(color));
    });
    mesh.castShadow = true;
    return mesh;
  }
}

export function buildFlowers() {
  const group = new THREE.Group();
  const petal = extra => new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide, ...extra });
  const batches = {
    rose: new InstanceBatch(G.roseGeometry(), petal()),
    leaf: new InstanceBatch(G.foliageGeometry(), petal({ roughness: 0.85, side: THREE.FrontSide })),
    orchid: new InstanceBatch(G.orchidBloomGeometry(), petal({ vertexColors: true, roughness: 0.5 })),
    spathe: new InstanceBatch(G.anthuriumSpatheGeometry(), new THREE.MeshPhysicalMaterial({ roughness: 0.18, clearcoat: 1, side: THREE.DoubleSide })),
    spadix: new InstanceBatch(G.anthuriumSpadixGeometry(), petal({ color: '#f3d98a' })),
    stem: new InstanceBatch(G.stemGeometry(), petal({ color: '#5d8c4a', side: THREE.FrontSide })),
  };
  const stemMaterial = batches.stem.material;
  const dummy = new THREE.Object3D();
  const v = (x, y, z) => new THREE.Vector3(x, y, z);

  FLOWER_CLUSTERS.forEach((cluster, index) => {
    const rand = seededRandom(index * 977 + 13);
    const pick = list => list[Math.floor(rand() * list.length)];
    const centre = v(...cluster.pos), radii = v(...cluster.r);
    // Random outward direction, biased to the visible (front/top) side.
    const direction = (minY) => {
      const a = rand() * Math.PI * 2, y = minY + rand() * (1 - minY);
      const s = Math.sqrt(Math.max(0, 1 - y * y));
      return v(Math.cos(a) * s, y, Math.abs(Math.sin(a)) * s * 1.1 - 0.1).normalize();
    };
    const onSurface = (dir, k) => centre.clone().add(dir.clone().multiply(radii).multiplyScalar(k));

    // Green base that the blooms sit on.
    for (let i = 0; i < cluster.roses * 1.1; i++) {
      dummy.position.copy(onSurface(direction(-0.3), 0.3 + rand() * 0.5));
      dummy.rotation.set(rand() * 3, rand() * 3, 0);
      dummy.scale.set(0.07 + rand() * 0.05, 0.05 + rand() * 0.04, 0.07 + rand() * 0.05);
      batches.leaf.add(dummy, pick(LEAF_COLORS));
    }
    for (let i = 0; i < cluster.roses; i++) {
      const dir = direction(-0.15);
      dummy.position.copy(onSurface(dir, 0.92 + rand() * 0.16));
      dummy.lookAt(dummy.position.clone().add(dir).add(v(0, 0.2, 0.5)));
      dummy.scale.setScalar(1.1 + rand() * 0.8);
      batches.rose.add(dummy, pick(ROSE_COLORS));
    }
    // Anthuriums stand proud of the cluster on thin stems.
    for (let i = 0; i < cluster.anth; i++) {
      const dir = direction(0.25);
      const root = onSurface(dir, 0.6), tip = onSurface(dir, 1.25).add(dir.clone().multiplyScalar(0.1));
      dummy.position.copy(root); dummy.lookAt(tip); dummy.scale.set(1, 1, root.distanceTo(tip));
      batches.stem.add(dummy);
      dummy.position.copy(tip);
      dummy.lookAt(tip.clone().add(v(dir.x * 0.6, 0.35, 1)));
      dummy.scale.setScalar(1.1 + rand() * 0.5);
      const color = pick(ANTH_COLORS);
      batches.spathe.add(dummy, color);
      batches.spadix.add(dummy);
    }
    // Orchid sprays arch up and out, with blooms along the outer two thirds.
    for (let i = 0; i < cluster.orchids; i++) {
      const dir = direction(0.3);
      const start = onSurface(dir, 0.6);
      const lateral = v(Math.sign(dir.x) || 1, 0, 0.3), size = 0.9 + rand() * 0.5;
      const pts = [[0, 0], [0.3, 0.15], [0.44, 0.4], [0.34, 0.66], [0.1, 0.84]].map(([up, out]) =>
        start.clone().add(v(0, up * size, 0)).add(lateral.clone().multiplyScalar(out * size)));
      const curve = new THREE.CatmullRomCurve3(pts);
      const spray = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.005, 5), stemMaterial);
      spray.castShadow = true;
      group.add(spray);
      for (let b = 0; b < 9; b++) {
        const p = curve.getPoint(0.32 + (b / 8) * 0.68);
        dummy.position.copy(p).add(v((rand() - 0.5) * 0.03, -0.012, 0.012));
        dummy.lookAt(dummy.position.clone().add(v((rand() - 0.5) * 0.7, (rand() - 0.5) * 0.4, 1)));
        dummy.rotateZ((rand() - 0.5) * 0.6);
        dummy.scale.setScalar(1.25 - b * 0.05);
        batches.orchid.add(dummy);
      }
    }
  });

  Object.values(batches).forEach(batch => { if (batch.items.length) group.add(batch.build()); });
  return group;
}
