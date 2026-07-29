/**
 * sample-banner-tint.mjs — prints the dominant field colour of each deal banner,
 * so `bannerTint` in data/realData.ts is measured from the artwork rather than
 * guessed (the same "sample, don't invent" rule as the store-tile washes, D008).
 *
 * Usage: node scripts/sample-banner-tint.mjs [assets/banners/*.png]
 *
 * Method: downscale with `sips` (also normalises odd PNG flavours to 8-bit RGB),
 * bucket pixels in a coarse RGB grid, and score each bucket by
 * `count × sqrt(saturation)`, ignoring buckets under 2% of the image. The square
 * root and the floor matter: plain `count × saturation` let a small, intensely
 * saturated detail win — the red temple in the Klook banner beat its own light
 * blue field — while unweighted count just returns the white page ground.
 */
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { globSync } from 'node:fs';

const BUCKET = 24; // RGB grid step — coarse enough to merge gradient shading

function decodePng(path) {
  const buf = readFileSync(path);
  let p = 8, w = 0, h = 0, colorType = 6;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); colorType = data[9];
      if (data[8] !== 8) throw new Error(`bit depth ${data[8]}`);
      if (data[12] !== 0) throw new Error('interlaced');
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : null;
  if (!ch) throw new Error(`color type ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let q = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[q++];
    const line = raw.subarray(q, q + stride); q += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, ch, px: out };
}

const saturation = (r, g, b) => {
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
  return hi === 0 ? 0 : (hi - lo) / hi;
};

function dominant(path) {
  const dir = mkdtempSync(join(tmpdir(), 'tint-'));
  const small = join(dir, 'small.png');
  try {
    execFileSync('/usr/bin/sips', ['-Z', '64', '-s', 'format', 'png', path, '--out', small], { stdio: 'ignore' });
    const { w, h, ch, px } = decodePng(small);
    const buckets = new Map();
    for (let i = 0; i < w * h; i++) {
      const o = i * ch;
      if (ch === 4 && px[o + 3] < 200) continue; // ignore transparent margins
      const [r, g, b] = [px[o], px[o + 1], px[o + 2]];
      const key = `${Math.round(r / BUCKET)},${Math.round(g / BUCKET)},${Math.round(b / BUCKET)}`;
      const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += r; e.g += g; e.b += b;
      buckets.set(key, e);
    }
    const total = [...buckets.values()].reduce((n, e) => n + e.n, 0);
    const floor = total * 0.02; // a tint has to actually cover some of the banner
    let best = null, bestScore = -1;
    for (const e of buckets.values()) {
      if (e.n < floor) continue;
      const [r, g, b] = [e.r / e.n, e.g / e.n, e.b / e.n];
      const score = e.n * Math.sqrt(saturation(r, g, b));
      if (score > bestScore) { bestScore = score; best = [r, g, b]; }
    }
    if (!best) return null;
    const hex = '#' + best.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
    return hex;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : globSync('assets/banners/*.png');
for (const f of files.sort()) {
  try {
    console.log(`${basename(f).padEnd(16)} ${dominant(f)}`);
  } catch (err) {
    console.log(`${basename(f).padEnd(16)} ERROR ${err.message}`);
  }
}
