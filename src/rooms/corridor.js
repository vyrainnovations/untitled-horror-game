// The corridor: 12 metres from the front door (south end) to a dead end
// (north end). Inside walls: x 4.26 to 5.64, z 0.06 to 11.94.
//
// The first tape (src/clips.js) shows this corridor emptied, and fills it in
// again each time the player scrubs back. So its things are in two sets that
// can be hidden: 'hallByDoor' (the doormat and the shoe rack, the first to
// come back) and 'hallWalls' (everything else he owned out here). The light
// switches and the fuse box belong to the flat, and are always there.
export function dressCorridor(b, M, f, F) {
  const sets = { byDoor: [], walls: [] };
  const part = (set, build) => sets[set].push(b.group(0, 0, 0, 0, build));

  // --- The dead end ------------------------------------------------------------
  // A narrow table with a landline nobody uses, and a big photograph over it.
  part('walls', () => {
    b.box(4.5, 5.4, 0.74, 0.78, 0.08, 0.38, M.woodDark);
    for (const x of [4.54, 5.36]) for (const z of [0.12, 0.34]) b.box(x - 0.02, x + 0.02, 0, 0.74, z - 0.02, z + 0.02, M.woodDark);
    b.box(4.62, 4.84, 0.78, 0.83, 0.14, 0.32, M.blackPlastic);
    b.box(4.6, 4.86, 0.83, 0.87, 0.16, 0.22, M.blackPlastic);
    b.cyl(5.2, 0.24, 0.78, 0.98, 0.05, M.terracotta, { sides: 8, top: 0.035 });
    for (const [dx, dz] of [[0.08, 0.02], [-0.06, 0.04], [0.02, -0.03], [-0.02, 0.05]]) b.rod([5.2, 0.98, 0.24], [5.2 + dx, 1.38, 0.24 + dz], 0.004, M.earth, { sides: 3 });
    f.hung(4.95, 1.58, 0.06, 0.5, 0.62, '+z', M.familyPhoto);
  });
  b.block(4.26, 5.64, 0.06, 0.42);

  // A raincoat on a hook, just past the study door.
  part('walls', () => {
    b.box(4.26, 4.285, 1.74, 1.78, 0.8, 1.2, M.woodDark);
    b.box(4.27, 4.36, 0.95, 1.72, 0.84, 1.16, M.clothOlive);
    b.box(4.27, 4.38, 1.6, 1.82, 0.92, 1.08, M.clothOlive);
    b.box(4.27, 4.34, 1.0, 1.64, 0.76, 0.84, M.clothOlive);
    b.box(4.27, 4.34, 1.0, 1.64, 1.16, 1.24, M.clothOlive);
  });
  f.switchboard(5.64, 1.3, 1.5, '-x');

  // --- The middle ----------------------------------------------------------------
  part('walls', () => {
    // Pictures on the east wall.
    f.hung(5.64, 1.55, 3.0, 0.5, 0.36, '-x', M.forest);
    f.hung(5.64, 1.5, 3.98, 0.3, 0.38, '-x', M.abstractArt, { spin: 0.03 });
    f.hung(5.64, 1.5, 6.05, 0.4, 0.3, '-x', M.certificate, { spin: -0.04 });

    // The router on its shelf, lights blinking.
    b.box(4.26, 4.42, 1.78, 1.8, 2.95, 3.3, M.woodLight);
    b.box(4.28, 4.4, 1.8, 1.835, 3.02, 3.24, M.whitePlastic);
    b.rod([4.3, 1.835, 3.04], [4.3, 1.96, 3.04], 0.005, M.blackPlastic, { cast: false });
    b.rod([4.3, 1.835, 3.22], [4.3, 1.96, 3.22], 0.005, M.blackPlastic, { cast: false });
    b.box(4.262, 4.27, 0.3, 1.78, 3.262, 3.27, M.blackPlastic, { cast: false });
    const lights = [3.08, 3.13, 3.18].map((z) => f.led(4.403, 1.817, z, M.ledGreen, 0.01));
    b.updaters.push((t) => {
      lights[1].visible = Math.sin(t * 9) > -0.3;
      lights[2].visible = (t * 3.1) % 1 > 0.4;
    });

    // A slim cabinet on the west wall, with the things that collect on one.
    b.box(4.26, 4.54, 0, 1.1, 6.0, 6.9, b.sides(M.woodMid, { east: M.sideboard }));
    b.box(4.3, 4.33, 1.1, 1.3, 6.1, 6.26, M.woodDark); // a photo frame standing up
    b.cyl(4.42, 6.5, 1.1, 1.13, 0.06, M.steel, { sides: 8, top: 0.08 }); // key dish
    b.box(4.32, 4.5, 1.1, 1.13, 6.64, 6.84, M.paper); // unopened post
    F.slippers(4.46, 4.75, 1.4);
  });
  b.block(4.26, 4.56, 6.0, 6.9);

  // --- By the front door ------------------------------------------------------------
  part('walls', () => {
    f.hung(5.64, 1.55, 8.75, 0.34, 0.42, '-x', M.abstractArt);
    f.hung(5.64, 1.5, 9.45, 0.5, 0.36, '-x', M.landscape, { spin: 0.025 });

    // Hooks with a jacket and a cloth bag.
    b.box(5.615, 5.64, 1.68, 1.72, 9.9, 10.66, M.woodDark);
    b.box(5.55, 5.63, 0.95, 1.66, 9.96, 10.26, M.clothDark);
    b.box(5.57, 5.63, 1.0, 1.6, 9.89, 9.96, M.clothDark);
    b.box(5.57, 5.63, 1.0, 1.6, 10.26, 10.33, M.clothDark);
    b.box(5.56, 5.63, 1.0, 1.35, 10.42, 10.62, M.sack);
    b.rod([5.6, 1.35, 10.46], [5.62, 1.68, 10.52], 0.006, M.sack, { cast: false });
    b.rod([5.6, 1.35, 10.58], [5.62, 1.68, 10.52], 0.006, M.sack, { cast: false });

    // A small mirror for the way out.
    f.hung(4.26, 1.52, 11.25, 0.35, 0.5, '+x', M.mirror, { frame: M.woodDark });
  });

  // Shoe rack, with a helmet on top and the keys above it.
  part('byDoor', () => {
    b.box(5.36, 5.64, 0, 0.6, 10.7, 10.72, M.woodMid);
    b.box(5.36, 5.64, 0, 0.6, 11.38, 11.4, M.woodMid);
    for (const y of [0.04, 0.3, 0.58]) b.box(5.36, 5.64, y, y + 0.02, 10.7, 11.4, M.woodMid);
    F.shoes(5.5, 0.06, 10.86, Math.PI / 2, M.blackPlastic);
    F.shoes(5.5, 0.06, 11.2, Math.PI / 2, M.whitePlastic);
    F.shoes(5.5, 0.32, 10.9, Math.PI / 2, M.woodDark);
    F.shoes(5.5, 0.32, 11.22, Math.PI / 2, M.clothBlue);
    b.ball(5.5, 0.73, 11.05, 0.14, M.blackPlastic, { squash: [1, 0.95, 1.1] });
    b.box(5.62, 5.64, 1.42, 1.48, 10.85, 11.15, M.woodDark);
    for (const z of [10.92, 11.0, 11.08]) b.box(5.6, 5.615, 1.3, 1.42, z - 0.008, z + 0.008, M.steel, { cast: false });
  });
  b.block(5.36, 5.64, 10.7, 11.4);

  // Fuse box and light switches: part of the flat.
  f.hung(5.64, 1.9, 11.64, 0.32, 0.24, '-x', M.fuseBox, { frame: M.darkMetal, depth: 0.07, rim: 0.01 });
  f.led(5.565, 1.99, 11.5, M.ledGreen, 0.01);
  f.switchboard(4.26, 1.3, 10.62, '+x');

  // Doormat, slippers, an umbrella in the corner.
  part('byDoor', () => {
    b.panel(4.95, 0.004, 11.55, 0.7, 0.45, '+y', M.doormat);
    F.slippers(4.55, 11.35, 0.3);
    b.rod([5.56, 0, 11.86], [5.6, 0.82, 11.9], 0.022, M.clothDark, { sides: 6 });
    b.rod([5.6, 0.82, 11.9], [5.6, 0.92, 11.9], 0.008, M.woodDark, { cast: false });
  });

  b.tag('hallByDoor', sets.byDoor);
  b.tag('hallWalls', sets.walls);
}
