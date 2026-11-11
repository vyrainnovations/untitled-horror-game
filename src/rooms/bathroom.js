// The bathroom. No light is on in here. Inside walls: x 5.76 to 8.04,
// z 3.66 to 6.14. The mirror hangs straight across from the door.
export function dressBathroom(b, M, f, F) {
  // --- Toilet, against the north wall ------------------------------------------
  b.box(7.22, 7.7, 0.42, 0.8, 3.66, 3.86, M.ceramic); // cistern
  b.box(7.2, 7.72, 0.8, 0.83, 3.66, 3.88, M.ceramic);
  b.box(7.44, 7.48, 0.83, 0.845, 3.75, 3.79, M.steel, { cast: false });
  b.box(7.36, 7.56, 0.2, 0.42, 3.86, 3.96, M.ceramic);
  b.cyl(7.46, 4.12, 0, 0.38, 0.14, M.ceramic, { sides: 10, top: 0.19, squash: [1, 1.3] });
  b.cyl(7.46, 4.12, 0.38, 0.41, 0.2, M.ceramic, { sides: 10, squash: [1, 1.3] }); // lid down
  // The spray hose on the wall beside it, and a brush.
  b.box(7.98, 8.04, 0.52, 0.6, 3.97, 4.03, M.steel);
  b.rod([8.01, 0.55, 4.0], [7.98, 0.22, 4.12], 0.008, M.steel, { cast: false });
  b.cyl(7.9, 4.3, 0, 0.12, 0.05, M.whitePlastic, { sides: 8 });
  b.rod([7.9, 0.1, 4.3], [7.9, 0.45, 4.3], 0.008, M.whitePlastic, { cast: false });
  b.block(7.18, 8.04, 3.66, 4.42);

  // --- Basin and mirror, opposite the door --------------------------------------
  b.box(7.6, 8.04, 0.7, 0.84, 4.66, 5.14, M.ceramic);
  b.panel(7.82, 0.842, 4.9, 0.36, 0.4, '+y', M.sinkCeramic);
  b.rod([7.9, 0.3, 4.9], [7.9, 0.7, 4.9], 0.025, M.steel);
  b.rod([8.0, 0.84, 4.9], [8.0, 0.98, 4.9], 0.012, M.steel, { cast: false });
  b.rod([8.0, 0.97, 4.9], [7.88, 0.95, 4.9], 0.01, M.steel, { cast: false });
  f.hung(8.04, 1.5, 4.9, 0.5, 0.62, '-x', M.mirror, { frame: M.whitePlastic, rim: 0.02 });
  // A shelf under the mirror: toothbrushes in a cup, toothpaste, soap.
  b.box(7.93, 8.04, 1.08, 1.09, 4.66, 5.14, M.whitePlastic, { cast: false });
  b.cyl(7.98, 4.74, 1.09, 1.18, 0.03, M.bluePlastic, { sides: 8 });
  b.rod([7.98, 1.15, 4.74], [7.96, 1.27, 4.72], 0.004, M.redPlastic, { cast: false });
  b.rod([7.98, 1.15, 4.74], [7.99, 1.27, 4.77], 0.004, M.greenPlastic, { cast: false });
  b.box(7.95, 8.0, 1.09, 1.12, 4.86, 5.0, M.whitePlastic, { cast: false });
  b.box(7.66, 7.74, 0.84, 0.865, 4.7, 4.75, M.redPlastic, { cast: false });
  b.block(7.58, 8.04, 4.42, 5.55);

  // --- Washing machine in the corner, a towel on a rail above it ------------------
  b.box(5.78, 6.38, 0, 0.85, 5.5, 6.12, b.sides(M.whitePlastic, { east: M.washer }));
  b.box(5.86, 6.2, 0.85, 1.0, 5.6, 5.9, M.bluePlastic); // detergent
  F.heap(6.1, 0.85, 5.98, 0.36, 0.12, 0.24, M.clothGrey);
  b.rod([5.82, 1.5, 6.1], [6.36, 1.5, 6.1], 0.01, M.steel, { cast: false });
  b.box(5.86, 6.32, 1.0, 1.5, 6.07, 6.09, M.towel);
  b.box(5.86, 6.32, 1.14, 1.5, 6.11, 6.125, M.towel);
  b.block(5.76, 6.4, 5.48, 6.14);

  // --- The washing corner: shower, taps, bucket and mug, a stool --------------------
  b.rod([7.3, 1.05, 6.12], [7.3, 2.05, 6.12], 0.01, M.steel, { cast: false });
  b.rod([7.3, 2.05, 6.12], [7.3, 2.08, 5.92], 0.012, M.steel);
  b.cyl(7.3, 5.9, 2.03, 2.06, 0.06, M.steel, { sides: 10 });
  b.box(7.2, 7.4, 1.0, 1.1, 6.08, 6.14, M.steel);
  b.rod([7.75, 0.6, 6.14], [7.75, 0.6, 5.98], 0.012, M.steel);
  b.cyl(7.72, 5.85, 0, 0.3, 0.13, M.bluePlastic, { sides: 12, top: 0.17, open: true });
  b.cyl(7.72, 5.85, 0.265, 0.275, 0.166, M.liquid, { sides: 12, cast: false });
  b.cyl(7.9, 5.85, 0.2, 0.32, 0.05, M.redPlastic, { sides: 8 });
  b.box(7.94, 7.97, 0.24, 0.3, 5.84, 5.86, M.redPlastic, { cast: false });
  F.stool(7.25, 5.88, 0.24, M.greenPlastic, 0.3);
  b.panel(6.7, 0.004, 5.85, 0.14, 0.14, '+y', M.drain);
  b.block(7.0, 8.04, 5.55, 6.14);
  // Water heater high on the wall, with its red light on.
  b.cyl(7.72, 5.96, 2.0, 2.45, 0.17, M.whitePlastic, { sides: 12 });
  f.led(7.72, 2.1, 5.787, M.ledRed, 0.014);
  b.rod([7.64, 2.0, 6.04], [7.42, 1.1, 6.1], 0.008, M.steel, { cast: false });
  // A corner shelf of shampoo.
  b.box(7.86, 8.04, 1.3, 1.31, 5.96, 6.14, M.whitePlastic, { cast: false });
  F.bottle(7.96, 6.06, 1.31, 0.18, 0.03, M.greenPlastic);
  F.bottle(7.9, 6.1, 1.31, 0.14, 0.026, M.whitePlastic, M.bluePlastic);

  // --- Slippers by the door, and a bulb nobody has switched on ----------------------
  F.slippers(6.05, 4.85, 1.5);
  f.hangingBulb(6.9, 4.9, 0.25, M.bulbOff);
}
