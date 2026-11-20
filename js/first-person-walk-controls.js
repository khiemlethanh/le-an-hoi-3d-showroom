import { WALK_BOUNDS, PEDESTALS, PEDESTAL_RADIUS, SEATING, TENT } from './scene-config.js';

const EYE_HEIGHT = 1.6, BODY_RADIUS = 0.3, WALK_SPEED = 2.6, RUN_SPEED = 5, TURN_SPEED = 1.6;
const LOOK_SENSITIVITY = 0.0042, PITCH_LIMIT = 1.1, JOYSTICK_RANGE = 50;

// Obstacles: pedestals, tent posts (circles) and the two seating blocks (boxes).
function buildColliders() {
  const circles = PEDESTALS.map(p => ({ x: p.x, z: p.z, r: PEDESTAL_RADIUS }));
  for (let i = 0; i < 4; i++) for (const side of [-1, 1]) {
    circles.push({ x: side * TENT.halfWidth, z: TENT.zBack + ((TENT.zFront - TENT.zBack) * i) / 3, r: 0.2 });
  }
  const xEnd = SEATING.x0 + (SEATING.cols - 1) * SEATING.dx + 0.3, zEnd = SEATING.z0 + (SEATING.rows - 1) * SEATING.dz + 0.35;
  const boxes = [-1, 1].map(side => ({
    x0: Math.min(side * (SEATING.x0 - 0.3), side * xEnd), x1: Math.max(side * (SEATING.x0 - 0.3), side * xEnd),
    z0: SEATING.z0 - 0.3, z1: zEnd,
  }));
  return { circles, boxes };
}

export function createWalkControls(camera, dom, joystickEl, start) {
  const { circles, boxes } = buildColliders();
  const state = { x: start.x, z: start.z, yaw: start.yaw, pitch: start.pitch };
  const keys = new Set();
  const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const look = { id: null, x: 0, y: 0 };
  let target = null;
  camera.rotation.order = 'YXZ';

  const isFree = (x, z) => {
    const b = WALK_BOUNDS, R = BODY_RADIUS;
    if (x < b.xMin || x > b.xMax || z < b.zMin || z > b.zMax) return false;
    if (circles.some(c => Math.hypot(x - c.x, z - c.z) < c.r + R)) return false;
    return !boxes.some(q => x > q.x0 - R && x < q.x1 + R && z > q.z0 - R && z < q.z1 + R);
  };
  // Move one axis at a time so the visitor slides along obstacles.
  const tryMove = (dx, dz) => {
    if (isFree(state.x + dx, state.z)) state.x += dx;
    if (isFree(state.x, state.z + dz)) state.z += dz;
  };

  const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  window.addEventListener('keydown', e => {
    if (!MOVE_KEYS.includes(e.code) && !e.code.startsWith('Shift')) return;
    keys.add(e.code); target = null;
    if (e.code.startsWith('Arrow')) e.preventDefault();
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  const setJoystick = (dx, dy) => {
    const len = Math.hypot(dx, dy) || 1, k = Math.min(len, JOYSTICK_RANGE) / len;
    joy.x = (dx * k) / JOYSTICK_RANGE; joy.y = (dy * k) / JOYSTICK_RANGE;
    joystickEl.firstElementChild.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
  };
  dom.addEventListener('pointerdown', e => {
    dom.setPointerCapture(e.pointerId);
    target = null;
    // Touch on the left side drives the joystick; everything else looks around.
    if (e.pointerType === 'touch' && joy.id === null && e.clientX < window.innerWidth * 0.42) {
      Object.assign(joy, { id: e.pointerId, ox: e.clientX, oy: e.clientY });
      joystickEl.style.left = `${e.clientX}px`; joystickEl.style.top = `${e.clientY}px`;
      joystickEl.classList.add('active');
      setJoystick(0, 0);
    } else if (look.id === null) {
      Object.assign(look, { id: e.pointerId, x: e.clientX, y: e.clientY });
      dom.classList.add('dragging');
    }
  });
  dom.addEventListener('pointermove', e => {
    if (e.pointerId === joy.id) setJoystick(e.clientX - joy.ox, e.clientY - joy.oy);
    if (e.pointerId !== look.id) return;
    // Drag "grabs" the scene: dragging right turns the view left.
    state.yaw += (e.clientX - look.x) * LOOK_SENSITIVITY;
    state.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.pitch + (e.clientY - look.y) * LOOK_SENSITIVITY));
    look.x = e.clientX; look.y = e.clientY;
  });
  const release = e => {
    if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joystickEl.classList.remove('active'); }
    if (e.pointerId === look.id) { look.id = null; dom.classList.remove('dragging'); }
  };
  dom.addEventListener('pointerup', release);
  dom.addEventListener('pointercancel', release);
  dom.addEventListener('wheel', e => {
    e.preventDefault(); target = null;
    const step = Math.max(-1.2, Math.min(1.2, -e.deltaY * 0.004));
    tryMove(-Math.sin(state.yaw) * step, -Math.cos(state.yaw) * step);
  }, { passive: false });

  function update(dt) {
    if (target) {
      // Glide to a preset viewpoint (ignores obstacles on the way).
      const k = 1 - Math.exp(-4 * dt);
      for (const key of ['x', 'z', 'yaw', 'pitch']) state[key] += (target[key] - state[key]) * k;
      if (Math.abs(target.x - state.x) + Math.abs(target.z - state.z) + Math.abs(target.yaw - state.yaw) < 0.005) target = null;
    } else {
      const has = (...codes) => codes.some(c => keys.has(c));
      const forward = (has('KeyW', 'ArrowUp') ? 1 : 0) - (has('KeyS', 'ArrowDown') ? 1 : 0) - joy.y;
      const strafe = (has('KeyD') ? 1 : 0) - (has('KeyA') ? 1 : 0) + joy.x;
      state.yaw += ((has('KeyQ', 'ArrowLeft') ? 1 : 0) - (has('KeyE', 'ArrowRight') ? 1 : 0)) * TURN_SPEED * dt;
      const speed = (has('ShiftLeft', 'ShiftRight') ? RUN_SPEED : WALK_SPEED) * dt;
      const sin = Math.sin(state.yaw), cos = Math.cos(state.yaw);
      tryMove((-sin * forward + cos * strafe) * speed, (-cos * forward - sin * strafe) * speed);
    }
    camera.position.set(state.x, EYE_HEIGHT, state.z);
    camera.rotation.set(state.pitch, state.yaw, 0);
  }

  function goTo(view) {
    // Take the shortest turn toward the preset heading.
    const turns = Math.round((state.yaw - view.yaw) / (Math.PI * 2));
    target = { x: view.x, z: view.z, yaw: view.yaw + turns * Math.PI * 2, pitch: view.pitch };
  }
  return { update, goTo };
}
