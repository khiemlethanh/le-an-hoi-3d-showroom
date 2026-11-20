import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { COLORS } from './scene-config.js';

// Day = bright natural light; evening = dim sky so the backlit screens take over.
const MODES = {
  day: { skyTop: '#5fa8ee', skyBottom: '#eaf5ff', sun: 2.3, sunColor: '#fff1d8', hemi: 0.42, env: 0.35,
    wash: 0, glow: 1.0, roof: 0.55, voile: 0.3, exposure: 1.0, bloom: 0.35 },
  evening: { skyTop: '#0b1230', skyBottom: '#c9806a', sun: 0.1, sunColor: '#9fb4ff', hemi: 0.16, env: 0.12,
    wash: 3.2, glow: 1.5, roof: 0.01, voile: 0.01, exposure: 1.0, bloom: 0.5 },
};

function buildSkyDome() {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying float h;
      void main(){ gl_FragColor = vec4(mix(bottom, top, pow(clamp(h, 0.0, 1.0), 0.55)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), material);
}

export function buildLighting(scene, renderer, mats) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const sky = buildSkyDome();
  const hemi = new THREE.HemisphereLight(0xffffff, 0xe9dcc6, 0.7);
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(-7, 13, 10);
  sun.target.position.set(0, 1, -2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 45 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;

  // Warm fill standing in for the light spilling out of the backlit lattice screens.
  const washes = [-4.2, 0, 4.2].map(x => {
    const light = new THREE.PointLight(COLORS.led, 0, 10, 2);
    light.position.set(x, 2.2, -3.4);
    return light;
  });
  scene.add(sky, hemi, sun, sun.target, ...washes);

  const ledBase = new THREE.Color(COLORS.led);
  function setMode(name) {
    const m = MODES[name];
    sky.material.uniforms.top.value.set(m.skyTop);
    sky.material.uniforms.bottom.value.set(m.skyBottom);
    sun.intensity = m.sun; sun.color.set(m.sunColor);
    hemi.intensity = m.hemi;
    scene.environmentIntensity = m.env;
    washes.forEach(light => { light.intensity = m.wash; });
    mats.backlight.color.copy(ledBase).multiplyScalar(m.glow);
    mats.roof.emissiveIntensity = m.roof;
    mats.voile.emissiveIntensity = m.voile;
    renderer.toneMappingExposure = m.exposure;
    return m.bloom;
  }
  return { setMode };
}
