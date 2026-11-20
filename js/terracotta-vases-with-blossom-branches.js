import * as THREE from 'three';
import { VASES } from './scene-config.js';
import { orchidBloomGeometry } from './flower-geometries.js';

// Deterministic random so every visitor sees the same arrangement.
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function vaseGeometry(height, radius) {
  const profile = [[0.52, 0], [0.75, 0.1], [1, 0.48], [0.82, 0.74], [0.5, 0.86], [0.58, 1]]
    .map(([r, y]) => new THREE.Vector2(r * radius, y * height));
  return new THREE.LatheGeometry(profile, 32);
}

// One unglazed clay vase with airy bare branches in blossom and a few cream orchid sprays.
function buildVase(spec, index, mats, shared) {
  const group = new THREE.Group();
  const rand = seededRandom(index * 131 + 7);
  const vase = new THREE.Mesh(vaseGeometry(spec.height, spec.radius), mats.clay);
  vase.castShadow = vase.receiveShadow = true;
  group.add(vase);

  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const mouth = v(0, spec.height - 0.03, 0);
  const blossoms = [], orchids = [];
  const dummy = new THREE.Object3D();

  const branch = (start, dir, length, radius, depth) => {
    const mid = start.clone().add(dir.clone().multiplyScalar(length * 0.5)).add(v((rand() - 0.5) * 0.18, 0.05, (rand() - 0.5) * 0.12));
    const end = start.clone().add(dir.clone().multiplyScalar(length)).add(v((rand() - 0.5) * 0.2, 0, (rand() - 0.5) * 0.1));
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const twig = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, radius, 5), shared.bark);
    twig.castShadow = true;
    group.add(twig);
    for (let t = 0.25; t < 1; t += 0.07 + rand() * 0.06) {
      dummy.position.copy(curve.getPoint(t)).add(v((rand() - 0.5) * 0.04, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.04));
      dummy.scale.setScalar(0.016 + rand() * 0.012);
      dummy.updateMatrix();
      blossoms.push(dummy.matrix.clone());
    }
    if (depth > 0) for (let i = 0; i < 2; i++) {
      const fork = dir.clone().add(v((rand() - 0.5) * 1.1, rand() * 0.3, (rand() - 0.5) * 0.6)).normalize();
      branch(curve.getPoint(0.45 + rand() * 0.35), fork, length * 0.5, radius * 0.6, depth - 1);
    }
  };
  for (let i = 0; i < 7; i++) {
    const dir = v((rand() - 0.5) * 1.1, 1, (rand() - 0.3) * 0.5).normalize();
    branch(mouth, dir, 0.9 + rand() * 0.75, 0.011, 2);
  }

  // Orchid sprays arch out of the mouth and droop.
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1, reach = 0.35 + rand() * 0.25;
    const curve = new THREE.CatmullRomCurve3([
      mouth, mouth.clone().add(v(side * reach * 0.5, 0.25, 0.12)), mouth.clone().add(v(side * reach, 0.12, 0.2)),
      mouth.clone().add(v(side * reach * 1.2, -0.2 - rand() * 0.15, 0.24)),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.005, 5), shared.stem));
    for (let b = 0; b < 8; b++) {
      dummy.position.copy(curve.getPoint(0.35 + (b / 7) * 0.65)).add(v(0, -0.01, 0.014));
      dummy.rotation.set(0, 0, 0);
      dummy.lookAt(dummy.position.clone().add(v((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.3, 1)));
      dummy.scale.setScalar(1.3 - b * 0.05);
      dummy.updateMatrix();
      orchids.push(dummy.matrix.clone());
    }
  }

  const instanced = (geometry, material, matrices) => {
    const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.castShadow = true;
    return mesh;
  };
  group.add(instanced(shared.blossomGeo, shared.blossom, blossoms), instanced(shared.orchidGeo, shared.orchid, orchids));
  group.position.set(spec.x, 0, spec.z);
  group.scale.setScalar(spec.scale);
  return group;
}

export function buildVases(mats) {
  const shared = {
    bark: new THREE.MeshStandardMaterial({ color: '#5a4636', roughness: 0.9 }),
    stem: new THREE.MeshStandardMaterial({ color: '#6c8c4e', roughness: 0.8 }),
    blossom: new THREE.MeshStandardMaterial({ color: '#fff4e2', roughness: 0.7 }),
    orchid: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: THREE.DoubleSide }),
    blossomGeo: new THREE.IcosahedronGeometry(1, 1),
    orchidGeo: orchidBloomGeometry(),
  };
  const group = new THREE.Group();
  VASES.forEach((spec, i) => group.add(buildVase(spec, i, mats, shared)));
  return group;
}
