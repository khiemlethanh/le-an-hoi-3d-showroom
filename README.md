# Phối cảnh 3D phông rạp Lễ Ăn Hỏi 2027

Trang web tĩnh cho phép đi lại và quan sát phối cảnh 3D phông nền rạp lễ ăn hỏi hiện đại, kèm bảng thông số để thi công thực tế.

## Nội dung cảnh

- 6 lớp vách sóng bất đối xứng: trắng kem, vàng bơ nhạt, hồng phấn; viền kim loại bạc; LED hắt khe
- Chữ nổi "LỄ ĂN HỎI" và biểu tượng song hỷ tối giản trong vòng inox
- 8 cụm hoa tự do: lan hồ điệp, hồng môn, hoa hồng pastel
- 7 đôn trụ tròn đặt tráp sơn mài, chụp mica trong
- Rạp 18 × 16 m, trần thả voan bay nhẹ, chế độ ban ngày và buổi tối

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

- `js/scene-config.js` — kích thước, màu, bố cục (nguồn dữ liệu chung cho cảnh 3D và bảng thông số)
- `js/backdrop-wave-panels.js` — vách sóng, viền bạc, LED
- `js/backdrop-text-and-double-happiness.js` — chữ nổi, song hỷ
- `js/flower-geometries.js`, `js/flower-clusters.js` — hoa
- `js/pedestals-and-trap-gift-trays.js` — đôn và tráp
- `js/tent-structure-and-voile-ceiling.js` — rạp, trần voan, ghế, sân vườn
- `js/daylight-sky-and-led-lighting.js` — ánh sáng ngày / tối
- `js/first-person-walk-controls.js` — đi lại, va chạm
- `js/construction-spec-panel-and-toolbar.js` — giao diện, bảng thông số

Muốn đổi kích thước hay màu: sửa `js/scene-config.js`, cảnh 3D và bảng thông số tự cập nhật theo.
