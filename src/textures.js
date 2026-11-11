// Every texture in the game is painted here by code when the game starts,
// onto small canvases. There are no image files. The pictures are kept small
// on purpose: that, and the hard texel edges, are part of the lo-fi look.
//
// Two kinds of texture come out of this file:
//   tiling: repeats across a surface. It knows how many metres one copy covers,
//           so a wall and the wall next to it line up.
//   fitted: stretched to fit one surface exactly (a poster, a door, a screen).
import * as THREE from 'three';

const TAU = Math.PI * 2;

// A repeatable random number generator, so the stains land in the same place
// every time the game starts.
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Colours are [red, green, blue] lists, 0 to 255.
const rgb = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const tint = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const pick = (r, list) => list[Math.floor(r() * list.length)];

function paint(w, h, seed, draw) {
  const el = document.createElement('canvas');
  el.width = w;
  el.height = h;
  draw(el.getContext('2d'), random(seed), w, h);
  return el;
}

function tiling(el, tileU, tileV = tileU) {
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  t.anisotropy = 4;
  t.userData.tile = [tileU, tileV];
  return t;
}

function fitted(el) {
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

// --- Brushes -------------------------------------------------------------

const fill = (g, colour, x, y, w, h) => {
  g.fillStyle = typeof colour === 'string' ? colour : rgb(colour);
  g.fillRect(x, y, w, h);
};

// Random light and dark specks on every pixel, so nothing is one flat colour.
function speckle(g, r, w, h, amount) {
  const image = g.getImageData(0, 0, w, h);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount * 255;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(image, 0, 0);
}

// One soft round patch of colour: a stain, wear, dirt.
function blot(g, x, y, radius, colour, alpha) {
  const grad = g.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, rgb(colour, alpha));
  grad.addColorStop(1, rgb(colour, 0));
  g.fillStyle = grad;
  g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

// Many patches scattered about. They wrap round the edges so the texture
// can repeat without a seam.
function blots(g, r, w, h, count, colour, alpha, minR, maxR, wrapY = true) {
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h;
    const radius = minR + r() * (maxR - minR);
    const a = alpha * (0.5 + r());
    for (const dx of [-w, 0, w]) for (const dy of wrapY ? [-h, 0, h] : [0]) blot(g, x + dx, y + dy, radius, colour, a);
  }
}

// Rows of little dark marks that read as writing at this size.
function scribble(g, r, x, y, w, lines, colour = [30, 30, 30], gap = 2) {
  g.fillStyle = rgb(colour, 0.7);
  for (let i = 0; i < lines; i++) g.fillRect(x, y + i * gap, Math.max(2, Math.round(w * (0.5 + r() * 0.5))), 1);
}

// --- Surfaces that repeat ------------------------------------------------

// A painted wall, floor to ceiling: uneven paint, damp from the ceiling,
// grime from the floor, scuffs, cracks and a skirting strip at the bottom.
function wallPaint(seed, base, dirt = 1) {
  return paint(256, 256, seed, (g, r, w, h) => {
    fill(g, base, 0, 0, w, h);
    blots(g, r, w, h, 16, [255, 255, 255], 0.045, 25, 80, false);
    blots(g, r, w, h, 16, [0, 0, 0], 0.07 * dirt, 25, 90, false);
    const stain = [70, 58, 34];
    for (let i = 0; i < 5; i++) {
      const x = r() * w;
      const top = r() * 20;
      const size = 22 + r() * 40;
      for (const dx of [-w, 0, w]) blot(g, x + dx, top, size, stain, 0.2 * dirt);
      for (let d = 0; d < 3; d++) fill(g, rgb(stain, 0.1 * dirt), Math.round(x + (r() - 0.5) * 40), 0, 1 + Math.round(r()), 30 + r() * 90);
    }
    const rise = g.createLinearGradient(0, h * 0.6, 0, h);
    rise.addColorStop(0, rgb(stain, 0));
    rise.addColorStop(1, rgb(stain, 0.38 * dirt));
    fill(g, rise, 0, h * 0.6, w, h * 0.4);
    for (let i = 0; i < 14; i++) fill(g, rgb([25, 22, 18], 0.06 + r() * 0.12), r() * w, h - 55 - r() * 60, 5 + r() * 30, 1 + Math.round(r() * 1.4));
    g.strokeStyle = rgb([15, 12, 10], 0.4);
    g.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      let x = r() * w;
      let y = r() * h * 0.5;
      g.beginPath();
      g.moveTo(x, y);
      for (let s = 0; s < 10; s++) {
        x += (r() - 0.5) * 12;
        y += 4 + r() * 9;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    fill(g, tint(base, 0.42), 0, h - 9, w, 9);
    fill(g, rgb([255, 255, 255], 0.14), 0, h - 9, w, 1);
    fill(g, rgb([0, 0, 0], 0.3), 0, h - 1, w, 1);
    speckle(g, r, w, h, 0.045);
  });
}

// Plain plaster with stains, for ceilings and the inside of doorways.
function plaster(seed, base) {
  return paint(128, 128, seed, (g, r, w, h) => {
    fill(g, base, 0, 0, w, h);
    blots(g, r, w, h, 10, [0, 0, 0], 0.07, 12, 45);
    blots(g, r, w, h, 8, [255, 255, 255], 0.04, 12, 40);
    blots(g, r, w, h, 4, [80, 65, 35], 0.14, 10, 30);
    speckle(g, r, w, h, 0.04);
  });
}

// A grid of tiles. px is the size of one tile in pixels. opts.band lists rows
// (counted from the floor) that get the accent colour.
function tiles(seed, cols, rows, px, base, grout, opts = {}) {
  return paint(cols * px, rows * px, seed, (g, r, w, h) => {
    fill(g, grout, 0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const accent = opts.band && opts.band.includes(rows - 1 - y);
        const colour = tint(accent ? opts.bandColour : base, 1 + (r() - 0.5) * (opts.vary ?? 0.12));
        fill(g, colour, x * px + 1, y * px + 1, px - 1, px - 1);
        fill(g, rgb([255, 255, 255], 0.1), x * px + 1, y * px + 1, px - 1, 1);
        fill(g, rgb([255, 255, 255], 0.06), x * px + 1, y * px + 1, 1, px - 1);
        fill(g, rgb([0, 0, 0], 0.14), x * px + 1, y * px + px - 1, px - 1, 1);
        if (accent && px > 12) fill(g, rgb([255, 255, 255], 0.16), x * px + (px >> 1) - 2, y * px + (px >> 1) - 2, 4, 4);
      }
    }
    if (opts.after) opts.after(g, r, w, h);
    speckle(g, r, w, h, opts.rough ?? 0.035);
  });
}

// Old poured mosaic floor: stone chips in cement, cut into squares by strips.
function mosaic(seed) {
  return paint(128, 128, seed, (g, r, w, h) => {
    fill(g, '#857c6a', 0, 0, w, h);
    const chips = [[205, 198, 180], [60, 54, 48], [120, 62, 48], [150, 120, 70], [170, 165, 150], [40, 40, 44]];
    for (let i = 0; i < 1500; i++) {
      fill(g, rgb(pick(r, chips), 0.5 + r() * 0.45), Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 2.2), 1 + Math.floor(r() * 2.2));
    }
    blots(g, r, w, h, 10, [0, 0, 0], 0.09, 15, 45);
    blots(g, r, w, h, 6, [255, 255, 255], 0.04, 15, 40);
    for (const p of [0, 64]) {
      fill(g, '#39352e', p, 0, 1, h);
      fill(g, '#39352e', 0, p, w, 1);
    }
    speckle(g, r, w, h, 0.04);
  });
}

