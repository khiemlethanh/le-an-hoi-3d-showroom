import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { VIEWPOINTS } from './scene-config.js';
import { makeMaterials } from './materials.js';
import { buildBackdrop } from './backdrop-wave-panels.js';
import { buildSignage } from './backdrop-text-and-double-happiness.js';
import { buildFlowers } from './flower-clusters.js';
import { buildPedestals } from './pedestals-and-trap-gift-trays.js';
import { buildTent } from './tent-structure-and-voile-ceiling.js';
import { buildLighting } from './daylight-sky-and-led-lighting.js';
import { createWalkControls } from './first-person-walk-controls.js';
import { initUi } from './construction-spec-panel-and-toolbar.js';

// Only LED emissives exceed this HDR level, so sun-lit white walls never bloom.
const BLOOM_THRESHOLD = 4;

function start() {
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500);
  const mats = makeMaterials();
  const lighting = buildLighting(scene, renderer, mats);
  const tent = buildTent(mats);
  scene.add(tent.group, buildBackdrop(mats), buildFlowers(), buildPedestals(mats));
  buildSignage(mats).then(signage => scene.add(signage)).catch(err => console.error('Signage failed', err));

  // HDR + MSAA target so bloom can isolate the LEDs without losing antialiasing.
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.55, BLOOM_THRESHOLD);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.setPixelRatio(pixelRatio);
  bloom.strength = lighting.setMode('day');

  const controls = createWalkControls(camera, canvas, document.getElementById('joystick'), VIEWPOINTS[0]);
  initUi({
    onViewpoint: view => controls.goTo(view),
    onToggleEvening: evening => { bloom.strength = lighting.setMode(evening ? 'evening' : 'day'); },
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    // Widen the view on portrait phones so the whole backdrop still fits.
    camera.fov = w < h ? 78 : 62;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    controls.update(dt);
    tent.update(clock.elapsedTime);
    composer.render();
  });
  document.body.classList.add('ready');
}

try {
  start();
} catch (err) {
  console.error(err);
  const box = document.getElementById('load-error');
  box.hidden = false;
  box.textContent = 'Không khởi tạo được cảnh 3D. Hãy mở bằng trình duyệt hỗ trợ WebGL (Chrome, Safari, Edge bản mới).';
}
