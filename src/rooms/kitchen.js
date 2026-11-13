// The kitchen, with the dining table in it. Inside walls: x 0.06 to 4.14,
// z 7.26 to 11.94. The cooking end is along the south and west walls; the
// table stands by the big window at the north end.
export function dressKitchen(b, M, f, F) {
  const TOP = 0.91; // height of the worktop

  // --- Cabinets and worktop: an L along the south and west walls ---------------
  b.box(0.66, 3.3, 0.1, 0.87, 11.36, 11.94, b.sides(M.laminate, { north: M.cabinetsLow }));
  b.box(0.06, 0.64, 0.1, 0.87, 10.1, 11.36, b.sides(M.laminate, { east: M.cabinetsWest }));
  b.box(0.06, 3.3, 0, 0.1, 11.42, 11.94, M.blackPlastic); // the recessed plinth
  b.box(0.06, 0.58, 0, 0.1, 10.1, 11.42, M.blackPlastic);
  b.box(0.06, 3.33, 0.87, TOP, 11.32, 11.94, M.granite);
  b.box(0.06, 0.68, 0.87, TOP, 10.08, 11.32, M.granite);
  b.box(0.66, 3.3, TOP, 1.5, 11.925, 11.94, M.backsplash, { cast: false });
  b.box(0.06, 0.075, TOP, 1.15, 10.1, 11.34, M.backsplash, { cast: false });
  b.block(0.06, 3.3, 11.34, 11.94);

  // Wall cabinets, with the cooker hood between them.
  b.box(0.5, 1.25, 1.5, 2.2, 11.59, 11.94, b.sides(M.laminate, { north: M.cabinetsHigh2 }));
  b.box(2.15, 3.3, 1.5, 2.2, 11.59, 11.94, b.sides(M.laminate, { north: M.cabinetsHigh3 }));
  b.box(1.27, 2.13, 1.72, 1.9, 11.5, 11.94, M.steel);
  b.box(1.6, 1.8, 1.9, 2.8, 11.76, 11.94, M.steel);

  // A tall unit at the end of the west run, with the microwave built in.
  b.box(0.06, 0.66, 0, 0.96, 9.62, 10.1, b.sides(M.laminate, { east: M.tallUnit }));
  b.box(0.06, 0.66, 0.96, 1.3, 9.62, 10.1, M.laminate);
  b.box(0.2, 0.672, 0.99, 1.27, 9.66, 10.06, b.sides(M.blackPlastic, { east: M.microwave }));
  b.panel(0.6735, 1.235, 9.715, 0.07, 0.028, '+x', M.digitsGreen); // its clock
  b.box(0.06, 0.66, 1.3, 2.15, 9.62, 10.1, b.sides(M.laminate, { east: M.tallUnit }));
  b.block(0.06, 0.66, 9.62, 11.34);

  // The fridge, with things kept on top of it.
  b.box(3.38, 4.1, 0, 1.8, 11.22, 11.92, b.sides(M.whitePlastic, { north: M.fridge }));
  F.carton(3.46, 3.9, 1.8, 2.02, 11.36, 11.8);
  b.cyl(4.0, 11.5, 1.8, 1.96, 0.07, M.steel, { sides: 8 });
  b.block(3.3, 4.14, 11.2, 11.94);

  // --- The hob and what is on it ---------------------------------------------------
  b.box(1.33, 2.08, TOP, 0.94, 11.45, 11.85, b.sides(M.steel, { top: M.stoveTop }));
  for (const x of [1.47, 1.705, 1.94]) b.rod([x, 0.925, 11.45], [x, 0.925, 11.43], 0.014, M.blackPlastic, { cast: false });
  // A pan of chai on the left ring.
  b.cyl(1.466, 11.65, 0.94, 1.015, 0.085, M.steel, { sides: 10 });
  b.cyl(1.466, 11.65, 1.005, 1.018, 0.078, M.chai, { sides: 10, cast: false });
  b.box(1.36, 1.4, 0.99, 1.005, 11.48, 11.6, M.blackPlastic);
  // The flame under it: a ring of blue round the bottom of the pan, with a
  // soft glow. It is out until the player lights the ring (src/chores.js).
  const flame = b.group(1.466, 0.94, 11.65, 0, () => {
    b.cyl(0, 0, 0, 0.024, 0.1, M.flame, { sides: 12, open: true, top: 0.089, cast: false, receive: false });
    b.glow(0, 0.03, 0, 0.42, M.hazeBlue.clone());
  });
  flame.visible = false;
  b.tag('ringFlame', flame);
  // A kadhai in the middle.
  b.cyl(1.705, 11.65, 0.94, 1.0, 0.06, M.darkMetal, { sides: 10, top: 0.13 });
  // The pressure cooker on the right.
  b.cyl(1.944, 11.65, 0.94, 1.08, 0.105, M.steel, { sides: 10 });
  b.cyl(1.944, 11.65, 1.08, 1.1, 0.11, M.steel, { sides: 10 });
  b.cyl(1.944, 11.65, 1.1, 1.13, 0.015, M.blackPlastic, { sides: 6 });
  b.box(2.03, 2.17, 1.06, 1.085, 11.63, 11.67, M.blackPlastic);

  // --- Along the worktop, left to right ----------------------------------------------
  // Steel tins in the corner, and the water purifier on the wall above them.
  F.jar(0.2, 11.78, TOP, 0.16, 0.065, M.steel, M.steel);
  F.jar(0.34, 11.82, TOP, 0.13, 0.055, M.steel, M.steel);
  F.jar(0.46, 11.8, TOP, 0.1, 0.045, M.steel, M.steel);
  b.box(0.1, 0.42, 1.25, 1.75, 11.78, 11.94, b.sides(M.whitePlastic, { north: M.purifier }));
  f.led(0.38, 1.7, 11.777, M.ledBlue, 0.012);
  // Kettle, cutlery stand, oil.
  b.cyl(0.82, 11.7, TOP, 1.09, 0.075, M.steel, { sides: 10, top: 0.06 });
  b.box(0.9, 0.95, 0.96, 1.07, 11.69, 11.71, M.blackPlastic);
  b.cyl(1.08, 11.8, TOP, 1.03, 0.045, M.steel, { sides: 8 });
  for (const [dx, dz, up] of [[0.02, 0, 0.12], [-0.02, 0.015, 0.1], [0, -0.02, 0.13], [0.015, 0.02, 0.09], [-0.012, -0.012, 0.11]]) {
    b.rod([1.08 + dx * 0.5, 1.02, 11.8 + dz * 0.5], [1.08 + dx, 1.03 + up, 11.8 + dz], 0.005, M.steel, { cast: false });
  }
  F.bottle(1.2, 11.84, TOP, 0.24, 0.035, M.yellowPlastic);
  // Chopping board, knife, a tomato and an onion.
  b.box(2.25, 2.6, TOP, 0.925, 11.45, 11.7, M.woodLight);
  b.box(2.3, 2.46, 0.925, 0.93, 11.5, 11.53, M.steel, { cast: false });
  b.box(2.46, 2.56, 0.925, 0.94, 11.5, 11.53, M.blackPlastic, { cast: false });
  b.ball(2.36, 0.955, 11.62, 0.032, M.redPlastic);
  b.ball(2.48, 0.955, 11.63, 0.03, M.sack);
  // Knife block and toaster.
  b.group(2.78, TOP, 11.78, 0.3, () => {
    b.box(-0.05, 0.05, 0, 0.2, -0.06, 0.06, M.woodDark);
    for (const x of [-0.03, -0.01, 0.01, 0.03]) b.box(x - 0.006, x + 0.006, 0.2, 0.27, -0.01, 0.01, M.blackPlastic, { cast: false });
  });
  b.box(2.95, 3.2, TOP, 1.08, 11.62, 11.8, M.steel);
  b.box(2.98, 3.17, 1.08, 1.085, 11.66, 11.76, M.blackPlastic, { cast: false });
  // A spice shelf on the wall, and ladles hanging from a rail.
  b.box(2.2, 2.9, 1.2, 1.215, 11.86, 11.94, M.woodDark);
  for (let i = 0; i < 7; i++) F.jar(2.26 + i * 0.095, 11.9, 1.215, 0.08, 0.028, i % 2 ? M.yellowPlastic : M.sack, M.redPlastic);
  b.rod([2.25, 1.44, 11.9], [3.2, 1.44, 11.9], 0.006, M.steel, { cast: false });
  for (const [x, len] of [[3.0, 0.2], [3.07, 0.24], [3.14, 0.18]]) {
    b.rod([x, 1.44, 11.9], [x, 1.44 - len, 11.9], 0.005, M.steel, { cast: false });
    b.ball(x, 1.43 - len, 11.9, 0.03, M.steel, { squash: [1, 0.5, 0.4], cast: false });
  }
  // A cloth hung over a cabinet handle.
  b.box(2.3, 2.46, 0.45, 0.8, 11.345, 11.358, M.napkin, { cast: false });

  // --- The sink, under its window on the west wall ------------------------------------
  b.box(0.12, 0.6, TOP, 0.918, 10.55, 11.2, M.steel, { cast: false });
  b.panel(0.36, 0.9185, 10.875, 0.4, 0.57, '+y', M.sinkSteel);
  b.rod([0.11, TOP, 10.87], [0.11, 1.12, 10.87], 0.012, M.steel);
  b.rod([0.11, 1.11, 10.87], [0.27, 1.09, 10.87], 0.01, M.steel);
  F.bottle(0.14, 11.26, TOP, 0.18, 0.03, M.greenPlastic);
  b.box(0.2, 0.28, TOP, 0.94, 11.23, 11.29, M.yellowPlastic, { cast: false });
  // Plates drying in a rack.
  b.box(0.2, 0.52, TOP, 0.925, 10.14, 10.44, M.steel, { cast: false });
  for (const z of [10.2, 10.26, 10.32, 10.38]) b.rod([0.36, 1.03, z], [0.36, 1.03, z + 0.012], 0.11, M.steel, { sides: 12 });
  F.plant(0.1, 10.62, 1.155, 0.38); // a herb on the window sill
  b.panel(0.95, 0.004, 10.8, 0.45, 0.7, '+y', M.clothRed); // a mat to stand on

  // --- Bin, rubbish bag and broom, by the fridge ---------------------------------------
  b.cyl(3.9, 10.98, 0, 0.4, 0.13, M.greenPlastic, { sides: 10, top: 0.15 });
  b.cyl(3.9, 10.98, 0.4, 0.42, 0.155, M.blackPlastic, { sides: 10 });
  // A full bag, waiting to go out. It is the first thing the player picks
  // up (src/chores.js), so it is built as one piece that can be carried: the
  // bag, its tied neck, and the yellow tie that makes it easy to spot.
  b.tag('rubbishBag', b.group(3.84, 0, 10.7, 0.5, () => {
    F.heap(0, 0, 0, 0.36, 0.38, 0.34, M.blackPlastic);
    b.cyl(0, 0, 0.35, 0.45, 0.028, M.blackPlastic, { sides: 6, top: 0.055 });
    b.cyl(0, 0, 0.345, 0.37, 0.036, M.yellowPlastic, { sides: 6 });
  }));
  b.rod([4.08, 0.05, 11.12], [4.1, 1.25, 11.16], 0.012, M.woodLight);
  b.box(4.02, 4.12, 0, 0.12, 11.06, 11.18, M.sack);
  // One barrier for the bin, the bag and the broom. When the bag is taken
  // away, the game pulls this barrier back to the bin (src/chores.js).
  b.tag('binBarrier', b.block(3.6, 4.14, 10.55, 11.2));

  // --- The dining table ------------------------------------------------------------------
  b.box(1.4, 2.7, 0.72, 0.76, 8.15, 8.95, M.woodMid);
  for (const x of [1.46, 2.64]) for (const z of [8.21, 8.89]) b.box(x - 0.03, x + 0.03, 0, 0.72, z - 0.03, z + 0.03, M.woodMid);
  F.chair(1.75, 7.93, 0);
  F.chair(2.35, 7.93, 0);
  F.chair(1.75, 9.17, Math.PI);
  F.chair(2.42, 9.2, Math.PI + 0.35); // pushed back, as if someone just got up
  b.block(1.4, 2.7, 7.26, 9.42);
  // On it: a plate and spoon, tumblers, a jug, fruit, the paper, pickle.
  F.plate(1.75, 8.72, 0.76);
  b.box(1.9, 1.92, 0.76, 0.765, 8.64, 8.8, M.steel, { cast: false });
  F.tumbler(1.96, 8.56, 0.76);
  F.tumbler(2.5, 8.3, 0.76);
  b.cyl(2.06, 8.42, 0.76, 0.96, 0.06, M.steel, { sides: 10, top: 0.05 });
  b.box(2.11, 2.15, 0.82, 0.93, 8.41, 8.43, M.steel);
  b.cyl(2.42, 8.6, 0.76, 0.82, 0.08, M.ceramic, { sides: 10, top: 0.14 });
  b.ball(2.38, 0.84, 8.6, 0.04, M.yellowPlastic);
  b.ball(2.45, 0.84, 8.57, 0.04, M.redPlastic);
  b.ball(2.44, 0.845, 8.65, 0.038, M.yellowPlastic);
  b.panel(1.9, 0.763, 8.33, 0.3, 0.4, '+y', M.newspaper, { spin: 0.25 });
  F.jar(2.2, 8.78, 0.76, 0.1, 0.04, M.redPlastic, M.steel);
  // A lamp over the table, off.
  b.rod([2.05, 2.8, 8.55], [2.05, 1.76, 8.55], 0.006, M.blackPlastic, { cast: false });
  b.cyl(2.05, 8.55, 1.6, 1.76, 0.2, M.darkMetal, { sides: 10, top: 0.05 });
  b.ball(2.05, 1.62, 8.55, 0.04, M.bulbOff, { cast: false });

  // --- North wall: a sideboard, with a radio, a flask and glasses on a tray ----------
  b.box(2.9, 4.1, 0, 0.9, 7.26, 7.7, b.sides(M.woodMid, { south: M.sideboard }));
  b.box(3.0, 3.3, 0.9, 1.08, 7.34, 7.5, M.woodDark);
  for (const x of [3.06, 3.24]) b.rod([x, 0.95, 7.5], [x, 0.95, 7.515], 0.015, M.steel, { cast: false });
  b.cyl(3.5, 7.45, 0.9, 1.16, 0.045, M.redPlastic, { sides: 8 });
  b.cyl(3.5, 7.45, 1.16, 1.2, 0.03, M.steel, { sides: 8 });
  b.box(3.7, 4.02, 0.9, 0.91, 7.34, 7.6, M.steel, { cast: false });
  for (const [x, z] of [[3.78, 7.42], [3.88, 7.5], [3.95, 7.4]]) b.cyl(x, z, 0.91, 0.99, 0.03, M.steel, { sides: 8, top: 0.025 });
  b.block(2.7, 4.14, 7.26, 7.72);
  f.hung(3.2, 1.62, 7.26, 0.3, 0.45, '+z', M.calendar, { frame: null });
  F.clock(3.82, 1.95, 7.26, '+z');

  // --- The corner by the big window: a tall plant ---------------------------------------
  F.plant(0.36, 7.52, 0, 2.2);
  b.block(0.06, 0.66, 7.26, 7.76);
  // Curtains pulled right back, so the window is clear to look out of.
  b.rod([0.15, 2.32, 7.5], [0.15, 2.32, 9.8], 0.012, M.darkMetal);
  f.curtain(0.15, 7.52, 7.8, 0.8, 2.32, 4);
  f.curtain(0.15, 9.5, 9.78, 0.8, 2.32, 4);
  f.switchboard(4.14, 1.3, 8.62, '-x');
}
