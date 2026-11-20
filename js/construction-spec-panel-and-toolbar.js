import {
  COLORS, TENT, BACKDROP, BACKDROP_HALF_WIDTH, LETTERING, TRAY, TRAYS, TRAP_NAMES, VASES, FLOWER_STRIP, VIEWPOINTS, screenCenterX,
} from './scene-config.js';

const fmt = n => n.toFixed(2).replace('.', ',');
const cm = n => Math.round(n * 100);
const swatch = (name, hex) => `<span class="swatch" style="background:${hex}"></span>${name} <code>${hex}</code>`;

// Every number below is read from the same config the 3D scene is built from.
function specHtml() {
  const { wall, panel, screens, screenGap, lattice } = BACKDROP;
  const screenRows = screens.map((s, i) => `<tr><td>Bình phong ${i + 1} (từ giữa ra)</td><td>${fmt(s.width)} × ${fmt(s.height)} m</td>
    <td>tâm cách trục giữa ${fmt(screenCenterX(i))} m</td><td>nhô ${cm(s.offset)} cm</td></tr>`).join('');
  const left = TRAYS.filter(t => t.x < 0).sort((a, b) => b.x - a.x), right = TRAYS.filter(t => t.x > 0);
  const trayList = list => list.map(t => `${TRAP_NAMES[t.trap]} (${fmt(Math.abs(t.x))} m)`).join(', ');
  const lowestText = LETTERING.lines.at(-1);

  return `
  <h2>Thông số thi công</h2>
  <p class="note">Kích thước lấy từ mô hình 3D. Vật liệu là gợi ý, đơn vị thi công cần kiểm tra lại theo mặt bằng và tải trọng thực tế.
    <a href="docs/ban-ve-kich-thuoc-phong-le-an-hoi.svg" target="_blank" rel="noopener">Mở bản vẽ kích thước</a></p>

  <h3>1. Bảng màu</h3>
  <ul class="plain">
    <li>${swatch('Vàng kem (tường sau)', COLORS.wall)}</li>
    <li>${swatch('Kem (bình phong)', COLORS.cream)}</li>
    <li>${swatch('Vàng bơ (tấm tên)', COLORS.butter)}</li>
    <li>${swatch('Đỏ đất (điểm nhấn)', COLORS.terracotta)}</li>
    <li>${swatch('Đồng xước', COLORS.brass)}</li>
  </ul>

  <h3>2. Phông</h3>
  <table><tbody>
    <tr><td>Tường sau</td><td>${fmt(wall.width)} × ${fmt(wall.height)} m</td><td>phẳng, sơn vàng kem mờ</td><td>mốc 0</td></tr>
    <tr><td>Tấm tên ở giữa</td><td>${fmt(panel.width)} × ${fmt(panel.height)} m</td><td>khung đồng ${cm(panel.frame)} cm, chỉ đỏ đất ${panel.inlay * 1000} mm lùi vào ${cm(panel.inlayInset)} cm</td><td>nhô ${cm(panel.offset)} cm</td></tr>
    ${screenRows}
  </tbody></table>
  <ul>
    <li>Mỗi bên 3 tấm bình phong, khe giữa các tấm ${cm(screenGap)} cm, tổng bề rộng cụm bình phong ${fmt(BACKDROP_HALF_WIDTH * 2)} m</li>
    <li>Hoa văn: ô ${cm(lattice.cell)} cm, nan ${lattice.strip * 1000} mm, khung ${cm(lattice.frame)} cm, vòng song hỷ Ø ${cm(lattice.medallionRadius * 2)} cm ở 1/3 trên. Gợi ý cắt CNC trên MDF chống ẩm 12 mm hoặc PVC foam 10 mm, sơn kem mờ</li>
    <li>Sau hoa văn: mica mờ sữa 3 mm, LED 3000K hắt từ sau; ban ngày cần đèn đủ mạnh, nếu không hoa văn sẽ chìm</li>
  </ul>

  <h3>3. Chữ</h3>
  <ul>
    <li>Song hỷ đồng: cao ${cm(LETTERING.seal.size * 0.86)} cm, tâm cao ${fmt(LETTERING.seal.y)} m</li>
    ${LETTERING.lines.map(l => `<li>“${l.text}”: chiều cao chữ hoa ${cm(l.cap)} cm, tâm dòng cao ${fmt(l.y)} m</li>`).join('')}
    <li>Chữ nổi dày ${cm(LETTERING.depth)} cm, mặt đồng xước, kiểu serif tương phản cao (Playfair Display)</li>
    <li>Mép dưới dòng “${lowestText.text}” cao khoảng ${fmt(lowestText.y - lowestText.cap * 0.7)} m, trên đầu người đứng trước phông</li>
  </ul>

  <h3>4. Tráp (9 tráp, một hàng)</h3>
  <ul>
    <li>Mâm tròn Ø ${cm(TRAY.diameter)} cm, thành cao ${cm(TRAY.rim)} cm, sơn đỏ đất viền vàng, nơ lụa kem</li>
    <li>Giá khung đồng ${cm(TRAY.standWidth)} × ${cm(TRAY.standWidth)} × ${cm(TRAY.standHeight)} cm, cao bằng nhau, đặt cách tường sau ${cm(TRAY.rowOffset)} cm</li>
    <li>Bên trái 4 tráp (cách trục giữa): ${trayList(left)}</li>
    <li>Bên phải 5 tráp (cách trục giữa): ${trayList(right)}</li>
    <li>Khoảng trống giữa hai nhóm ${fmt(TRAY.firstX * 2 - TRAY.diameter)} m cho cô dâu chú rể đứng</li>
    <li>Giá mảnh nên có đế nặng hoặc dán cố định xuống sàn</li>
  </ul>

  <h3>5. Hoa</h3>
  <ul>
    <li>Dải hoa thấp dọc chân bình phong: cao ${cm(FLOWER_STRIP.height)} cm, sâu ${cm(FLOWER_STRIP.depth)} cm, mỗi bên dài ${fmt(FLOWER_STRIP.to - FLOWER_STRIP.from)} m; hồng kem, vàng bơ, khoảng 1/7 đỏ đất</li>
    <li>Hai bình gốm đất nung cao ${cm(VASES[0].height * VASES[1].scale)}–${cm(VASES[0].height * VASES[0].scale)} cm, tâm cách trục giữa ${fmt(Math.abs(VASES[0].x))} m; cành khô nở hoa cao tới khoảng 2,5 m, lan hồ điệp kem rủ; bình trái nhỉnh hơn bình phải</li>
  </ul>

  <h3>6. Rạp</h3>
  <ul>
    <li>Rạp ${TENT.halfWidth * 2} × ${TENT.zFront - TENT.zBack} m, cao mép ${fmt(TENT.eaveHeight)} m, đỉnh ${fmt(TENT.ridgeHeight)} m; tấm tên cao ${fmt(panel.height)} m nên mép rạp cần từ 3,6 m</li>
    <li>Trần thả voan trắng, rèm voan túm tại cột</li>
  </ul>`;
}

export function initUi({ onViewpoint, onToggleEvening }) {
  const $ = id => document.getElementById(id);
  const views = $('viewpoints');
  VIEWPOINTS.forEach(view => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = view.name;
    button.addEventListener('click', () => onViewpoint(view));
    views.appendChild(button);
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