// Wood. The grain runs left to right.
function wood(seed, base, opts = {}) {
  return paint(64, 64, seed, (g, r, w, h) => {
    let drift = 0;
    for (let y = 0; y < h; y++) {
      drift = drift * 0.82 + (r() - 0.5) * 0.3;
      fill(g, tint(base, 1 + drift * 0.5 * (opts.contrast ?? 1)), 0, y, w, 1);
    }
    for (let i = 0; i < (opts.lines ?? 9); i++) {
      let y = Math.floor(r() * h);
      const x0 = Math.floor(r() * w);
      const length = 20 + r() * 60;
      g.fillStyle = rgb([0, 0, 0], 0.1 + r() * 0.12);
      for (let x = 0; x < length; x++) {
        if (r() < 0.12) y += r() < 0.5 ? 1 : -1;
        g.fillRect((x0 + x) % w, ((y % h) + h) % h, 1, 1);
      }
    }
    if (opts.planks) for (let y = 0; y < h; y += opts.planks) fill(g, rgb([0, 0, 0], 0.35), 0, y, w, 1);
    blots(g, r, w, h, 4, [0, 0, 0], 0.07, 8, 24);
    speckle(g, r, w, h, 0.03);
  });
}

// Woven cloth, optionally with stripes: [position, width, colour].
function cloth(seed, base, opts = {}) {
  const size = opts.size ?? 32;
  return paint(size, size, seed, (g, r, w, h) => {
    fill(g, base, 0, 0, w, h);
    for (const [pos, width, colour] of opts.stripes ?? []) {
      if (opts.upright) fill(g, colour, pos, 0, width, h);
      else fill(g, colour, 0, pos, w, width);
    }
    g.fillStyle = rgb([0, 0, 0], 0.07);
    for (let i = 0; i < w; i += 2) {
      g.fillRect(i, 0, 1, h);
      g.fillRect(0, i, w, 1);
    }
    speckle(g, r, w, h, opts.rough ?? 0.06);
  });
}

// A checked blanket.
function plaid(seed, a, b, c) {
  return paint(64, 64, seed, (g, r, w, h) => {
    fill(g, a, 0, 0, w, h);
    for (const p of [6, 38]) {
      fill(g, rgb(b, 0.55), p, 0, 14, h);
      fill(g, rgb(b, 0.55), 0, p, w, 14);
    }
    for (const p of [12, 44, 28, 60]) {
      fill(g, rgb(c, 0.8), p, 0, 1, h);
      fill(g, rgb(c, 0.8), 0, p, w, 1);
    }
    g.fillStyle = rgb([0, 0, 0], 0.08);
    for (let i = 0; i < w; i += 2) {
      g.fillRect(i, 0, 1, h);
      g.fillRect(0, i, w, 1);
    }
    speckle(g, r, w, h, 0.07);
  });
}

// Brushed metal, or anything with faint streaks along it.
function metal(seed, base, streak = 0.1) {
  return paint(64, 64, seed, (g, r, w, h) => {
    for (let y = 0; y < h; y++) fill(g, tint(base, 1 + (r() - 0.5) * streak), 0, y, w, 1);
    blots(g, r, w, h, 5, [0, 0, 0], 0.07, 10, 30);
    speckle(g, r, w, h, 0.03);
  });
}

// One colour with a little dirt: plastic, enamel, rubber, paper.
function plain(seed, base, dirt = 0.06, rough = 0.035) {
  return paint(32, 32, seed, (g, r, w, h) => {
    fill(g, base, 0, 0, w, h);
    blots(g, r, w, h, 5, [0, 0, 0], dirt, 5, 16);
    speckle(g, r, w, h, rough);
  });
}

function granite(seed) {
  return paint(64, 64, seed, (g, r, w, h) => {
    fill(g, '#1b1b1d', 0, 0, w, h);
    for (let i = 0; i < 700; i++) fill(g, rgb(pick(r, [[150, 150, 150], [90, 95, 105], [60, 60, 62], [200, 200, 195]]), 0.25 + r() * 0.5), Math.floor(r() * w), Math.floor(r() * h), 1, 1);
    speckle(g, r, w, h, 0.03);
  });
}

function cardboard(seed) {
  return paint(64, 64, seed, (g, r, w, h) => {
    fill(g, [136, 104, 66], 0, 0, w, h);
    for (let y = 0; y < h; y += 3) fill(g, rgb([0, 0, 0], 0.06), 0, y, w, 1);
    blots(g, r, w, h, 6, [60, 40, 20], 0.14, 8, 24);
    speckle(g, r, w, h, 0.05);
  });
}

// --- Things stretched to fit one surface ---------------------------------

// A door. The grain runs up and down, with two sunk panels.
function door(seed, base, opts = {}) {
  return paint(64, 168, seed, (g, r, w, h) => {
    let drift = 0;
    for (let x = 0; x < w; x++) {
      drift = drift * 0.8 + (r() - 0.5) * 0.3;
      fill(g, tint(base, 1 + drift * (opts.grain ?? 0.4)), x, 0, 1, h);
    }
    for (const [y0, y1] of [[10, 72], [84, 156]]) {
      fill(g, rgb([0, 0, 0], 0.16), 9, y0, w - 18, y1 - y0);
      g.strokeStyle = rgb([0, 0, 0], 0.5);
      g.lineWidth = 1;
      g.strokeRect(9.5, y0 + 0.5, w - 19, y1 - y0 - 1);
      fill(g, rgb([255, 255, 255], 0.12), 10, y1 - 1, w - 20, 1);
      fill(g, rgb([255, 255, 255], 0.12), w - 10, y0 + 1, 1, y1 - y0 - 2);
    }
    for (const x of [8, w - 8]) blot(g, x, 88, 13, [20, 15, 10], 0.28); // hand grime
    const kick = g.createLinearGradient(0, h - 34, 0, h);
    kick.addColorStop(0, rgb([20, 15, 10], 0));
    kick.addColorStop(1, rgb([20, 15, 10], opts.damp ? 0.55 : 0.35));
    fill(g, kick, 0, h - 34, w, 34);
    if (opts.damp) for (let i = 0; i < 16; i++) blot(g, r() * w, h - r() * r() * 60, 3 + r() * 8, [38, 48, 32], 0.32);
    if (opts.peephole) {
      fill(g, '#b0a070', 31, 52, 3, 3);
      fill(g, '#101010', 32, 53, 1, 1);
    }
    speckle(g, r, w, h, 0.035);
  });
}

// A steel cupboard: two doors, a handle, a keyhole and rust.
function cupboard(seed) {
  return paint(84, 160, seed, (g, r, w, h) => {
    fill(g, [96, 104, 92], 0, 0, w, h);
    blots(g, r, w, h, 8, [0, 0, 0], 0.08, 10, 40, false);
    fill(g, rgb([0, 0, 0], 0.55), 41, 0, 2, h);
    for (const x0 of [4, 46]) {
      g.lineWidth = 1;
      g.strokeStyle = rgb([0, 0, 0], 0.3);
      g.strokeRect(x0 + 0.5, 6.5, 33, h - 14);
      g.strokeStyle = rgb([255, 255, 255], 0.12);
      g.strokeRect(x0 + 1.5, 7.5, 33, h - 14);
    }
    fill(g, '#b9b9b0', 47, 76, 3, 14);
    fill(g, '#1a1a1a', 48, 94, 1, 3);
    for (let i = 0; i < 26; i++) blot(g, r() * w, h - r() * r() * 50, 2 + r() * 5, [110, 60, 30], 0.35);
    for (const x of [1, w - 2]) for (let i = 0; i < 6; i++) blot(g, x, r() * h, 3 + r() * 3, [110, 60, 30], 0.3);
    speckle(g, r, w, h, 0.03);
  });
}

