import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// All flower heads face +z so they can be aimed with Object3D.lookAt().

// Pastel rose: three nested petal cups.
export function roseGeometry() {
  const cups = [[0.018, 0.03, 0.05], [0.032, 0.046, 0.04], [0.048, 0.058, 0.028]].map(([r0, r1, h], i) => {
    const profile = [new THREE.Vector2(0.004, 0), new THREE.Vector2(r0, h * 0.35), new THREE.Vector2(r1, h)];
    return new THREE.LatheGeometry(profile, 10).rotateY(i * 0.7);
  });
  return mergeGeometries(cups).rotateX(Math.PI / 2);
}

function paintedDisc(sx, sy, offsetY, rotation, zLift, color) {
  const geo = new THREE.CircleGeometry(1, 12).scale(sx, sy, 1).translate(0, offsetY, zLift).rotateZ(rotation);
  const c = new THREE.Color(color);
  const colors = new Float32Array(geo.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) c.toArray(colors, i);
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

// Phalaenopsis orchid bloom: 3 narrow sepals, 2 broad petals, magenta lip.
export function orchidBloomGeometry() {
  const white = '#ffffff', blush = '#ffe6ef';
  const parts = [
    ...[0, 2.09, 4.19].map(a => paintedDisc(0.015, 0.03, 0.028, a, 0, blush)),
    paintedDisc(0.028, 0.027, 0.026, Math.PI / 2, 0.003, white),
    paintedDisc(0.028, 0.027, 0.026, -Math.PI / 2, 0.003, white),
    paintedDisc(0.011, 0.014, 0.01, Math.PI, 0.007, '#d83f87'),
    paintedDisc(0.005, 0.005, 0, 0, 0.01, '#ffd24a'),
  ];
  return mergeGeometries(parts);
}

// Anthurium: glossy heart-shaped spathe, slightly cupped.
export function anthuriumSpatheGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.09);
  s.bezierCurveTo(0.09, -0.03, 0.085, 0.07, 0.03, 0.06);
  s.bezierCurveTo(0.012, 0.055, 0, 0.04, 0, 0.03);
  s.bezierCurveTo(0, 0.04, -0.012, 0.055, -0.03, 0.06);
  s.bezierCurveTo(-0.085, 0.07, -0.09, -0.03, 0, -0.09);
  const geo = new THREE.ShapeGeometry(s, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, 3.2 * pos.getX(i) ** 2);
  geo.computeVertexNormals();
  return geo;
}

export function anthuriumSpadixGeometry() {
  return new THREE.CylinderGeometry(0.005, 0.008, 0.07, 6).translate(0, 0.035, 0).rotateX(1.0).translate(0, 0.022, 0);
}

// Unit-length stem along +z; scale z to the needed length.
export function stemGeometry() {
  return new THREE.CylinderGeometry(0.005, 0.005, 1, 5).translate(0, 0.5, 0).rotateX(Math.PI / 2);
}

export function foliageGeometry() {
  return new THREE.IcosahedronGeometry(1, 1);
}
