// Generates the builder's dimension drawing (front elevation + plan) as SVG
// from the same config the 3D scene uses.  Run: node tools/generate-dimension-drawing.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import {
  COLORS, BACKDROP, BACKDROP_HALF_WIDTH, LETTERING, TRAY, TRAYS, TRAP_NAMES, VASES, FLOWER_STRIP, screenCenterX,
} from '../js/scene-config.js';

const S = 100;                       // pixels per metre
const W = 1500, H = 1130, CX = W / 2;
const GROUND = 520;                  // elevation ground line (px)
const PLAN_WALL = 800;               // plan: y of the rear wall face (px)
const INK = '#3d2b24', DIM = '#8a3f2c';
const fmt = n => n.toFixed(2).replace('.', ',');

const out = [];
const add = s => out.push(s);
const ex = x => CX + x * S, ey = y => GROUND - y * S;       // elevation coords
const pz = d => PLAN_WALL + d * S;                           // plan: distance in front of wall
const rect = (x, y, w, h, fill, extra = '') => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="1" ${extra}/>`);
const text = (x, y, t, size = 13, anchor = 'middle', fill = INK, extra = '') => add(`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" ${extra}>${t}</text>`);
const line = (x1, y1, x2, y2, color = DIM, w = 1) => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}"/>`);

// Horizontal / vertical dimension lines with end ticks and a centred label.
function dimH(x1, x2, y, label) {
  line(x1, y, x2, y); line(x1, y - 5, x1, y + 5); line(x2, y - 5, x2, y + 5);
  text((x1 + x2) / 2, y - 5, label, 12, 'middle', DIM);
}
function dimV(x, y1, y2, label, side = 1) {
  line(x, y1, x, y2); line(x - 5, y1, x + 5, y1); line(x - 5, y2, x + 5, y2);
  text(x + side * 8, (y1 + y2) / 2 + 4, label, 12, side > 0 ? 'start' : 'end', DIM);
}