// A run of kitchen cabinet doors with steel bar handles.
function cabinets(seed, w, h, doors, base, handleAt) {
  return paint(w, h, seed, (g, r) => {
    fill(g, tint(base, 0.4), 0, 0, w, h);
    const each = w / doors;
    for (let i = 0; i < doors; i++) {
      const x = Math.round(i * each) + 1;
      const width = Math.round((i + 1) * each) - x - 1;
      fill(g, tint(base, 1 + (r() - 0.5) * 0.07), x, 1, width, h - 2);
      fill(g, rgb([255, 255, 255], 0.1), x, 1, width, 1);
      fill(g, rgb([0, 0, 0], 0.16), x, h - 2, width, 1);
      const hy = handleAt === 'top' ? 5 : h - 8;
      fill(g, '#b4b6b2', x + (width >> 1) - 5, hy, 10, 2);
      fill(g, rgb([0, 0, 0], 0.4), x + (width >> 1) - 5, hy + 2, 10, 1);
    }
    blots(g, r, w, h, 12, [70, 55, 25], 0.13, 5, 16, false);
    speckle(g, r, w, h, 0.03);
  });
}

function fridge(seed) {
  return paint(56, 144, seed, (g, r, w, h) => {
    const sheen = g.createLinearGradient(0, 0, w, 0);
    sheen.addColorStop(0, '#a9aaa2');
    sheen.addColorStop(0.5, '#bdbeb6');
    sheen.addColorStop(1, '#9c9d95');
    fill(g, sheen, 0, 0, w, h);
    fill(g, rgb([0, 0, 0], 0.6), 0, 40, w, 2); // freezer door above, fridge door below
    fill(g, '#6f706a', 4, 26, 3, 12);
    fill(g, '#6f706a', 4, 46, 3, 26);
    fill(g, '#5a5b56', w - 16, 5, 11, 3);
    for (const [x, y, c] of [[30, 56, '#b03a2e'], [38, 62, '#2e6fb0'], [24, 70, '#d4b23c'], [41, 80, '#3c8a4a']]) fill(g, c, x, y, 4, 4);
    fill(g, '#d9d2a0', 22, 84, 14, 14);
    scribble(g, r, 24, 87, 10, 4, [40, 40, 40], 3);
    blots(g, r, w, h, 10, [60, 50, 30], 0.1, 6, 20, false);
    for (let i = 0; i < 16; i++) blot(g, r() * w, h - r() * 12, 2 + r() * 4, [110, 60, 30], 0.35);
    speckle(g, r, w, h, 0.025);
  });
}

// Paper that has been on a wall for years: fold lines and worn edges.
function worn(g, r, w, h) {
  fill(g, rgb([255, 255, 255], 0.1), 0, Math.round(h / 2), w, 1);
  fill(g, rgb([255, 255, 255], 0.08), Math.round(w / 2), 0, 1, h);
  for (let i = 0; i < 18; i++) fill(g, rgb([220, 215, 200], 0.35), pick(r, [0, w - 1]), r() * h, 1, 1 + r() * 3);
  speckle(g, r, w, h, 0.05);
}

// Three posters. All invented: no real film, festival or artwork.
function posterMoon(seed) {
  return paint(48, 68, seed, (g, r, w, h) => {
    fill(g, '#0d1422', 0, 0, w, h);
    g.fillStyle = '#c9c2a8';
    g.beginPath();
    g.arc(24, 22, 13, 0, TAU);
    g.fill();
    blot(g, 20, 19, 6, [120, 115, 100], 0.5);
    blot(g, 29, 27, 4, [120, 115, 100], 0.4);
    g.fillStyle = '#05070b';
    g.beginPath();
    g.moveTo(0, 46);
    g.lineTo(12, 38);
    g.lineTo(22, 44);
    g.lineTo(34, 36);
    g.lineTo(48, 45);
    g.lineTo(48, 52);
    g.lineTo(0, 52);
    g.fill();
    fill(g, '#05070b', 30, 31, 7, 7);
    fill(g, '#d4a23c', 32, 33, 2, 2);
    fill(g, '#7d1c18', 0, 52, w, 9);
    fill(g, '#d8d2c0', 6, 55, 36, 3);
    scribble(g, r, 8, 63, 32, 2, [150, 150, 140]);
    worn(g, r, w, h);
  });
}

function posterDoor(seed) {
  return paint(48, 68, seed, (g, r, w, h) => {
    fill(g, '#0e0e0e', 0, 0, w, h);
    g.fillStyle = rgb([200, 195, 175], 0.16);
    g.beginPath();
    g.moveTo(17, 42);
    g.lineTo(31, 42);
    g.lineTo(44, 58);
    g.lineTo(4, 58);
    g.fill();
    fill(g, '#d8d2bd', 17, 12, 14, 30);
    fill(g, '#0e0e0e', 22, 30, 4, 12); // someone standing in the doorway
    g.fillStyle = '#0e0e0e';
    g.beginPath();
    g.arc(24, 28, 2.4, 0, TAU);
    g.fill();
    fill(g, '#b9b3a0', 9, 60, 30, 2);
    scribble(g, r, 12, 64, 24, 1, [130, 126, 112]);
    worn(g, r, w, h);
  });
}

function posterFest(seed) {
  return paint(48, 68, seed, (g, r, w, h) => {
    fill(g, '#1f4a4a', 0, 0, w, h);
    g.fillStyle = '#c96a24';
    g.beginPath();
    g.moveTo(0, 40);
    g.lineTo(48, 8);
    g.lineTo(48, 26);
    g.lineTo(0, 58);
    g.fill();
    g.fillStyle = '#e6dcc0';
    g.beginPath();
    g.arc(34, 44, 8, 0, TAU);
    g.fill();
    g.font = 'bold 10px Arial';
    g.textAlign = 'left';
    g.fillStyle = '#e6dcc0';
    g.fillText('FILM', 4, 12);
    g.fillText('FEST', 4, 22);
    scribble(g, r, 4, 62, 26, 2, [220, 210, 190]);
    worn(g, r, w, h);
  });
}

// A pinboard covered in notes, prints and a schedule.
function pinboard(seed) {
  return paint(96, 64, seed, (g, r, w, h) => {
    fill(g, '#86603a', 0, 0, w, h);
    speckle(g, r, w, h, 0.12);
    const note = (x, y, nw, nh, colour, lines) => {
      g.save();
      g.translate(x, y);
      g.rotate((r() - 0.5) * 0.3);
      fill(g, rgb([0, 0, 0], 0.3), -nw / 2 + 1, -nh / 2 + 1, nw, nh);
      fill(g, colour, -nw / 2, -nh / 2, nw, nh);
      scribble(g, r, -nw / 2 + 2, -nh / 2 + 3, nw - 4, lines);
      fill(g, '#a02a22', -1, -nh / 2, 2, 2);
      g.restore();
    };
    note(14, 14, 16, 20, '#d8d8d0', 7);
    note(36, 12, 12, 12, '#d9cf7a', 4);
    note(52, 14, 12, 12, '#d98fa0', 4);
    note(74, 16, 26, 20, '#d8d8d0', 7);
    note(12, 46, 12, 12, '#8fb8d8', 4);
    note(32, 42, 12, 12, '#d9cf7a', 4);
    note(82, 48, 12, 12, '#d9cf7a', 4);
    for (const [x, y] of [[48, 44], [64, 46]]) {
      g.save();
      g.translate(x, y);
      g.rotate((r() - 0.5) * 0.25);
      fill(g, '#e2ddd0', -8, -6, 16, 13);
      fill(g, pick(r, ['#2b3a3f', '#3f2f2a', '#252a35']), -7, -5, 14, 9);
      fill(g, '#a02a22', -1, -6, 2, 2);
      g.restore();
    }
  });
}

