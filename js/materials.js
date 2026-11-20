import * as THREE from 'three';
import { COLORS } from './scene-config.js';

// Shared material library so every builder uses the same finishes.
export function makeMaterials() {
  const matte = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });
  const gloss = (color, extra = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1, ...extra });

  return {
    // Wall finishes (satin paint), double sided because walls are thin shells.
    cream: matte(COLORS.cream, { roughness: 0.55, side: THREE.DoubleSide }),
    butter: matte(COLORS.butter, { roughness: 0.55, side: THREE.DoubleSide }),
    pink: matte(COLORS.pink, { roughness: 0.55, side: THREE.DoubleSide }),

    silver: new THREE.MeshStandardMaterial({ color: COLORS.silver, metalness: 1, roughness: 0.16 }),
    gold: new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 1, roughness: 0.25 }),
    rose: gloss(COLORS.rose),
    lacquer: gloss(COLORS.lacquer, { roughness: 0.12 }),

    // LED strip: emissive far above the bloom threshold so only it glows.
    led: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: COLORS.led, emissiveIntensity: 10 }),
    // Soft light wash spilling out of the cove behind each wall edge.
    ledGlow: new THREE.MeshBasicMaterial({
      color: new THREE.Color(COLORS.led).multiplyScalar(0.45), vertexColors: true,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    }),

    mica: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.17,
      depthWrite: false, side: THREE.DoubleSide, clearcoat: 1,
    }),
    voile: matte(0xffffff, { roughness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.3, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }),
    roof: matte(0xffffff, { roughness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.25, side: THREE.DoubleSide }),
    frame: matte(0xfafafa, { roughness: 0.4 }),
    floor: matte('#f3ece0', { roughness: 0.32 }),
    stage: matte('#fbf7ef', { roughness: 0.4 }),
    runner: matte('#fbd3df', { roughness: 0.85 }),
    grass: matte('#9cc37a', { roughness: 1 }),
    leaf: matte('#5f8f4e', { roughness: 0.8 }),
    trunk: matte('#8a6b4f', { roughness: 0.9 }),
    chair: matte(0xffffff, { roughness: 0.45 }),
  };
}
