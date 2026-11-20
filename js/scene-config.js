// Single source of truth for dimensions (metres), colours and layout.
// The 3D builders, the on-page spec panel and the dimension drawing all read from here.

export const COLORS = {
  wall: '#f3e6bf',       // warm cream-yellow rear wall
  cream: '#f8f0da',      // lattice screens, stands' flowers
  butter: '#f3e2ad',     // central name panel
  terracotta: '#b5533c', // accent: inlay line, trays, vases
  brass: '#c4a263',
  led: '#ffcd6e',
};

export const TENT = { halfWidth: 9, zBack: -7, zFront: 9, eaveHeight: 4.6, ridgeHeight: 6.2 };

// Backdrop: flat rear wall, a tall central name panel, three lattice screens stepping down each side.
// `offset` = how far each piece stands in front of the rear wall.
export const BACKDROP = {
  z: -4.6,
  wall: { width: 9.4, height: 2.9 },
  panel: { width: 2.0, height: 3.4, offset: 0.28, frame: 0.03, inlayInset: 0.08, inlay: 0.015 },
  screens: [
    { width: 1.05, height: 3.1, offset: 0.2 },
    { width: 1.05, height: 2.7, offset: 0.12 },
    { width: 1.05, height: 2.3, offset: 0.05 },
  ],
  screenGap: 0.1,
  lattice: { cell: 0.26, strip: 0.028, frame: 0.06, medallionRadius: 0.36 },
};

// Centre x of the i-th screen on the right side (mirror for the left).
export const screenCenterX = i => {
  const { panel, screens, screenGap } = BACKDROP;
  return panel.width / 2 + screenGap + screens[0].width / 2 + i * (screens[0].width + screenGap);
};
export const BACKDROP_HALF_WIDTH = screenCenterX(BACKDROP.screens.length - 1) + BACKDROP.screens[0].width / 2;

// Lettering sits in the top part of the panel so the couple never covers it.
export const LETTERING = {
  seal: { y: 3.1, size: 0.22 },
  lines: [
    { text: 'Khiêm', y: 2.8, cap: 0.25 },
    { text: '& Huyền', y: 2.48, cap: 0.25 },
    { text: 'Lễ Ăn Hỏi', y: 2.19, cap: 0.09 },
  ],
  blockTop: 3.0, blockBottom: 2.05, blockWidth: 1.7, depth: 0.04,
};

// Nine small trays on equal-height brass stands, one straight row: 4 left, 5 right.
export const TRAP_NAMES = ['Trầu cau', 'Chè', 'Rượu', 'Bánh cốm', 'Bánh phu thê', 'Hoa quả', 'Mứt sen', 'Xôi gấc', 'Hộp quà'];
export const TRAY = { diameter: 0.36, rim: 0.08, standHeight: 0.75, standWidth: 0.3, rowOffset: 0.95, firstX: 1.45, lastX: 4.33 };
const spread = (count) => Array.from({ length: count }, (_, i) => TRAY.firstX + (i * (TRAY.lastX - TRAY.firstX)) / (count - 1));
export const TRAYS = [
  ...spread(4).map((x, i) => ({ x: -x, trap: i })),
  ...spread(5).map((x, i) => ({ x, trap: 4 + i })),
].map(t => ({ ...t, z: BACKDROP.z + TRAY.rowOffset }));

export const VASES = [
  { x: -5.25, scale: 1.1 },
  { x: 5.25, scale: 1.0 },
].map(v => ({ ...v, z: BACKDROP.z + 0.7, height: 0.9, radius: 0.27 }));

// Low flower strip along the foot of the screens (cream, yellow, a little terracotta).
export const FLOWER_STRIP = { height: 0.35, depth: 0.4, from: 1.25, to: BACKDROP_HALF_WIDTH };
export const FLOWER_CLUSTERS = [-1, 1].flatMap(side =>
  Array.from({ length: 9 }, (_, i) => ({
    pos: [side * (FLOWER_STRIP.from + i * 0.4), 0.17, BACKDROP.z + 0.5],
    r: [0.28, 0.19, 0.2], roses: 14, anth: 0, orchids: 0,
  })));

// Guest seating blocks (also used as walk colliders).
export const SEATING = { cols: 5, rows: 5, x0: 1.7, dx: 0.9, z0: 2.2, dz: 1.0 };

export const WALK_BOUNDS = { xMin: -11, xMax: 11, zMin: -3.85, zMax: 14 };

// yaw 0 looks at the backdrop (-z); positive yaw turns left.
export const VIEWPOINTS = [
  { name: 'Toàn cảnh', x: 0, z: 8.2, yaw: 0, pitch: 0.1 },
  { name: 'Chính diện', x: 0, z: 1.6, yaw: 0, pitch: 0.1 },
  { name: 'Cận tên', x: 0, z: -1.9, yaw: 0, pitch: 0.42 },
  { name: 'Tráp trái', x: -2.9, z: -2.1, yaw: 0, pitch: -0.3 },
  { name: 'Tráp phải', x: 2.9, z: -2.1, yaw: 0, pitch: -0.3 },
  { name: 'Góc trái', x: -6.4, z: 0.2, yaw: -0.85, pitch: 0.1 },
  { name: 'Góc phải', x: 6.4, z: 0.2, yaw: 0.85, pitch: 0.1 },
  { name: 'Ngoài sân', x: 0, z: 13.5, yaw: 0, pitch: 0.1 },
];