// A wall calendar: a picture on top, the month below, one date ringed.
function calendar(seed) {
  return paint(40, 60, seed, (g, r, w, h) => {
    fill(g, '#d8d4c6', 0, 0, w, h);
    const sky = g.createLinearGradient(0, 2, 0, 24);
    sky.addColorStop(0, '#2c4a78');
    sky.addColorStop(1, '#d08a4a');
    fill(g, sky, 2, 2, w - 4, 22);
    g.fillStyle = '#243024';
    g.beginPath();
    g.moveTo(2, 24);
    g.lineTo(12, 14);
    g.lineTo(22, 22);
    g.lineTo(30, 16);
    g.lineTo(38, 24);
    g.fill();
    fill(g, '#9a231d', 2, 26, w - 4, 6);
    g.font = 'bold 6px Arial';
    g.textAlign = 'center';
    g.fillStyle = '#e8e2d2';
    g.fillText('NOVEMBER', w / 2, 31);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) fill(g, col === 0 ? '#9a231d' : '#33322e', 4 + col * 5, 36 + row * 4.5, 3, 2);
    }
    g.strokeStyle = '#b02a22';
    g.lineWidth = 1;
    g.strokeRect(8.5, 44.5, 5, 4);
    fill(g, '#55524a', w / 2 - 1, 0, 2, 2);
    speckle(g, r, w, h, 0.04);
  });
}

// A clock face, stopped.
function clockFace(seed) {
  return paint(48, 48, seed, (g, r, w, h) => {
    fill(g, '#2a2420', 0, 0, w, h);
    g.fillStyle = '#d6d0bf';
    g.beginPath();
    g.arc(24, 24, 21, 0, TAU);
    g.fill();
    g.fillStyle = '#26221e';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      g.fillRect(24 + Math.sin(a) * 18 - 1, 24 - Math.cos(a) * 18 - 1, 2, 2);
    }
    g.strokeStyle = '#191613';
    g.lineCap = 'round';
    const hand = (turn, length, width) => {
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(24, 24);
      g.lineTo(24 + Math.sin(turn * TAU) * length, 24 - Math.cos(turn * TAU) * length);
      g.stroke();
    };
    hand(3.12 / 12, 10, 2.4); // a little past three
    hand(7 / 60, 16, 1.4); // seven minutes past
    blots(g, r, w, h, 4, [90, 70, 30], 0.15, 6, 16, false);
    speckle(g, r, w, h, 0.03);
  });
}

// Framed pictures.
function landscape(seed) {
  return paint(64, 44, seed, (g, r, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, 26);
    sky.addColorStop(0, '#27374f');
    sky.addColorStop(1, '#b77a4c');
    fill(g, sky, 0, 0, w, 26);
    g.fillStyle = '#1e2a25';
    g.beginPath();
    g.moveTo(0, 26);
    g.lineTo(14, 16);
    g.lineTo(26, 23);
    g.lineTo(44, 12);
    g.lineTo(64, 24);
    g.lineTo(64, 28);
    g.lineTo(0, 28);
    g.fill();
    const water = g.createLinearGradient(0, 28, 0, h);
    water.addColorStop(0, '#6a5a4a');
    water.addColorStop(1, '#161c22');
    fill(g, water, 0, 28, w, h - 28);
    fill(g, '#0f1512', 46, 23, 8, 5);
    fill(g, '#d4a23c', 49, 25, 2, 2);
    for (let i = 0; i < 20; i++) fill(g, rgb([220, 180, 120], 0.25), r() * w, 29 + r() * 13, 2 + r() * 5, 1);
    speckle(g, r, w, h, 0.05);
  });
}

// An old studio photograph of three people. The faces never quite resolve.
function familyPhoto(seed) {
  return paint(48, 60, seed, (g, r, w, h) => {
    fill(g, '#8a7a60', 0, 0, w, h);
    blot(g, 24, 26, 34, [190, 175, 140], 0.5);
    g.fillStyle = '#2a2219';
    for (const [x, y, s] of [[13, 30, 1], [35, 30, 1], [24, 38, 0.8]]) {
      g.beginPath();
      g.arc(x, y - 7 * s, 4.2 * s, 0, TAU);
      g.fill();
      g.beginPath();
      g.moveTo(x - 8 * s, h);
      g.lineTo(x - 7 * s, y + 1);
      g.lineTo(x + 7 * s, y + 1);
      g.lineTo(x + 8 * s, h);
      g.fill();
    }
    blots(g, r, w, h, 6, [60, 45, 25], 0.2, 5, 14, false);
    speckle(g, r, w, h, 0.07);
  });
}

function certificate(seed) {
  return paint(60, 44, seed, (g, r, w, h) => {
    fill(g, '#d2cab2', 0, 0, w, h);
    g.strokeStyle = '#7a6a3a';
    g.lineWidth = 1;
    g.strokeRect(2.5, 2.5, w - 5, h - 5);
    fill(g, '#3a3428', 16, 8, 28, 3);
    scribble(g, r, 10, 15, 40, 6, [70, 64, 52], 3);
    g.fillStyle = '#a8862c';
    g.beginPath();
    g.arc(46, 34, 4, 0, TAU);
    g.fill();
    speckle(g, r, w, h, 0.04);
  });
}

// What is on the PC: a video editing program, paused on a shot of a corridor.
function editingScreen(seed) {
  return paint(128, 72, seed, (g, r, w, h) => {
    fill(g, '#16181d', 0, 0, w, h);
    fill(g, '#252830', 0, 0, w, 4);
    for (let i = 0; i < 6; i++) fill(g, '#6a6e78', 3 + i * 9, 1, 6, 2);
    // The viewer: a corridor running away to a lit doorway.
    fill(g, '#07090a', 4, 7, 64, 36);
    g.fillStyle = '#131a1a';
    g.beginPath();
    g.moveTo(4, 7);
    g.lineTo(30, 20);
    g.lineTo(30, 30);
    g.lineTo(4, 43);
    g.fill();
    g.beginPath();
    g.moveTo(68, 7);
    g.lineTo(42, 20);
    g.lineTo(42, 30);
    g.lineTo(68, 43);
    g.fill();
    g.fillStyle = '#1c2424';
    g.beginPath();
    g.moveTo(4, 43);
    g.lineTo(30, 30);
    g.lineTo(42, 30);
    g.lineTo(68, 43);
    g.fill();
    fill(g, '#5f7672', 33, 21, 6, 9);
    // The bin of clips.
    fill(g, '#1c1f26', 72, 7, 52, 36);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) fill(g, pick(r, ['#2b3a3f', '#3f2f2a', '#252a35', '#30382c', '#3a3340']), 75 + col * 12, 10 + row * 11, 10, 7);
    }
    // The timeline.
    fill(g, '#101216', 0, 46, w, 26);
    fill(g, '#2a2e36', 0, 46, w, 3);
    for (let x = 0; x < w; x += 8) fill(g, '#565b66', x, 46, 1, 2);
    const track = (y, colour, light) => {
      let x = 2 + Math.floor(r() * 6);
      while (x < w - 6) {
        const len = 6 + Math.floor(r() * 22);
        fill(g, colour, x, y, Math.min(len, w - 2 - x), 4);
        fill(g, light, x, y, Math.min(len, w - 2 - x), 1);
        x += len + (r() < 0.3 ? 4 + Math.floor(r() * 8) : 1);
      }
    };
    track(51, '#5d4590', '#8a72c0');
    track(56, '#2c7a82', '#55aab2');
    track(61, '#33703a', '#5aa262');
    track(66, '#33703a', '#5aa262');
    fill(g, '#d83a2e', 58, 46, 1, 26);
    fill(g, '#d83a2e', 56, 46, 5, 2);
  });
}

