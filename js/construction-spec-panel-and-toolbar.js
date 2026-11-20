import { PANELS, COLORS, COLOR_NAMES, TENT, PEDESTALS, PEDESTAL_RADIUS, TRAP_NAMES, SIGNAGE, VIEWPOINTS, PANEL_DEPTH } from './scene-config.js';
import { panelTop } from './backdrop-wave-panels.js';

const fmt = n => n.toFixed(2).replace('.', ',');

// Dimensions are measured from the same config the 3D scene is built from.
function panelRows() {
  return PANELS.map(p => {
    let max = 0, min = Infinity;
    for (let x = p.x0 + 0.5; x <= p.x1 - 0.5; x += 0.05) {
      const h = panelTop(p, x);
      max = Math.max(max, h); min = Math.min(min, h);
    }
    return `<tr><td>${p.name}</td><td><span class="swatch" style="background:${COLORS[p.color]}"></span>${COLOR_NAMES[p.color]}<br><code>${COLORS[p.color]}</code></td>
      <td>${fmt(p.x1 - p.x0)} m</td><td>${fmt(min)} – ${fmt(max)} m</td></tr>`;
  }).join('');
}

function specHtml() {
  const width = Math.max(...PANELS.map(p => p.x1)) - Math.min(...PANELS.map(p => p.x0));
  const pedestals = PEDESTALS.map((p, i) => `<li>Đôn ${i + 1}: cao ${fmt(p.height)} m, ${COLOR_NAMES[p.color].toLowerCase()} — tráp <b>${TRAP_NAMES[p.trap]}</b></li>`).join('');
  return `
  <h2>Thông số thi công</h2>
  <p class="note">Kích thước đo trực tiếp từ mô hình 3D. Vật liệu là gợi ý — đơn vị thi công cần kiểm tra lại theo mặt bằng và tải trọng thực tế.</p>
  <h3>1. Tổng thể</h3>
  <ul>
    <li>Rạp: ${TENT.halfWidth * 2} × ${TENT.zFront - TENT.zBack} m, cao mép ${fmt(TENT.eaveHeight)} m, cao đỉnh ${fmt(TENT.ridgeHeight)} m</li>
    <li>Phông nền: rộng tổng ${fmt(width)} m, 6 lớp vách lệch nhau 35–45 cm theo chiều sâu</li>
    <li>Bục sân khấu: 15,2 × 3,3–3,8 m, cao 12 cm, mép trước uốn cong, LED chân bục</li>
  </ul>
  <h3>2. Các lớp vách (từ sau ra trước)</h3>
  <table><thead><tr><th>Lớp</th><th>Màu</th><th>Rộng</th><th>Cao</th></tr></thead><tbody>${panelRows()}</tbody></table>
  <ul>
    <li>Vách dày ${PANEL_DEPTH * 100} cm: khung sắt hộp 20×20 uốn theo biên dạng, bọc PVC foam 5 mm hoặc MDF chống ẩm cắt CNC, sơn PU mờ</li>
    <li>Viền: nẹp inox gương / nẹp nhựa mạ bạc 20 mm chạy dọc mép vách</li>
    <li>LED hắt khe: LED dây 4000K 12V dán sau mép vách, lùi 3–5 cm; mỗi lớp một nguồn riêng</li>
    <li>Chân vách cần đối trọng hoặc bắt xuống bục; vách cao trên 3 m nên giằng sau lưng</li>
  </ul>
  <h3>3. Chữ và song hỷ</h3>
  <ul>
    <li>Chữ nổi “${SIGNAGE.text}”: ngang khoảng 4,1 m, cao chữ 45 cm, dày 9 cm; mặt mica hồng <code>${COLORS.rose}</code>, thành inox bạc, LED hắt chân chữ; tâm chữ cao ${fmt(SIGNAGE.textY)} m</li>
    <li>Song hỷ tối giản: thanh mica hồng dày 5 cm, vòng inox Ø ${fmt(SIGNAGE.ringRadius * 2)} m, tâm cao ${fmt(SIGNAGE.symbolY)} m</li>
  </ul>
  <h3>4. Hoa tươi</h3>
  <ul>
    <li>Cắm cụm tự do, bất đối xứng: 2 cụm lớn chân vách, 2 cụm trên vai sóng, 2 cụm ôm vòng song hỷ, 2 cụm nhỏ mép bục</li>
    <li>Lan hồ điệp trắng họng hồng (cành vươn cong), hồng môn hồng – trắng – cam đào, hoa hồng pastel (hồng phấn, kem, đào, tím nhạt)</li>
    <li>Ước lượng: khoảng 170 bông hồng, 37 bông hồng môn, 19 cành lan hồ điệp, lá nền xanh</li>
  </ul>
  <h3>5. Đôn và tráp (7 tráp)</h3>
  <ul>
    <li>Đôn trụ tròn Ø ${PEDESTAL_RADIUS * 200} cm, hai đai inox bạc, xếp vòng cung trước bục, cách nhau 1,3 m</li>
    ${pedestals}
    <li>Tráp: đế sơn mài đỏ Ø 50 cm viền vàng, chụp mica trong Ø 46 × cao 34 cm (xen kẽ tròn và lục giác), nơ lụa đỏ</li>
  </ul>
  <h3>6. Trần và ánh sáng</h3>
  <ul>
    <li>Trần thả 20 dải voan trắng khổ 1,25 m, võng 50–95 cm từ đỉnh xuống mép rạp</li>
    <li>Rèm voan túm tại 8 cột, đai bạc ở độ cao 1,7 m</li>
    <li>Ban ngày dùng sáng tự nhiên, mở thoáng hai bên; buổi tối LED hắt khe là nguồn sáng chính của phông</li>
  </ul>`;
}

export function initUi({ onViewpoint, onToggleEvening }) {
  const $ = id => document.getElementById(id);
  const views = $('viewpoints');
  VIEWPOINTS.forEach((view, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = view.name;
    button.addEventListener('click', () => onViewpoint(view));
    views.appendChild(button);
    if (i === 0) button.dataset.default = '1';
  });

  const spec = $('spec-panel');
  $('spec-content').innerHTML = specHtml();
  const toggleSpec = open => { spec.classList.toggle('open', open); $('btn-spec').setAttribute('aria-expanded', String(open)); };
  $('btn-spec').addEventListener('click', () => toggleSpec(!spec.classList.contains('open')));
  $('btn-spec-close').addEventListener('click', () => toggleSpec(false));

  let evening = false;
  $('btn-evening').addEventListener('click', e => {
    evening = !evening;
    e.currentTarget.textContent = evening ? 'Ban ngày' : 'Buổi tối';
    onToggleEvening(evening);
  });

  $('btn-start').addEventListener('click', () => $('intro').classList.add('hidden'));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') toggleSpec(false); });
}
