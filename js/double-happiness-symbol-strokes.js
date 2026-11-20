// Minimal double-happiness mark as straight bars, in symbol units:
// x from -1 to 1, y from -0.86 to 0.86 (already vertically centred).
// Each bar is [centreX, centreY, width, height]. Shared by the brass seal and the lattice medallion.
export function doubleHappinessBars(thickness = 0.085) {
  const T = thickness, bars = [];
  const h = (y, x0, x1) => bars.push([(x0 + x1) / 2, y - 0.14, x1 - x0 + T, T]);
  const v = (x, y0, y1) => bars.push([x, (y0 + y1) / 2 - 0.14, T, y1 - y0 + T]);
  for (const cx of [-0.5, 0.5]) {
    h(0.82, cx - 0.34, cx + 0.34);            // top bar
    v(cx, 0.62, 1.0);                         // stem
    h(0.62, cx - 0.5, cx + 0.5);              // long bar (joins both halves)
    h(0.44, cx - 0.26, cx + 0.26); h(0.22, cx - 0.26, cx + 0.26);
    v(cx - 0.26, 0.22, 0.44); v(cx + 0.26, 0.22, 0.44);     // upper box
    v(cx - 0.2, -0.04, 0.08); v(cx + 0.2, -0.04, 0.08);     // two ticks
    h(-0.1, cx - 0.5, cx + 0.5);              // long bar (joins both halves)
    h(-0.34, cx - 0.3, cx + 0.3); h(-0.72, cx - 0.3, cx + 0.3);
    v(cx - 0.3, -0.72, -0.34); v(cx + 0.3, -0.72, -0.34);   // lower box
  }
  return bars;
}