function keyboard(seed) {
  return paint(64, 22, seed, (g, r, w, h) => {
    fill(g, '#141414', 0, 0, w, h);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 15; col++) fill(g, r() < 0.04 ? '#3a3a3a' : '#2a2a2b', 2 + col * 4, 2 + row * 4, 3, 3);
    }
    fill(g, '#2a2a2b', 18, 18, 24, 3);
  });
}

// A row of book spines, seen edge on.
function books(seed) {
  return paint(96, 32, seed, (g, r, w, h) => {
    fill(g, '#0c0a08', 0, 0, w, h);
    const colours = [[110, 40, 35], [40, 60, 90], [50, 80, 55], [150, 130, 80], [60, 50, 70], [130, 120, 105], [30, 30, 34], [120, 70, 30]];
    let x = 1;
    while (x < w - 3) {
      const bw = 3 + Math.floor(r() * 6);
      const bh = 19 + Math.floor(r() * 12);
      const c = tint(pick(r, colours), 0.8 + r() * 0.4);
      fill(g, c, x, h - bh, bw, bh);
      fill(g, rgb([255, 255, 255], 0.3), x, h - bh + 4, bw, 2);
      fill(g, rgb([0, 0, 0], 0.3), x + bw - 1, h - bh, 1, bh);
      x += bw + (r() < 0.08 ? 2 : 0);
    }
  });
}

function switchboard(seed) {
  return paint(24, 16, seed, (g, r, w, h) => {
    fill(g, '#c9c5b5', 0, 0, w, h);
    fill(g, rgb([0, 0, 0], 0.25), 0, h - 1, w, 1);
    for (let i = 0; i < 3; i++) {
      fill(g, '#8f8c80', 2 + i * 5, 3, 4, 9);
      fill(g, '#e2dfd2', 2 + i * 5, r() < 0.5 ? 3 : 8, 4, 4);
    }
    fill(g, '#8f8c80', 17, 3, 5, 9);
    for (const [x, y] of [[19, 5], [18, 9], [20, 9]]) fill(g, '#1a1a1a', x, y, 1, 2);
    blots(g, r, w, h, 3, [70, 55, 30], 0.3, 3, 8, false);
  });
}

function stoveTop(seed, burners = 2) {
  return paint(30 * burners + 4, 36, seed, (g, r, w, h) => {
    for (let y = 0; y < h; y++) fill(g, tint([150, 152, 150], 1 + (r() - 0.5) * 0.08), 0, y, w, 1);
    for (let n = 0; n < burners; n++) {
      const x = 17 + n * 30;
      g.fillStyle = '#131313';
      g.beginPath();
      g.arc(x, 18, 11, 0, TAU);
      g.fill();
      g.strokeStyle = '#2f2f2f';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, 18, 6, 0, TAU);
      g.stroke();
      fill(g, '#3a3a3a', x - 12, 17, 24, 2);
      fill(g, '#3a3a3a', x - 1, 6, 2, 24);
    }
    blots(g, r, w, h, 8, [60, 40, 15], 0.25, 3, 10, false);
  });
}

function newspaper(seed) {
  return paint(48, 64, seed, (g, r, w, h) => {
    fill(g, '#b9b4a3', 0, 0, w, h);
    fill(g, '#2a2824', 3, 3, 42, 5);
    fill(g, '#55524a', 3, 11, 20, 14);
    for (const x of [26, 36]) scribble(g, r, x, 11, 9, 7, [50, 48, 44]);
    for (const x of [3, 14, 25, 36]) scribble(g, r, x, 29, 9, 16, [50, 48, 44]);
    fill(g, rgb([0, 0, 0], 0.12), 0, Math.round(h / 2), w, 1);
    speckle(g, r, w, h, 0.05);
  });
}

// The view out of the bedroom window: other buildings at night.
function skyline(seed) {
  return paint(256, 128, seed, (g, r, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#04060c');
    sky.addColorStop(0.7, '#141a26');
    sky.addColorStop(1, '#2a2620');
    fill(g, sky, 0, 0, w, h);
    let x = 0;
    while (x < w) {
      const bw = 18 + Math.floor(r() * 30);
      const top = 30 + Math.floor(r() * 60);
      fill(g, tint([14, 16, 22], 0.7 + r() * 0.6), x, top, bw, h - top);
      if (r() < 0.5) fill(g, '#0a0c10', x + 3 + Math.floor(r() * (bw - 10)), top - 6, 6, 6); // water tank
      for (let wy = top + 5; wy < h - 4; wy += 7) {
        for (let wx = x + 3; wx < x + bw - 4; wx += 6) {
          if (r() < 0.1) fill(g, pick(r, ['#c9a24a', '#b8c4d0', '#c98a3a']), wx, wy, 3, 3);
        }
      }
      x += bw + 1;
    }
    speckle(g, r, w, h, 0.03);
  });
}

// Streaks and dirt on glass. Mostly see-through.
function grime(seed) {
  return paint(64, 64, seed, (g, r, w, h) => {
    for (let i = 0; i < 26; i++) fill(g, rgb([190, 200, 205], 0.05 + r() * 0.09), Math.floor(r() * w), Math.floor(r() * h * 0.5), 1 + Math.floor(r() * 2), 10 + r() * 50);
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) blot(g, x, y, 34, [150, 150, 140], 0.3);
    blots(g, r, w, h, 8, [180, 185, 185], 0.07, 6, 18, false);
  });
}

function mirror(seed) {
  return paint(32, 48, seed, (g, r, w, h) => {
    const depth = g.createLinearGradient(0, 0, w, h);
    depth.addColorStop(0, '#1c2228');
    depth.addColorStop(0.5, '#0c1014');
    depth.addColorStop(1, '#161b20');
    fill(g, depth, 0, 0, w, h);
    for (let i = 0; i < 40; i++) fill(g, rgb([0, 0, 0], 0.6), pick(r, [r() * 3, w - 1 - r() * 3, r() * w]), pick(r, [r() * h, h - 1 - r() * 4]), 1, 1);
    blots(g, r, w, h, 6, [120, 130, 135], 0.08, 4, 12, false);
    fill(g, rgb([150, 160, 165], 0.1), 5, 30, 14, 1);
  });
}

function airCon(seed) {
  return paint(64, 20, seed, (g, r, w, h) => {
    fill(g, '#b4b3aa', 0, 0, w, h);
    fill(g, rgb([255, 255, 255], 0.2), 0, 0, w, 1);
    fill(g, '#2c2c2c', 3, 14, w - 6, 3);
    fill(g, '#8e8d86', 3, 12, w - 6, 1);
    blots(g, r, w, h, 6, [80, 65, 30], 0.14, 4, 12, false);
    speckle(g, r, w, h, 0.03);
  });
}

// The fuse box by the front door.
function fuseBox(seed) {
  return paint(32, 24, seed, (g, r, w, h) => {
    fill(g, '#8f9088', 0, 0, w, h);
    fill(g, '#55564f', 3, 6, 26, 12);
    for (let i = 0; i < 6; i++) {
      fill(g, '#1c1c1c', 5 + i * 4, 8, 3, 8);
      fill(g, '#c9c5b5', 5 + i * 4, r() < 0.85 ? 8 : 13, 3, 3);
    }
    fill(g, '#d8d4c0', 4, 20, 12, 2);
    speckle(g, r, w, h, 0.04);
  });
}

function rug(seed) {
  return paint(96, 64, seed, (g, r, w, h) => {
    fill(g, '#5a2420', 0, 0, w, h);
    for (let x = 6; x < w - 6; x += 12) fill(g, '#1c1a18', x, 6, 6, h - 12);
    fill(g, '#b7a67c', 4, 4, w - 8, 2);
    fill(g, '#b7a67c', 4, h - 6, w - 8, 2);
    fill(g, '#b7a67c', 4, 4, 2, h - 8);
    fill(g, '#b7a67c', w - 6, 4, 2, h - 8);
    for (let y = 0; y < h; y += 2) {
      fill(g, '#b7a67c', 0, y, 3, 1);
      fill(g, '#b7a67c', w - 3, y, 3, 1);
    }
    blots(g, r, w, h, 8, [0, 0, 0], 0.16, 8, 22, false);
    speckle(g, r, w, h, 0.09);
  });
}

