// Generates a 1024x1024 App Icon (red triangle + blue circle) with no external
// dependencies. Renders at 2x and box-downsamples for smooth edges, then encodes
// a PNG using Node's built-in zlib.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DIM = 1024;
const S = 2; // supersample factor
const D = DIM * S; // 2048

// --- render buffer (RGB) ---
const px = new Uint8ClampedArray(D * D * 3);

function lerp(a, b, t) { return a + (b - a) * t; }
function setPx(x, y, r, g, b) {
  const i = (y * D + x) * 3;
  px[i] = r; px[i + 1] = g; px[i + 2] = b;
}

// background: soft vertical gradient (indigo tint -> red tint), like the web bg
const top = [238, 242, 255];
const bot = [254, 242, 242];
for (let y = 0; y < D; y++) {
  const t = y / (D - 1);
  const r = lerp(top[0], bot[0], t);
  const g = lerp(top[1], bot[1], t);
  const b = lerp(top[2], bot[2], t);
  for (let x = 0; x < D; x++) setPx(x, y, r, g, b);
}

// triangle (upward), red
const RED = [239, 68, 68];
const ax = 0.40 * D, ay = 0.30 * D;   // apex
const blx = 0.20 * D, bly = 0.68 * D; // bottom-left
const brx = 0.60 * D, bry = 0.68 * D; // bottom-right
function edge(px_, py_, x0, y0, x1, y1) {
  return (px_ - x0) * (y1 - y0) - (py_ - y0) * (x1 - x0);
}
function inTriangle(x, y) {
  const d1 = edge(x, y, ax, ay, brx, bry);
  const d2 = edge(x, y, brx, bry, blx, bly);
  const d3 = edge(x, y, blx, bly, ax, ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

// circle (bottom-right), blue with subtle radial shading
const BLUE = [37, 99, 235];
const BLUE_HI = [96, 165, 250];
const cx = 0.66 * D, cy = 0.64 * D, cr = 0.235 * D;

for (let y = 0; y < D; y++) {
  for (let x = 0; x < D; x++) {
    if (inTriangle(x, y)) setPx(x, y, RED[0], RED[1], RED[2]);
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= cr) {
      // highlight toward upper-left of the circle
      const hx = (x - (cx - cr)) / (2 * cr);
      const hy = (y - (cy - cr)) / (2 * cr);
      const t = Math.min(1, Math.max(0, (hx + hy) / 2));
      setPx(x, y,
        lerp(BLUE_HI[0], BLUE[0], t),
        lerp(BLUE_HI[1], BLUE[1], t),
        lerp(BLUE_HI[2], BLUE[2], t));
    }
  }
}

// --- downsample S x S -> DIM (box filter) ---
const out = Buffer.alloc(DIM * DIM * 3);
for (let y = 0; y < DIM; y++) {
  for (let x = 0; x < DIM; x++) {
    let r = 0, g = 0, b = 0;
    for (let sy = 0; sy < S; sy++) {
      for (let sx = 0; sx < S; sx++) {
        const i = ((y * S + sy) * D + (x * S + sx)) * 3;
        r += px[i]; g += px[i + 1]; b += px[i + 2];
      }
    }
    const n = S * S;
    const o = (y * DIM + x) * 3;
    out[o] = Math.round(r / n);
    out[o + 1] = Math.round(g / n);
    out[o + 2] = Math.round(b / n);
  }
}

// --- encode PNG (8-bit RGB, color type 2) ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(DIM, 0);
ihdr.writeUInt32BE(DIM, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type RGB
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// raw scanlines with filter byte 0
const raw = Buffer.alloc(DIM * (DIM * 3 + 1));
for (let y = 0; y < DIM; y++) {
  raw[y * (DIM * 3 + 1)] = 0;
  out.copy(raw, y * (DIM * 3 + 1) + 1, y * DIM * 3, (y + 1) * DIM * 3);
}
const idat = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

const dest = path.join(__dirname, "Tango", "Assets.xcassets", "AppIcon.appiconset", "AppIcon.png");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, png);
console.log("Wrote", dest, `(${(png.length / 1024).toFixed(1)} KB)`);
