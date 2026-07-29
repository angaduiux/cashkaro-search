/**
 * check-product-photos.mjs — flags product images that aren't studio shots on a
 * white ground (D038). Prints the share of near-white pixels per file; a studio
 * render sits high, a photo taken on a desk or a styled lifestyle scene sits low.
 *
 * Usage: node scripts/check-product-photos.mjs [assets/products]
 *
 * Measure the WHOLE FIELD, not the border: several of these files were padded
 * with white margins around a grey desk photo, so a border sample called them
 * clean. The percentage is a ranking aid, not a verdict — it does not separate
 * "phones on a table" (45%) from a legitimately busy pack shot, so confirm by
 * eye. Fastest way to see all of them at once is a contact sheet: write an HTML
 * grid of file:// <img> tags and screenshot it with headless Chrome
 * (--allow-file-access-from-files).
 *
 * Node zlib only; sips normalises each file to a small 8-bit PNG first.
 */
import { readFileSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

function decode(path) {
  const buf = readFileSync(path);
  let p = 8, w = 0, h = 0, ct = 6;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : null;
  if (!ch) throw new Error('color type ' + ct);
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
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, ch, px: out };
}

const dir = process.argv[2];
const tmp = mkdtempSync(join(tmpdir(), 'bg-'));
const rows = [];
for (const name of readdirSync(dir).filter((f) => /\.(png|jpe?g|avif|webp)$/i.test(f))) {
  const small = join(tmp, 'x.png');
  try {
    execFileSync('/usr/bin/sips', ['-Z', '96', '-s', 'format', 'png', join(dir, name), '--out', small], { stdio: 'ignore' });
    const { w, h, ch, px } = decode(small);
    const vals = [];
    const at = (x, y) => {
      const o = (y * w + x) * ch;
      if (ch === 4 && px[o + 3] < 200) return null; // transparent = already clean
      return (px[o] + px[o + 1] + px[o + 2]) / 3;
    };
    // Whole field, not the border: a studio render is MOSTLY pure white, while a
    // photo taken on a desk has a grey, textured ground even when the file was
    // padded with white margins.
    let nearWhite = 0, total = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = at(x, y);
      if (v == null) { nearWhite++; total++; continue; } // transparent counts as clean
      total++;
      if (v >= 248) nearWhite++;
    }
    const pct = (100 * nearWhite) / total;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = at(x, y); if (v != null) vals.push(v); }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    rows.push([name, pct, mean]);
  } catch (e) {
    rows.push([name, NaN, NaN]);
  }
}
rmSync(tmp, { recursive: true, force: true });
rows.sort((a, b) => a[1] - b[1]);
console.log('% pure white · mean brightness · file  (low = review; see the caveat in the header)');
for (const [name, pct, mean] of rows) {
  const flag = pct < 40 ? '  ← review' : '';
  console.log(`${pct.toFixed(1).padStart(6)}%  ${mean.toFixed(0).padStart(4)}  ${name}${flag}`);
}
console.log('\nLow share means EITHER a non-studio ground OR a legitimate tight crop');
console.log('(iphone-15-pro is a studio render that fills the frame). Confirm by eye.');