function doormat(seed) {
  return paint(48, 32, seed, (g, r, w, h) => {
    fill(g, '#6a5234', 0, 0, w, h);
    g.strokeStyle = '#231c12';
    g.lineWidth = 2;
    g.strokeRect(2, 2, w - 4, h - 4);
    g.font = 'bold 8px Arial';
    g.textAlign = 'center';
    g.fillStyle = '#231c12';
    g.fillText('WELCOME', w / 2, 19);
    blots(g, r, w, h, 6, [30, 25, 15], 0.3, 5, 14, false);
    speckle(g, r, w, h, 0.14);
  });
}

// One side of a cardboard box: tape down the middle and a label.
function boxSide(seed) {
  return paint(48, 48, seed, (g, r, w, h) => {
    fill(g, [136, 104, 66], 0, 0, w, h);
    for (let y = 0; y < h; y += 3) fill(g, rgb([0, 0, 0], 0.06), 0, y, w, 1);
    fill(g, rgb([190, 170, 120], 0.6), 20, 0, 8, h);
    fill(g, '#cfc9b6', 30, 28, 14, 10);
    scribble(g, r, 31, 30, 11, 3, [40, 40, 40], 3);
    blots(g, r, w, h, 5, [60, 40, 20], 0.18, 6, 18, false);
    speckle(g, r, w, h, 0.05);
  });
}

// A bedside clock's red digits.
function digits(seed, text, colour = '#ff2a14') {
  return paint(32, 12, seed, (g) => {
    fill(g, '#050505', 0, 0, 32, 12);
    g.font = 'bold 11px Courier New';
    g.textAlign = 'center';
    g.fillStyle = colour;
    g.fillText(text, 16, 10);
  });
}

function purifier(seed) {
  return paint(24, 40, seed, (g, r, w, h) => {
    fill(g, '#bdbcb2', 0, 0, w, h);
    fill(g, '#22384a', 4, 14, 16, 20);
    fill(g, rgb([120, 170, 200], 0.35), 4, 22, 16, 12);
    fill(g, '#8a8980', 4, 5, 16, 5);
    speckle(g, r, w, h, 0.03);
  });
}

// The exhaust fan set high in the kitchen wall.
function exhaust(seed) {
  return paint(32, 32, seed, (g, r, w, h) => {
    fill(g, '#56564f', 0, 0, w, h);
    g.fillStyle = '#0a0a0a';
    g.beginPath();
    g.arc(16, 16, 13, 0, TAU);
    g.fill();
    g.strokeStyle = '#2e2e2a';
    g.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(16, 16);
      g.lineTo(16 + Math.cos(i * TAU / 4 + 0.4) * 12, 16 + Math.sin(i * TAU / 4 + 0.4) * 12);
      g.stroke();
    }
    blots(g, r, w, h, 6, [60, 45, 15], 0.4, 4, 12, false);
  });
}

// A steel basin seen from above, with a drain.
function basin(seed, base) {
  return paint(32, 32, seed, (g, r, w, h) => {
    fill(g, tint(base, 0.9), 0, 0, w, h);
    blot(g, 16, 16, 20, [0, 0, 0], 0.55);
    fill(g, rgb([255, 255, 255], 0.2), 0, 0, w, 1);
    fill(g, rgb([255, 255, 255], 0.14), 0, 0, 1, h);
    g.fillStyle = '#0a0a0a';
    g.beginPath();
    g.arc(16, 17, 2.5, 0, TAU);
    g.fill();
    blots(g, r, w, h, 4, [80, 60, 30], 0.18, 3, 9, false);
  });
}

function drain(seed) {
  return paint(16, 16, seed, (g) => {
    fill(g, '#6c6e6c', 0, 0, 16, 16);
    for (let y = 3; y < 14; y += 3) for (let x = 3; x < 14; x += 3) fill(g, '#0a0a0a', x, y, 2, 2);
  });
}

function pillow(seed) {
  return paint(48, 32, seed, (g, r, w, h) => {
    fill(g, '#a9a69a', 0, 0, w, h);
    blot(g, 24, 16, 30, [255, 255, 255], 0.16);
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) blot(g, x, y, 16, [0, 0, 0], 0.3);
    for (let x = 4; x < w; x += 6) fill(g, rgb([90, 100, 120], 0.25), x, 0, 1, h);
    speckle(g, r, w, h, 0.05);
  });
}

// A soft round glow, used for the haze around lit bulbs.
function glow() {
  return paint(64, 64, 1, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
}

// The buildings across the lane at night: one long painted backdrop. It is
// 26 m wide and 14 m tall in the world, so one floor is about 55 pixels.
function facade(seed) {
  return paint(512, 256, seed, (g, r, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, 130);
    sky.addColorStop(0, '#05070d');
    sky.addColorStop(1, '#1b1d24');
    fill(g, sky, 0, 0, w, h);
    // A far skyline behind everything.
    let x = 0;
    while (x < w) {
      const bw = 14 + Math.floor(r() * 26);
      const top = 36 + Math.floor(r() * 50);
      fill(g, '#0b0d13', x, top, bw, h - top);
      for (let i = 0; i < 3; i++) if (r() < 0.4) fill(g, pick(r, ['#8a7238', '#7c8a94']), x + 2 + r() * (bw - 5), top + 4 + r() * 40, 2, 2);
      x += bw;
    }
    // The near buildings, side by side.
    x = -10;
    while (x < w) {
      const bw = 70 + Math.floor(r() * 60);
      const top = 18 + Math.floor(r() * 95);
      const wall = tint(pick(r, [[30, 30, 36], [36, 31, 28], [27, 33, 33], [38, 36, 30]]), 0.8 + r() * 0.4);
      fill(g, wall, x, top, bw - 3, h - top);
      fill(g, tint(wall, 0.65), x, top, bw - 3, 3);
      if (r() < 0.7) fill(g, '#07080b', x + 6 + r() * (bw - 30), top - 12, 14, 12); // water tank
      if (r() < 0.4) fill(g, '#07080b', x + bw * 0.6, top - 20, 1, 20); // aerial
      for (let fy = top + 14; fy < h - 30; fy += 55) {
        const count = Math.max(1, Math.floor((bw - 12) / 34));
        for (let i = 0; i < count; i++) {
          const wx = x + 8 + i * 34;
          const chance = r();
          const lit = chance < 0.17;
          const glass = chance < 0.12 ? pick(r, [[200, 160, 80], [190, 200, 205], [205, 140, 70]]) : lit ? [70, 100, 140] : [10, 13, 18];
          fill(g, tint(wall, 0.6), wx - 1, fy - 1, 24, 27);
          fill(g, glass, wx, fy, 22, 24);
          if (lit) fill(g, rgb([0, 0, 0], 0.4), wx + (r() < 0.5 ? 0 : 13), fy, 9, 24); // a curtain
          g.fillStyle = rgb([0, 0, 0], 0.5);
          for (let gx = wx + 3; gx < wx + 22; gx += 4) g.fillRect(gx, fy, 1, 24); // window grill
          g.fillRect(wx, fy + 12, 22, 1);
          fill(g, rgb([0, 0, 0], 0.25), wx + 2 + r() * 16, fy + 26, 2, 8 + r() * 14); // a stain under the sill
          if (r() < 0.25) fill(g, '#3a3c3e', wx + 4, fy + 28, 12, 8); // air conditioner
        }
        if (r() < 0.35) {
          fill(g, rgb([0, 0, 0], 0.5), x + 4, fy + 30, bw - 12, 2); // balcony rail, with washing
          for (let c = 0; c < 4; c++) fill(g, rgb(pick(r, [[120, 60, 50], [60, 80, 110], [140, 130, 110], [70, 100, 70]]), 0.6), x + 10 + r() * (bw - 30), fy + 32, 5, 9);
        }
      }
      fill(g, rgb([0, 0, 0], 0.45), x + bw - 8, top, 2, h - top); // drain pipe
      x += bw;
    }
    blot(g, w * 0.5, 150, 170, [230, 130, 40], 0.22); // the street lamp washes the middle orange
    const haze = g.createLinearGradient(0, h - 50, 0, h);
    haze.addColorStop(0, 'rgba(0,0,0,0)');
    haze.addColorStop(1, 'rgba(0,0,0,0.6)');
    fill(g, haze, 0, h - 50, w, 50);
    speckle(g, r, w, h, 0.03);
  });
}

