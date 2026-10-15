import zlib from "node:zlib";
import fs from "node:fs";

/**
 * Generates the app icons for Recipe Studio (home-screen / PWA use) with no
 * dependencies: warm paper background, thin ink frame and a plate mark —
 * the same visual language as the app itself.
 *
 * Run with: node scripts/generate-icons.mjs
 */

// --- minimal PNG encoder (RGBA, no deps) ---
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // 8-bit RGBA
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- icon artwork, 4x supersampled for smooth edges ---
const SS = 4;
const BG = [246, 243, 238]; // #F6F3EE — the app's paper
const INK = [34, 32, 28]; // #22201C — the app's ink

function draw(size, path, maskable = false) {
  const S = size * SS;
  const buf = Buffer.alloc(S * S * 4);
  const inset = maskable ? 0.17 : 0.095;
  const frameT = maskable ? 0.013 : 0.02;
  const radius = maskable ? 0.2 : 0.255;
  const circleT = maskable ? 0.015 : 0.021;
  const i0 = S * inset;
  const i1 = S - S * inset;
  const ft = (S * frameT) / 2;
  const ct = (S * circleT) / 2;
  const cx = S / 2;
  const cy = S / 2;
  const R = S * radius;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const inBox =
        px >= i0 - ft && px <= i1 + ft && py >= i0 - ft && py <= i1 + ft;
      const onEdge =
        px >= i0 - ft && px <= i0 + ft && py >= i0 - ft && py <= i1 + ft;
      const onEdge2 =
        px >= i1 - ft && px <= i1 + ft && py >= i0 - ft && py <= i1 + ft;
      const onEdge3 =
        py >= i0 - ft && py <= i0 + ft && px >= i0 - ft && px <= i1 + ft;
      const onEdge4 =
        py >= i1 - ft && py <= i1 + ft && px >= i0 - ft && px <= i1 + ft;
      const frame = inBox && (onEdge || onEdge2 || onEdge3 || onEdge4);
      const d = Math.hypot(px - cx, py - cy);
      const circle = Math.abs(d - R) <= ct;
      const c = frame || circle ? INK : BG;
      const o = (y * S + x) * 4;
      buf[o] = c[0];
      buf[o + 1] = c[1];
      buf[o + 2] = c[2];
      buf[o + 3] = 255;
    }
  }

  const out = Buffer.alloc(size * size * 4);
  const n = SS * SS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const o = ((y * SS + dy) * S + (x * SS + dx)) * 4;
          r += buf[o];
          g += buf[o + 1];
          b += buf[o + 2];
        }
      }
      const o2 = (y * size + x) * 4;
      out[o2] = Math.round(r / n);
      out[o2 + 1] = Math.round(g / n);
      out[o2 + 2] = Math.round(b / n);
      out[o2 + 3] = 255;
    }
  }
  fs.writeFileSync(path, encodePNG(size, out));
  console.log("wrote", path, `${size}x${size}`);
}

draw(512, "public/icon-512.png");
draw(192, "public/icon-192.png");
draw(180, "public/apple-touch-icon.png");
draw(512, "public/icon-512-maskable.png", true);
