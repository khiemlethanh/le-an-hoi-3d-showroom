# Phông Lễ Ăn Hỏi Khiêm & Huyền: phối cảnh 3D

Trang web tĩnh cho phép đi lại và quan sát phối cảnh 3D phông lễ ăn hỏi, kèm bảng thông số và bản vẽ kích thước để thi công.

## Nội dung cảnh

- Tông vàng kem là chính, đỏ đất làm điểm nhấn, chi tiết đồng xước
- Tấm tên ở giữa cao 3,4 m: song hỷ đồng, chữ "Khiêm & Huyền", dòng nhỏ "Lễ Ăn Hỏi", chữ nằm trên tầm đầu người
- Mỗi bên 3 tấm bình phong hoa văn cắt CNC, thấp dần ra ngoài, hắt sáng từ sau
- Dải hoa thấp dọc chân bình phong, hai bình gốm đất nung cắm cành nở hoa và lan hồ điệp
- 9 tráp nhỏ trên giá đồng cao bằng nhau, một hàng: 4 bên trái, 5 bên phải
- Rạp 18 × 16 m, trần thả voan, chế độ ban ngày và buổi tối

Bản vẽ kích thước: `docs/ban-ve-kich-thuoc-phong-le-an-hoi.svg`. Ghi chú thi công: `docs/huong-dan-thi-cong-phong-le-an-hoi.md`.

## Điều khiển

| Thiết bị | Nhìn | Đi |
|---|---|---|
| Máy tính | Kéo chuột | `W A S D` / phím mũi tên, `Shift` đi nhanh, lăn chuột tiến lùi |
| Điện thoại | Vuốt nửa phải màn hình | Chạm giữ nửa trái (cần điều khiển ảo) |

Các nút góc nhìn ở dưới màn hình đưa thẳng tới vị trí định sẵn. Nút **Thông số thi công** mở bảng kích thước, màu, vật liệu.

## Chạy tại máy

```bash
python3 -m http.server 8791
# mở http://localhost:8791
```

Không cần build. Three.js 0.170 tải qua CDN (import map trong `index.html`).

## Cấu trúc

- `js/scene-config.js`: kích thước, màu, bố cục (nguồn dữ liệu chung cho cảnh 3D, bảng thông số và bản vẽ)
- `js/backdrop-lattice-screens-and-name-panel.js`: tường sau, tấm tên, bình phong hoa văn
- `js/name-lettering-and-brass-seal.js`: chữ nổi, song hỷ đồng
- `js/double-happiness-symbol-strokes.js`: nét song hỷ dùng chung
- `js/brass-stands-and-small-trap-trays.js`: giá đồng và 9 tráp
- `js/terracotta-vases-with-blossom-branches.js`: bình gốm, cành hoa
- `js/flower-geometries.js`, `js/flower-clusters.js`: dải hoa
- `js/tent-structure-and-voile-ceiling.js`: rạp, trần voan, ghế, sân vườn
- `js/daylight-sky-and-led-lighting.js`: ánh sáng ngày / tối
- `js/first-person-walk-controls.js`: đi lại, va chạm
- `js/construction-spec-panel-and-toolbar.js`: giao diện, bảng thông số
- `tools/generate-dimension-drawing.mjs`: sinh bản vẽ kích thước SVG từ `scene-config.js`

Muốn đổi kích thước hay màu: sửa `js/scene-config.js`, rồi chạy `node tools/generate-dimension-drawing.mjs` để cập nhật bản vẽ. Cảnh 3D và bảng thông số tự cập nhật theo.