add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`);
add(`<rect width="${W}" height="${H}" fill="#fffdf7"/>`);
text(40, 36, 'Phông Lễ Ăn Hỏi Khiêm &amp; Huyền: bản vẽ kích thước', 20, 'start', INK, 'font-weight="700"');
text(40, 56, 'Đơn vị: mét. Tỉ lệ 1 m = 100 px. Kích thước lấy từ mô hình 3D; cần kiểm tra lại tại hiện trường.', 12, 'start', '#6b5a52');

// ---------- Front elevation ----------
text(40, 86, 'Mặt đứng chính diện', 15, 'start', INK, 'font-weight="700"');
const { wall, panel, screens } = BACKDROP;
rect(ex(-wall.width / 2), ey(wall.height), wall.width * S, wall.height * S, COLORS.wall);
screens.forEach((s, i) => [-1, 1].forEach(side => {
  const x = ex(side * screenCenterX(i) - s.width / 2);
  rect(x, ey(s.height), s.width * S, s.height * S, COLORS.cream, 'stroke-dasharray="none"');
  add(`<circle cx="${x + s.width * S / 2}" cy="${ey(s.height * 0.64)}" r="${BACKDROP.lattice.medallionRadius * S}" fill="none" stroke="${INK}" stroke-width="0.8"/>`);
  if (side > 0) text(x + s.width * S / 2, ey(s.height) - 6, fmt(s.height), 12, 'middle', DIM);
}));
rect(ex(-panel.width / 2), ey(panel.height), panel.width * S, panel.height * S, COLORS.butter);
const inset = panel.inlayInset * S;
add(`<rect x="${ex(-panel.width / 2) + inset}" y="${ey(panel.height) + inset}" width="${panel.width * S - inset * 2}" height="${panel.height * S - inset * 2}" fill="none" stroke="${COLORS.terracotta}" stroke-width="1.5"/>`);
text(CX, ey(LETTERING.seal.y) + 7, '囍', 20, 'middle', COLORS.brass);
LETTERING.lines.forEach(l => text(CX, ey(l.y) + l.cap * S * 0.35, l.text.replace('&', '&amp;'), l.cap * S / 0.7, 'middle', '#8f7443', 'font-family="Georgia, serif"'));
// flower strip, vases, trays
[-1, 1].forEach(side => {
  const x0 = Math.min(side * FLOWER_STRIP.from, side * FLOWER_STRIP.to);
  rect(ex(x0), ey(FLOWER_STRIP.height), (FLOWER_STRIP.to - FLOWER_STRIP.from) * S, FLOWER_STRIP.height * S, '#f6e6a8', 'opacity="0.7"');
});
VASES.forEach(v => {
  const h = v.height * v.scale, r = v.radius * v.scale;
  add(`<ellipse cx="${ex(v.x)}" cy="${ey(h / 2)}" rx="${r * S}" ry="${h * S / 2}" fill="#c06a4c" stroke="${INK}"/>`);
});
TRAYS.forEach(t => {
  const x = ex(t.x), w = TRAY.standWidth * S, d = TRAY.diameter * S;
  add(`<rect x="${x - w / 2}" y="${ey(TRAY.standHeight)}" width="${w}" height="${TRAY.standHeight * S}" fill="none" stroke="${COLORS.brass}" stroke-width="1.5"/>`);
  rect(x - d / 2, ey(TRAY.standHeight + TRAY.rim), d, TRAY.rim * S, COLORS.terracotta);
});
line(40, GROUND, W - 40, GROUND, INK, 1.5);
// elevation dimensions
dimH(ex(-wall.width / 2), ex(wall.width / 2), GROUND + 34, `tường sau ${fmt(wall.width)}`);
dimH(ex(-BACKDROP_HALF_WIDTH), ex(BACKDROP_HALF_WIDTH), GROUND + 62, `cụm bình phong ${fmt(BACKDROP_HALF_WIDTH * 2)}`);
dimH(ex(-panel.width / 2), ex(panel.width / 2), ey(panel.height) - 14, `tấm tên ${fmt(panel.width)}`);
dimH(ex(screenCenterX(0) - screens[0].width / 2), ex(screenCenterX(0) + screens[0].width / 2), ey(1.2), fmt(screens[0].width));
dimV(ex(-wall.width / 2) - 22, ey(wall.height), GROUND, fmt(wall.height), -1);
dimV(ex(wall.width / 2) + 120, ey(panel.height), GROUND, `tấm tên ${fmt(panel.height)}`);
const lowest = LETTERING.lines.at(-1), textBottom = lowest.y - lowest.cap * 0.7;
dimV(ex(panel.width / 2) - 16, ey(textBottom), GROUND, `mép dưới chữ ${fmt(textBottom)}`, -1);
dimV(ex(-TRAY.lastX) + 48, ey(TRAY.standHeight), GROUND, `giá ${fmt(TRAY.standHeight)}`);

// ---------- Plan ----------
text(40, 720, 'Mặt bằng (nhìn từ trên, khách đứng phía dưới)', 15, 'start', INK, 'font-weight="700"');
rect(ex(-wall.width / 2), PLAN_WALL - 10, wall.width * S, 10, COLORS.wall);
rect(ex(-panel.width / 2), pz(panel.offset) - 6, panel.width * S, 6, COLORS.butter);
screens.forEach((s, i) => [-1, 1].forEach(side => rect(ex(side * screenCenterX(i) - s.width / 2), pz(s.offset) - 3, s.width * S, 3, COLORS.cream)));
[-1, 1].forEach(side => {
  const x0 = Math.min(side * FLOWER_STRIP.from, side * FLOWER_STRIP.to);
  rect(ex(x0), pz(0.3), (FLOWER_STRIP.to - FLOWER_STRIP.from) * S, FLOWER_STRIP.depth * S, '#f6e6a8', 'opacity="0.7"');
});
VASES.forEach(v => add(`<circle cx="${ex(v.x)}" cy="${pz(v.z - BACKDROP.z)}" r="${v.radius * v.scale * S}" fill="#c06a4c" stroke="${INK}"/>`));
TRAYS.forEach(t => {
  const x = ex(t.x), y = pz(TRAY.rowOffset);
  add(`<circle cx="${x}" cy="${y}" r="${TRAY.diameter * S / 2}" fill="${COLORS.terracotta}" stroke="${INK}"/>`);
  text(x, y + 38, TRAP_NAMES[t.trap], 11);
  text(x, y + 52, fmt(Math.abs(t.x)), 11, 'middle', DIM);
});
text(CX, pz(TRAY.rowOffset) + 5, 'vị trí cô dâu chú rể', 12, 'middle', '#6b5a52');
line(CX, PLAN_WALL - 30, CX, pz(TRAY.rowOffset) + 80, '#b9a99f', 1);
text(CX + 6, PLAN_WALL - 20, 'trục giữa', 11, 'start', '#6b5a52');
dimV(ex(wall.width / 2) + 120, PLAN_WALL, pz(TRAY.rowOffset), `tráp cách tường ${fmt(TRAY.rowOffset)}`);
dimH(ex(-TRAY.firstX), ex(TRAY.firstX), pz(TRAY.rowOffset) + 78, `khoảng giữa hai nhóm (tâm tới tâm) ${fmt(TRAY.firstX * 2)}`);
text(40, pz(TRAY.rowOffset) + 120, 'Số dưới mỗi tráp: khoảng cách từ tâm tráp tới trục giữa. Tấm tên nhô ' + Math.round(panel.offset * 100) +
  ' cm, bình phong nhô ' + screens.map(s => Math.round(s.offset * 100)).join(' / ') + ' cm so với tường sau (từ giữa ra).', 12, 'start', '#6b5a52');
add('</svg>');

mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
const target = new URL('../docs/ban-ve-kich-thuoc-phong-le-an-hoi.svg', import.meta.url);
writeFileSync(target, out.join('\n'));
console.log('wrote', target.pathname);