// The lane below the windows, seen from above: tarmac and a pool of lamplight.
function lane(seed) {
  return paint(96, 256, seed, (g, r, w, h) => {
    fill(g, '#0d0d0f', 0, 0, w, h);
    blots(g, r, w, h, 14, [255, 255, 255], 0.03, 8, 30, false);
    blot(g, 32, 128, 74, [230, 130, 40], 0.5);
    for (let i = 0; i < 7; i++) fill(g, '#040405', 6 + r() * 8, 20 + i * 34 + r() * 10, 5, 14); // parked scooters
    fill(g, '#1a1a1c', 0, 0, 3, h);
    fill(g, '#1a1a1c', w - 3, 0, 3, h);
    speckle(g, r, w, h, 0.04);
  });
}

function microwave(seed) {
  return paint(48, 28, seed, (g, r, w, h) => {
    fill(g, '#2a2a2c', 0, 0, w, h);
    fill(g, '#08090b', 3, 3, 30, 22);
    fill(g, rgb([255, 255, 255], 0.08), 5, 5, 8, 18);
    fill(g, '#3c3c3e', 33, 3, 2, 22);
    fill(g, '#1a1a1c', 37, 3, 9, 22);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) fill(g, '#4a4a4c', 38 + col * 4, 11 + row * 3.5, 3, 2);
    speckle(g, r, w, h, 0.02);
  });
}

// The front of a washing machine.
function washer(seed) {
  return paint(40, 56, seed, (g, r, w, h) => {
    fill(g, '#b9b9b0', 0, 0, w, h);
    fill(g, '#8f8f88', 0, 0, w, 10);
    fill(g, '#a9a9a0', 3, 2, 14, 6);
    fill(g, '#2a2a2a', 28, 3, 5, 5);
    g.fillStyle = '#6f6f6a';
    g.beginPath();
    g.arc(20, 32, 14, 0, TAU);
    g.fill();
    g.fillStyle = '#0c0f12';
    g.beginPath();
    g.arc(20, 32, 11, 0, TAU);
    g.fill();
    fill(g, rgb([255, 255, 255], 0.1), 13, 26, 5, 8);
    for (let i = 0; i < 12; i++) blot(g, r() * w, h - r() * 10, 2 + r() * 4, [110, 60, 30], 0.35);
    speckle(g, r, w, h, 0.03);
  });
}

// An old tube television, switched off.
function tube(seed) {
  return paint(48, 40, seed, (g, r, w, h) => {
    fill(g, '#3a3a38', 0, 0, w, h);
    fill(g, '#10140f', 4, 4, 40, 27);
    blot(g, 16, 12, 16, [150, 170, 150], 0.2);
    for (let x = 5; x < 30; x += 2) fill(g, '#262624', x, 33, 1, 4);
    for (let i = 0; i < 3; i++) fill(g, '#5a5a54', 34 + i * 4, 34, 2, 2);
    speckle(g, r, w, h, 0.04);
  });
}

// A stack of video tapes, seen from the label end.
function tapes(seed) {
  return paint(48, 24, seed, (g, r, w, h) => {
    fill(g, '#060606', 0, 0, w, h);
    for (let i = 0; i < 6; i++) {
      fill(g, '#161616', 0, i * 4, w, 3);
      fill(g, pick(r, ['#cfc9b6', '#d8d8d0', '#c9c08a']), 5, i * 4, 36, 3);
      scribble(g, r, 8, i * 4 + 1, 26, 1, [30, 30, 60]);
    }
  });
}

// The pale patch a picture leaves on a wall after it is taken down.
function ghost(seed) {
  return paint(40, 52, seed, (g, r, w, h) => {
    fill(g, rgb([255, 255, 255], 0.1), 2, 2, w - 4, h - 4);
    g.strokeStyle = rgb([40, 30, 20], 0.35);
    g.lineWidth = 2;
    g.strokeRect(2, 2, w - 4, h - 4);
    for (const [x, y] of [[1, 1], [w - 6, 1], [1, h - 4], [w - 6, h - 4]]) fill(g, rgb([200, 190, 150], 0.4 + r() * 0.2), x, y, 5, 3);
  });
}

// A wooden wardrobe: three doors, long handles, loft doors above.
function wardrobe(seed) {
  return paint(108, 126, seed, (g, r, w, h) => {
    let drift = 0;
    for (let x = 0; x < w; x++) {
      drift = drift * 0.8 + (r() - 0.5) * 0.3;
      fill(g, tint([104, 74, 48], 1 + drift * 0.4), x, 0, 1, h);
    }
    fill(g, rgb([0, 0, 0], 0.5), 0, 26, w, 1);
    for (const x of [36, 72]) fill(g, rgb([0, 0, 0], 0.55), x, 0, 1, h);
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = rgb([0, 0, 0], 0.22);
      g.lineWidth = 1;
      g.strokeRect(i * 36 + 4.5, 31.5, 27, h - 37);
      fill(g, '#b4b6b2', i * 36 + (i === 1 ? 4 : 30), 70, 2, 16);
    }
    blots(g, r, w, h, 8, [0, 0, 0], 0.1, 8, 26, false);
    speckle(g, r, w, h, 0.035);
  });
}

// Two more framed pictures: a block painting and a misty treeline.
function abstractArt(seed) {
  return paint(48, 60, seed, (g, r, w, h) => {
    fill(g, '#b8ae98', 0, 0, w, h);
    const colours = ['#7a2e26', '#2f4a58', '#c29a3a', '#26221e', '#6a7a5a'];
    for (let i = 0; i < 9; i++) fill(g, pick(r, colours), Math.floor(r() * 36), Math.floor(r() * 46), 8 + Math.floor(r() * 18), 8 + Math.floor(r() * 20));
    g.strokeStyle = '#26221e';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(4, 50);
    g.lineTo(44, 12);
    g.stroke();
    speckle(g, r, w, h, 0.05);
  });
}

function forest(seed) {
  return paint(60, 44, seed, (g, r, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#7f8a8a');
    sky.addColorStop(1, '#c2bca6');
    fill(g, sky, 0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const top = 6 + r() * 16;
      fill(g, rgb([18, 24, 20], 0.75 + r() * 0.25), r() * w, top, 1 + Math.floor(r() * 3), h - top);
    }
    fill(g, '#141a16', 0, h - 7, w, 7);
    blot(g, 30, 30, 22, [200, 196, 176], 0.25);
    speckle(g, r, w, h, 0.05);
  });
}

// --- The full set ---------------------------------------------------------

