import * as THREE from 'three';
import { COLORS } from './scene-config.js';

// Shared material library so every builder uses the same finishes.
export function makeMaterials() {
  const matte = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });

  return {
    wall: matte(COLORS.wall, { roughness: 0.8 }),
    cream: matte(COLORS.cream, { roughness: 0.55 }),
    butter: matte(COLORS.butter, { roughness: 0.6 }),
    // Lacquer / glazed terracotta accent.
    terracotta: new THREE.MeshPhysicalMaterial({ color: COLORS.terracotta, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    // Unglazed clay for the big vases.
    clay: matte('#c06a4c', { roughness: 0.9 }),
    brass: new THREE.MeshStandardMaterial({ color: COLORS.brass, metalness: 0.75, roughness: 0.36 }),
    // Opal sheet behind the lattice, lit from behind. Brightness is set per day/evening mode.
    backlight: new THREE.MeshBasicMaterial({ color: COLORS.led }),

    voile: matte(0xffffff, { roughness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.3, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }),
    roof: matte(0xffffff, { roughness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.25, side: THREE.DoubleSide }),
    frame: matte(0xfafafa, { roughness: 0.4 }),
    floor: matte('#f1e9da', { roughness: 0.35 }),
    runner: matte('#f6ecd0', { roughness: 0.85 }),
    grass: matte('#9cc37a', { roughness: 1 }),
    leaf: matte('#5f8f4e', { roughness: 0.8 }),
    trunk: matte('#8a6b4f', { roughness: 0.9 }),
    chair: matte(0xffffff, { roughness: 0.45 }),
  };
}
