// Furniture and small objects that turn up in more than one room. Each
// function builds one thing out of the blocks in build.js.
//
// None of these make the player collide with anything. The room files add
// the barriers themselves, one per piece or one for a whole cluster, so that
// no gap is left that is too narrow to walk through.
export function createFurniture(b, M, f) {
  const TAU = Math.PI * 2;

  // A bed. Its foot is at (footX, footZ) and it runs `length` towards +z
  // before being swung round by turn. Options: pillows, bare (stripped down
  // to the mattress), blanket (false for none).
  function bed(footX, footZ, turn, width, length, opts = {}) {
    const w = width / 2;
    b.group(footX, 0, footZ, turn, () => {
      b.box(-w, w, 0, 0.3, 0, length, M.woodMid); // base
      b.box(-w, w, 0, 0.95, length - 0.06, length, M.woodMid); // headboard
      b.box(-w + 0.02, w - 0.02, 0.3, 0.46, 0.02, length - 0.07, opts.bare ? M.clothGrey : M.sheet); // mattress
      if (opts.bare) {
        b.box(-w + 0.12, w - 0.12, 0.46, 0.56, 0.1, 0.48, M.clothBlue); // one folded blanket, left behind
        return;
      }
      const pillows = opts.pillows ?? 1;
      for (let i = 0; i < pillows; i++) {
        const px = pillows === 1 ? 0 : (i - 0.5) * width * 0.5;
        b.group(px, 0.46, length - 0.33, i ? -0.12 : 0.1, () => b.box(-0.3, 0.3, 0, 0.11, -0.19, 0.19, M.pillow));
      }
      if (opts.blanket === false) return;
      // An unmade bed: the blanket covers the foot end, hangs down one side,
      // and has been thrown back in a ragged line.
      const top = 0.5; // clear of the mattress, even at the bottom of a wrinkle
      const cover = width - 0.08; // how much of the cloth lies on top before it hangs
      const total = cover + 0.42;
      b.cloth(12, 10, total, length * 0.62, M.blanket, (u, v) => {
        const s = u * total;
        const edge = length * (0.66 - 0.28 * u * u) + Math.sin(u * 11) * 0.04;
        const z = 0.03 + v * (edge - 0.03);
        const wrinkle = Math.sin(s * 9 + v * 5) * 0.014 + Math.sin(s * 17 - v * 11 + 1.3) * 0.01 + Math.sin(v * 23 + s * 3) * 0.008;
        const fold = 0.035 * Math.max(0, (v - 0.85) / 0.15);
        if (s <= cover) return [-w + 0.03 + s, top + wrinkle + fold, z];
        const down = s - cover;
        return [w + 0.015 + Math.sin(v * 14 + 1) * 0.015 + Math.min(down, 0.08) * 0.25, top - down + wrinkle * 0.3, z];
      });
    });
  }

  // A small cupboard beside a bed or a sofa.
  function sideTable(x0, x1, z0, z1, height) {
    b.box(x0 + 0.01, x1 - 0.01, 0, height - 0.02, z0 + 0.01, z1 - 0.01, M.woodMid);
    b.box(x0, x1, height - 0.02, height, z0, z1, M.woodDark);
  }

  // A plain four-legged chair. Before turn, it faces +z (its back is at -z).
  function chair(x, z, turn, material = M.woodDark, seat = material) {
    b.group(x, 0, z, turn, () => {
      for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) {
        b.box(lx - 0.02, lx + 0.02, 0, lz < 0 ? 0.92 : 0.44, lz - 0.02, lz + 0.02, material);
      }
      b.box(-0.22, 0.22, 0.44, 0.47, -0.22, 0.22, seat);
      b.box(-0.2, 0.2, 0.78, 0.9, -0.205, -0.175, material);
      b.box(-0.2, 0.2, 0.58, 0.64, -0.205, -0.175, material);
    });
  }

  // A low stool.
  function stool(x, z, height, material, size = 0.3) {
    const s = size / 2;
    b.box(x - s, x + s, height - 0.03, height, z - s, z + s, material);
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      b.box(x + lx * (s - 0.04) - 0.015, x + lx * (s - 0.04) + 0.015, 0, height - 0.03, z + lz * (s - 0.04) - 0.015, z + lz * (s - 0.04) + 0.015, material);
    }
  }

  // An office chair on wheels with a hoodie over the back. Before turn, it
  // faces -z (towards a desk on the north wall).
  function deskChair(x, z, turn) {
    b.group(x, 0, z, turn, () => {
      b.cyl(0, 0, 0.05, 0.08, 0.29, M.blackPlastic, { sides: 5 });
      for (let i = 0; i < 5; i++) b.cyl(Math.cos((i * TAU) / 5) * 0.26, Math.sin((i * TAU) / 5) * 0.26, 0, 0.05, 0.028, M.blackPlastic, { sides: 6 });
      b.cyl(0, 0, 0.08, 0.42, 0.03, M.darkMetal, { sides: 6 });
      b.box(-0.23, 0.23, 0.42, 0.5, -0.23, 0.23, M.clothDark); // seat
      b.box(-0.03, 0.03, 0.44, 0.62, 0.21, 0.25, M.blackPlastic);
      b.box(-0.21, 0.21, 0.56, 1.02, 0.2, 0.26, M.clothDark); // back
      for (const side of [-1, 1]) {
        b.box(Math.min(side * 0.22, side * 0.27), Math.max(side * 0.22, side * 0.27), 0.63, 0.66, -0.14, 0.16, M.blackPlastic);
        b.box(Math.min(side * 0.235, side * 0.255), Math.max(side * 0.235, side * 0.255), 0.48, 0.63, 0.06, 0.1, M.blackPlastic);
      }
      b.box(-0.235, 0.235, 0.68, 1.06, 0.26, 0.3, M.clothGrey); // the hoodie
      b.box(-0.29, -0.235, 0.5, 0.98, 0.22, 0.3, M.clothGrey);
      b.box(0.235, 0.29, 0.56, 0.98, 0.22, 0.3, M.clothGrey);
    });
  }

  // A cardboard box, by its corners.
  function carton(x0, x1, y0, y1, z0, z1) {
    b.box(x0, x1, y0, y1, z0, z1, b.sides(M.boxSide, { top: M.cardboard, bottom: M.cardboard }));
  }
  // A cardboard box sitting at (x, y, z), turned a little.
  function cartonAt(x, y, z, w, h, d, turn = 0) {
    b.group(x, y, z, turn, () => carton(-w / 2, w / 2, 0, h, -d / 2, d / 2));
  }

  // A row of books. `face` is the side the spines show on.
  function bookRow(x0, x1, y0, y1, z0, z1, face, which = 0) {
    b.box(x0, x1, y0, y1, z0, z1, b.sides(M.blackPlastic, { [face]: M.books[which % M.books.length], top: M.paper }));
  }

  // An open steel rack: four posts and flat shelves. Returns the shelf heights.
  function rack(x0, x1, z0, z1, height, levels) {
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) b.box(x - 0.015, x + 0.015, 0, height, z - 0.015, z + 0.015, M.darkMetal);
    const heights = [];
    for (let i = 0; i < levels; i++) {
      const y = 0.14 + (i * (height - 0.24)) / (levels - 1);
      heights.push(y);
      b.box(x0, x1, y - 0.015, y, z0, z1, M.darkMetal);
    }
    return heights;
  }

  // --- Small things --------------------------------------------------------

  function bottle(x, z, y, height, radius, material, cap = M.whitePlastic) {
    b.cyl(x, z, y, y + height * 0.7, radius, material, { sides: 8 });
    b.cyl(x, z, y + height * 0.7, y + height * 0.88, radius, material, { sides: 8, top: radius * 0.4 });
    b.cyl(x, z, y + height * 0.88, y + height, radius * 0.45, cap, { sides: 6 });
  }

  function jar(x, z, y, height, radius, material, lid) {
    b.cyl(x, z, y, y + height, radius, material, { sides: 8 });
    if (lid) b.cyl(x, z, y + height, y + height + 0.015, radius * 1.05, lid, { sides: 8 });
  }

  // A mug with a handle. `full` is what is in it, if anything.
  function mug(x, z, y, material, full) {
    b.cyl(x, z, y, y + 0.09, 0.034, material, { sides: 8, top: 0.04 });
    b.box(x + 0.036, x + 0.06, y + 0.02, y + 0.07, z - 0.008, z + 0.008, material);
    if (full) b.cyl(x, z, y + 0.08, y + 0.092, 0.036, full, { sides: 8, cast: false });
  }

  // A steel tumbler, the kind chai is drunk from.
  function tumbler(x, z, y, full) {
    b.cyl(x, z, y, y + 0.1, 0.027, M.steel, { sides: 8, top: 0.035 });
    if (full) b.cyl(x, z, y + 0.092, y + 0.102, 0.032, full, { sides: 8, cast: false });
  }

  function plate(x, z, y, radius = 0.13) {
    b.cyl(x, z, y, y + 0.012, radius * 0.8, M.steel, { sides: 12, top: radius });
  }

  // A potted plant with tall sword-shaped leaves.
  function plant(x, z, y, size = 1) {
    b.cyl(x, z, y, y + 0.17 * size, 0.065 * size, M.terracotta, { sides: 8, top: 0.09 * size });
    b.cyl(x, z, y + 0.15 * size, y + 0.175 * size, 0.08 * size, M.earth, { sides: 8, cast: false });
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4;
      const lean = (0.05 + (i % 3) * 0.05) * size;
      const tall = (0.32 + ((i * 7) % 5) * 0.07) * size;
      b.rod([x + Math.cos(a) * 0.02, y + 0.16 * size, z + Math.sin(a) * 0.02], [x + Math.cos(a) * lean, y + 0.16 * size + tall, z + Math.sin(a) * lean], 0.016 * size, M.leaf, { sides: 3 });
    }
  }

  // A table lamp, switched off.
  function tableLamp(x, z, y) {
    b.cyl(x, z, y, y + 0.02, 0.06, M.darkMetal, { sides: 8 });
    b.rod([x, y, z], [x, y + 0.22, z], 0.01, M.darkMetal);
    b.cyl(x, z, y + 0.2, y + 0.36, 0.11, M.paper, { sides: 10, top: 0.07 });
  }

  // A pair of slippers on the floor.
  function slippers(x, z, turn, material = M.rubber) {
    b.group(x, 0, z, turn, () => {
      for (const side of [-0.07, 0.07]) {
        b.box(side - 0.045, side + 0.045, 0, 0.02, -0.12, 0.12, material, { cast: false });
        b.box(side - 0.045, side + 0.045, 0.02, 0.045, 0.02, 0.07, material, { cast: false });
      }
    });
  }

  // A pair of shoes.
  function shoes(x, y, z, turn, material) {
    b.group(x, y, z, turn, () => {
      for (const side of [-0.065, 0.065]) {
        b.box(side - 0.045, side + 0.045, 0, 0.06, -0.13, 0.13, material);
        b.box(side - 0.045, side + 0.045, 0.06, 0.1, -0.13, 0.0, material);
      }
    });
  }

  // A soft heap: clothes on the floor, a full rubbish bag, a sack.
  function heap(x, y, z, w, h, d, material) {
    b.ball(x, y + h / 2, z, 0.5, material, { squash: [w, h, d], sides: 7 });
  }

  // A sheet thrown over something, hanging to the floor on all sides.
  function draped(x0, x1, z0, z1, height, material = M.dustSheet) {
    const ease = (t) => t * t * (3 - 2 * t);
    b.cloth(10, 10, x1 - x0, z1 - z0, material, (u, v) => {
      const edge = Math.min(u, 1 - u, v, 1 - v);
      const lift = ease(Math.min(1, edge / 0.22));
      const ripple = (1 - lift) * Math.sin((u + v) * 26) * 0.02;
      return [x0 + u * (x1 - x0) + ripple, 0.01 + lift * height + Math.sin(u * 7 + v * 5) * 0.012 * lift, z0 + v * (z1 - z0) + ripple];
    });
  }

  const rug = (x, z, w, d, spin = 0, material = M.rug) => b.panel(x, 0.004, z, w, d, '+y', material, { spin });
  const clock = (x, y, z, facing) => f.hung(x, y, z, 0.28, 0.28, facing, M.clock, { frame: M.woodDark, rim: 0.018 });

  return { bed, sideTable, chair, stool, deskChair, carton, cartonAt, bookRow, rack, bottle, jar, mug, tumbler, plate, plant, tableLamp, slippers, shoes, heap, draped, rug, clock };
}