export function createTextures() {
  const damp = (g, r, w, h) => {
    // Mould low down, soap streaks, and a little rust.
    for (let i = 0; i < 40; i++) blot(g, r() * w, h - r() * r() * h * 0.45, 5 + r() * 14, [28, 38, 30], 0.2);
    for (let i = 0; i < 14; i++) fill(g, rgb([225, 230, 225], 0.07), Math.floor(r() * w), r() * h * 0.6, 1 + Math.floor(r() * 2), 30 + r() * 90);
    for (let i = 0; i < 6; i++) fill(g, rgb([120, 70, 30], 0.2), Math.floor(r() * w), r() * h * 0.7, 1, 20 + r() * 50);
  };
  const grease = (g, r, w, h) => blots(g, r, w, h, 12, [95, 75, 20], 0.14, 8, 26);
  const footworn = (g, r, w, h) => {
    blots(g, r, w, h, 10, [45, 35, 20], 0.14, 10, 40);
  };

  return {
    // Walls, ceilings and floors. The second and third numbers are metres.
    studyWall: tiling(wallPaint(11, [138, 148, 134]), 2.8),
    bed1Wall: tiling(wallPaint(9, [128, 140, 150]), 2.8),
    bed2Wall: tiling(wallPaint(10, [156, 136, 124], 1.6), 2.8),
    storeWall: tiling(wallPaint(8, [130, 128, 120], 2), 2.8),
    hallWall: tiling(wallPaint(12, [158, 148, 122], 1.2), 2.8),
    kitchenWall: tiling(wallPaint(13, [160, 150, 112], 1.4), 2.8),
    cement: tiling(plaster(7, [98, 96, 92]), 1.4),
    ceiling: tiling(plaster(14, [150, 148, 138]), 1.4),
    plaster: tiling(plaster(15, [140, 136, 122]), 1.4),
    bathWall: tiling(tiles(16, 10, 14, 25, [150, 168, 164], [62, 72, 70], { band: [5], bandColour: [58, 96, 102], after: damp }), 2.0, 2.8),
    backsplash: tiling(tiles(17, 8, 8, 12, [168, 166, 152], [80, 78, 68], { after: grease }), 0.8),
    mosaic: tiling(mosaic(18), 1.4),
    kitchenFloor: tiling(tiles(19, 4, 4, 32, [140, 128, 108], [58, 52, 44], { vary: 0.16, after: footworn }), 1.4),
    bathFloor: tiling(tiles(20, 10, 10, 12, [62, 72, 78], [104, 110, 110], { vary: 0.2, after: footworn }), 1.2),

    // Wood, cloth, metal and the rest.
    woodDark: tiling(wood(21, [78, 54, 36]), 0.7),
    woodMid: tiling(wood(22, [112, 80, 54]), 0.7),
    woodLight: tiling(wood(23, [146, 120, 88], { contrast: 0.7 }), 0.7),
    laminate: tiling(wood(24, [158, 154, 140], { contrast: 0.25, lines: 3 }), 0.7),
    sheet: tiling(cloth(25, [132, 134, 150], { stripes: [[4, 2, [104, 108, 132]], [20, 2, [104, 108, 132]]], upright: true }), 0.35),
    blanket: tiling(plaid(26, [104, 44, 40], [40, 28, 26], [176, 140, 70]), 0.7),
    curtain: tiling(cloth(27, [122, 92, 46], { stripes: [[6, 3, [96, 66, 32]], [22, 3, [96, 66, 32]]], upright: true }), 0.35),
    towel: tiling(cloth(28, [120, 144, 160], { stripes: [[3, 3, [196, 198, 190]], [10, 1, [196, 198, 190]]], rough: 0.1 }), 0.35),
    napkin: tiling(cloth(29, [170, 166, 150], { size: 16, stripes: [[0, 4, [150, 50, 44]], [8, 4, [150, 50, 44]]] }), 0.12),
    clothDark: tiling(cloth(30, [44, 46, 54]), 0.3),
    clothOlive: tiling(cloth(31, [62, 70, 52]), 0.3),
    clothBlue: tiling(cloth(32, [52, 70, 104]), 0.3),
    clothGrey: tiling(cloth(33, [120, 118, 112]), 0.3),
    steel: tiling(metal(34, [150, 154, 158]), 0.5),
    darkMetal: tiling(metal(35, [38, 38, 42], 0.16), 0.5),
    granite: tiling(granite(36), 0.6),
    cardboard: tiling(cardboard(37), 0.6),
    whitePlastic: tiling(plain(38, [176, 174, 164]), 0.4),
    blackPlastic: tiling(plain(39, [26, 26, 28], 0.1), 0.4),
    ceramic: tiling(plain(40, [176, 180, 176], 0.09), 0.5),
    paper: tiling(plain(41, [190, 186, 170]), 0.3),

    // Stretched to fit one surface.
    doorWood: fitted(door(50, [112, 78, 50])),
    doorFront: fitted(door(51, [74, 48, 32], { peephole: true })),
    doorBath: fitted(door(52, [150, 150, 138], { grain: 0.08, damp: true })),
    cupboard: fitted(cupboard(53)),
    cabinetsLow: fitted(cabinets(54, 204, 62, 5, [150, 142, 120], 'top')),
    cabinetsWest: fitted(cabinets(102, 100, 62, 3, [150, 142, 120], 'top')),
    cabinetsHigh2: fitted(cabinets(55, 60, 56, 2, [150, 142, 120], 'bottom')),
    cabinetsHigh3: fitted(cabinets(103, 92, 56, 3, [150, 142, 120], 'bottom')),
    drawers: fitted(cabinets(56, 20, 56, 1, [146, 120, 88], 'top')),
    fridge: fitted(fridge(57)),
    posterMoon: fitted(posterMoon(58)),
    posterDoor: fitted(posterDoor(59)),
    posterFest: fitted(posterFest(60)),
    pinboard: fitted(pinboard(61)),
    calendar: fitted(calendar(62)),
    clock: fitted(clockFace(63)),
    landscape: fitted(landscape(64)),
    familyPhoto: fitted(familyPhoto(65)),
    certificate: fitted(certificate(66)),
    abstractArt: fitted(abstractArt(100)),
    forest: fitted(forest(101)),
    screen: fitted(editingScreen(67)),
    keyboard: fitted(keyboard(68)),
    books: [fitted(books(69)), fitted(books(70)), fitted(books(71))],
    switchboard: fitted(switchboard(72)),
    stoveTop: fitted(stoveTop(73, 3)),
    newspaper: fitted(newspaper(74)),
    skyline: fitted(skyline(75)),
    grime: fitted(grime(76)),
    mirror: fitted(mirror(77)),
    airCon: fitted(airCon(78)),
    fuseBox: fitted(fuseBox(79)),
    rug: fitted(rug(80)),
    doormat: fitted(doormat(81)),
    boxSide: fitted(boxSide(82)),
    digits: fitted(digits(83, '3:07')),
    digitsGreen: fitted(digits(83, '3:07', '#3cff6a')),
    purifier: fitted(purifier(84)),
    exhaust: fitted(exhaust(85)),
    sinkSteel: fitted(basin(86, [150, 154, 158])),
    sinkCeramic: fitted(basin(87, [176, 180, 176])),
    drain: fitted(drain(88)),
    pillow: fitted(pillow(89)),
    glow: fitted(glow()),
    facade: fitted(facade(90)),
    lane: fitted(lane(91)),
    microwave: fitted(microwave(92)),
    washer: fitted(washer(93)),
    tube: fitted(tube(94)),
    tapes: fitted(tapes(95)),
    ghost: fitted(ghost(96)),
    wardrobe: fitted(wardrobe(97)),
    sideboard: fitted(cabinets(98, 96, 60, 3, [112, 80, 54], 'top')),
    tallUnit: fitted(cabinets(99, 40, 60, 2, [150, 142, 120], 'top')),
  };
}
