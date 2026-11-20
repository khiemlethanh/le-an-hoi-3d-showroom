import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TENT, SEATING } from './scene-config.js';

const { halfWidth: HW, zBack, zFront, eaveHeight: EAVE, ridgeHeight: RIDGE } = TENT;
const LENGTH = zFront - zBack, ZMID = (zFront + zBack) / 2;

function mesh(geometry, material, x = 0, y = 0, z = 0, shadows = true) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = shadows; m.receiveShadow = shadows;
  return m;
}

function buildFloor(group, mats) {
  const floor = mesh(new THREE.BoxGeometry(HW * 2 + 0.6, 0.06, LENGTH + 0.6), mats.floor, 0, -0.03, ZMID);
  floor.castShadow = false;
  const runner = mesh(new THREE.PlaneGeometry(1.6, 9.4).rotateX(-Math.PI / 2), mats.runner, 0, 0.004, 4.1);
  runner.castShadow = false;

  group.add(floor, runner);
}

function buildFrameAndRoof(group, mats) {
  const postGeo = new THREE.BoxGeometry(0.12, EAVE, 0.12);
  const slope = Math.hypot(HW, RIDGE - EAVE), tilt = Math.atan2(RIDGE - EAVE, HW);
  const rafterGeo = new THREE.BoxGeometry(slope, 0.08, 0.08);
  // Gathered voile curtain tied at each post.
  const drapeProfile = [[0.34, EAVE], [0.26, 3.4], [0.09, 1.7], [0.13, 0.9], [0.24, 0.02]].map(([r, y]) => new THREE.Vector2(r, y));
  const drapeGeo = new THREE.LatheGeometry(drapeProfile, 14);
  for (let i = 0; i < 4; i++) {
    const z = zBack + (LENGTH * i) / 3;
    for (const side of [-1, 1]) {
      group.add(mesh(postGeo, mats.frame, side * HW, EAVE / 2, z));
      const rafter = mesh(rafterGeo, mats.frame, (side * HW) / 2, (EAVE + RIDGE) / 2, z);
      rafter.rotation.z = -side * tilt;
      group.add(rafter, mesh(drapeGeo, mats.voile, side * HW, 0, z, false));
      group.add(mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 20).rotateX(Math.PI / 2), mats.brass, side * HW, 1.7, z));
    }
  }
  const beamGeo = new THREE.BoxGeometry(0.1, 0.1, LENGTH);
  group.add(mesh(beamGeo, mats.frame, -HW, EAVE, ZMID), mesh(beamGeo, mats.frame, HW, EAVE, ZMID), mesh(beamGeo, mats.frame, 0, RIDGE, ZMID));

  // Sun-lit canvas roof: glows softly and lets the sun through (no shadow).
  const z0 = zBack - 0.3, z1 = zFront + 0.3, e = HW + 0.35, ey = EAVE - 0.03, ry = RIDGE + 0.06;
  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, ry, z0, 0, ry, z1, -e, ey, z0, -e, ey, z1, e, ey, z0, e, ey, z1], 3));
  roofGeo.setIndex([0, 2, 1, 1, 2, 3, 0, 1, 4, 1, 5, 4]);
  roofGeo.computeVertexNormals();
  group.add(mesh(roofGeo, mats.roof, 0, 0, 0, false));
  // Sheer wall behind the backdrop.
  group.add(mesh(new THREE.PlaneGeometry(HW * 2, EAVE), mats.voile, 0, EAVE / 2, zBack + 0.1, false));
}

// Voile swags from ridge to eaves; returns the per-frame breeze animation.
function buildVoileCeiling(group, mats) {
  const strips = [];
  for (const side of [-1, 1]) for (let k = 0; k < 10; k++) {
    const geo = new THREE.PlaneGeometry(1, 1, 24, 3);
    group.add(mesh(geo, mats.voile, 0, 0, 0, false));
    strips.push({ geo, side, k, z0: zBack + 0.35 + k * 1.6, sag: 0.5 + 0.22 * ((k * 7 + (side > 0 ? 1 : 0)) % 3) });
  }
  return time => strips.forEach(({ geo, side, k, z0, sag }) => {
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i), w = uv.getY(i), arc = Math.sin(Math.PI * u);
      const breeze = 0.06 * Math.sin(time * 1.1 + u * 5 + k * 1.7) * arc + 0.03 * Math.sin(time * 0.7 + w * 3 + k) * arc;
      pos.setXYZ(i, side * (0.12 + u * (HW - 0.3)), RIDGE - 0.15 - (RIDGE - EAVE) * u - sag * arc + breeze,
        z0 + w * 1.25 + 0.1 * arc * Math.sin(time * 0.5 + k));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
}

function buildSeating(group, mats) {
  const part = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const legs = [-1, 1].flatMap(sx => [-1, 1].map(sz => part(0.03, 0.45, 0.03, sx * 0.19, 0.225, sz * 0.19)));
  const chairGeo = mergeGeometries([part(0.44, 0.04, 0.44, 0, 0.46, 0), part(0.44, 0.5, 0.03, 0, 0.73, 0.205), ...legs]);
  const sashGeo = part(0.46, 0.1, 0.05, 0, 0.82, 0.2);
  const count = SEATING.cols * SEATING.rows * 2;
  const chairs = new THREE.InstancedMesh(chairGeo, mats.chair, count);
  const sashes = new THREE.InstancedMesh(sashGeo, mats.terracotta, count);
  const m = new THREE.Matrix4();
  let n = 0;
  for (const side of [-1, 1]) for (let c = 0; c < SEATING.cols; c++) for (let r = 0; r < SEATING.rows; r++) {
    m.makeTranslation(side * (SEATING.x0 + c * SEATING.dx), 0, SEATING.z0 + r * SEATING.dz);
    chairs.setMatrixAt(n, m); sashes.setMatrixAt(n++, m);
  }
  chairs.castShadow = chairs.receiveShadow = true;
  group.add(chairs, sashes);
}

function buildGarden(group, mats) {
  const ground = mesh(new THREE.CircleGeometry(140, 48).rotateX(-Math.PI / 2), mats.grass, 0, -0.06, 0);
  ground.castShadow = false;
  group.add(ground, mesh(new THREE.BoxGeometry(26, 2.4, 1.2), mats.leaf, 0, 1.2, zBack - 2.2));
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.25, 3, 8).translate(0, 1.5, 0), mats.trunk, 36);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.2, 1).translate(0, 4.4, 0), mats.leaf, 36);
  const d = new THREE.Object3D();
  for (let i = 0; i < 36; i++) {
    const a = i * 2.399, radius = 17 + ((i * 37) % 30);
    d.position.set(Math.cos(a) * radius * 1.2, 0, 1 + Math.sin(a) * radius);
    d.scale.setScalar(0.8 + ((i * 13) % 10) / 12);
    d.updateMatrix();
    trunks.setMatrixAt(i, d.matrix); crowns.setMatrixAt(i, d.matrix);
  }
  trunks.castShadow = crowns.castShadow = true;
  group.add(trunks, crowns);
}

export function buildTent(mats) {
  const group = new THREE.Group();
  buildFloor(group, mats);
  buildFrameAndRoof(group, mats);
  buildSeating(group, mats);
  buildGarden(group, mats);
  return { group, update: buildVoileCeiling(group, mats) };
}
