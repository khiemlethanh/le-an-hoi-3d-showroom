// Single source of truth for dimensions (metres), colours and layout.
// Both the 3D builders and the on-page construction spec panel read from here.

export const COLORS = {
  cream: '#f6efe2',
  butter: '#f7df8c',
  pink: '#f79dba',
  rose: '#ec7fa0',
  silver: '#dfe3e8',
  led: '#fff0d2',
  lacquer: '#b01320',
  gold: '#d9b45c',
};

export const COLOR_NAMES = { cream: 'Trắng kem', butter: 'Vàng bơ nhạt', pink: 'Hồng phấn tươi' };

export const TENT = { halfWidth: 9, zBack: -7, zFront: 9, eaveHeight: 4.6, ridgeHeight: 6.2 };

export const BACKDROP_Z = -4.6;   // world z of the main wall's front face
export const PANEL_DEPTH = 0.1;   // wall thickness
export const CORNER_R = 0.45;     // rounded top-corner radius

// Wavy wall layers. `z` is offset from BACKDROP_Z (positive = closer to guests),
// `top(x)` is the silhouette height, `bend(x)` curves the wall in plan view.
export const PANELS = [
  { name: 'Lớp nền sau (phải)', color: 'butter', x0: 0.8, x1: 6.6, z: -0.35,
    top: x => 4.0 + 0.6 * Math.sin((x - 2.2) * 0.75), bend: x => 0.2 * Math.sin(x * 0.6) },
  { name: 'Vách chính gắn chữ', color: 'cream', x0: -5.2, x1: 5.2, z: 0,
    top: x => 3.75 + 0.5 * Math.cos((x + 1.2) * 0.5), bend: x => 0.25 * (1 - Math.cos(x * 0.35)) },
  { name: 'Sóng lớn (trái)', color: 'butter', x0: -6.4, x1: -1.7, z: 0.4,
    top: x => 2.3 + Math.cos((x + 5.4) * 0.75), bend: x => 0.18 * Math.sin(x * 0.9 + 1) },
  { name: 'Sóng lớn (phải)', color: 'pink', x0: 1.9, x1: 6.2, z: 0.45,
    top: x => 2.0 + 0.85 * Math.sin((x - 3.2) * 0.85), bend: x => -0.16 * Math.sin(x * 0.8) },
  { name: 'Sóng thấp (trái)', color: 'pink', x0: -6.9, x1: -3.2, z: 0.85,
    top: x => 1.25 + 0.45 * Math.sin((x + 6.9) * 1.3 + 0.4), bend: x => 0.15 * Math.sin(x * 1.1) },
  { name: 'Sóng thấp (phải)', color: 'cream', x0: 3.6, x1: 6.8, z: 0.9,
    top: x => 1.05 + 0.4 * Math.cos((x - 3.6) * 1.2), bend: x => 0.14 * Math.cos(x) },
];

export const SIGNAGE = { text: 'LỄ ĂN HỎI', textY: 2.3, textWidth: 4.6, textHeight: 1.15, symbolY: 3.3, ringRadius: 0.62 };

// Front edge of the low stage (bulges toward the guests at the centre).
export const stageFrontZ = x => -(2.9 - 0.5 * (1 - (x / 7.6) ** 2));

const PEDESTAL_HEIGHTS = [0.75, 0.95, 0.85, 1.05, 0.85, 0.95, 0.75];
const PEDESTAL_COLORS = ['cream', 'pink', 'butter', 'cream', 'butter', 'pink', 'cream'];
export const TRAP_NAMES = ['Trầu cau', 'Trà', 'Rượu', 'Bánh cốm', 'Hoa quả', 'Xôi gấc', 'Bánh phu thê'];
export const PEDESTAL_RADIUS = 0.3;
export const PEDESTALS = PEDESTAL_HEIGHTS.map((height, i) => {
  const x = -3.9 + 1.3 * i;
  return { x, z: -1.5 + 0.05 * x * x, height, color: PEDESTAL_COLORS[i], trap: i };
});

// Free-form flower clusters: centre, ellipsoid radii, flower counts.
export const FLOWER_CLUSTERS = [
  { pos: [-5.0, 0.38, -3.25], r: [1.5, 0.45, 0.4], roses: 46, anth: 9, orchids: 5 },
  { pos: [5.1, 0.36, -3.2], r: [1.3, 0.4, 0.38], roses: 38, anth: 8, orchids: 4 },
  { pos: [-2.8, 1.95, -4.2], r: [0.7, 0.33, 0.25], roses: 22, anth: 5, orchids: 4 },
  { pos: [2.75, 1.7, -4.1], r: [0.65, 0.3, 0.25], roses: 18, anth: 4, orchids: 3 },
  { pos: [0.62, 3.74, -4.42], r: [0.32, 0.22, 0.15], roses: 10, anth: 3, orchids: 2 },
  { pos: [-0.62, 2.92, -4.44], r: [0.22, 0.16, 0.12], roses: 6, anth: 2, orchids: 1 },
  { pos: [-1.6, 0.26, -2.95], r: [0.5, 0.2, 0.25], roses: 14, anth: 3, orchids: 0 },
  { pos: [1.9, 0.26, -2.9], r: [0.5, 0.2, 0.25], roses: 14, anth: 3, orchids: 0 },
];

// Guest seating blocks (also used as walk colliders).
export const SEATING = { cols: 5, rows: 5, x0: 1.7, dx: 0.9, z0: 2.2, dz: 1.0 };

export const WALK_BOUNDS = { xMin: -11, xMax: 11, zMin: -2.2, zMax: 14 };

// yaw 0 looks at the backdrop (-z); positive yaw turns left.
export const VIEWPOINTS = [
  { name: 'Toàn cảnh', x: 0, z: 8.2, yaw: 0, pitch: 0.1 },
  { name: 'Chính diện', x: 0, z: 3.0, yaw: 0, pitch: 0.14 },
  { name: 'Cận chữ', x: 0, z: -0.4, yaw: 0, pitch: 0.3 },
  { name: 'Tráp lễ', x: -2.4, z: 0.7, yaw: -0.65, pitch: -0.28 },
  { name: 'Góc trái', x: -6.6, z: 1.2, yaw: -0.8, pitch: 0.12 },
  { name: 'Góc phải', x: 6.6, z: 1.2, yaw: 0.8, pitch: 0.12 },
  { name: 'Ngoài sân', x: 0, z: 13.5, yaw: 0, pitch: 0.1 },
];
