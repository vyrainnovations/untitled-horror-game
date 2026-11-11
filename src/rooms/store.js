// The store room: no window, no light on, full of things nobody uses. Inside
// walls: x 5.76 to 8.04, z 6.26 to 8.14. There is just room to step in.
export function dressStore(b, M, f, F) {
  // --- A steel rack along the north wall -----------------------------------------
  const shelf = F.rack(5.82, 7.5, 6.3, 6.64, 2.0, 4);
  // Bottom shelf: paint tins, a toolbox, a sack of rice.
  b.cyl(5.95, 6.47, shelf[0], shelf[0] + 0.18, 0.08, M.whitePlastic, { sides: 8 });
  b.cyl(6.14, 6.45, shelf[0], shelf[0] + 0.18, 0.08, M.steel, { sides: 8 });
  b.cyl(6.05, 6.47, shelf[0] + 0.18, shelf[0] + 0.33, 0.07, M.redPlastic, { sides: 8 });
  b.box(6.4, 6.86, shelf[0], shelf[0] + 0.2, 6.34, 6.6, M.redPlastic);
  b.box(6.55, 6.71, shelf[0] + 0.2, shelf[0] + 0.24, 6.45, 6.49, M.blackPlastic, { cast: false });
  F.heap(7.2, shelf[0], 6.47, 0.46, 0.3, 0.3, M.sack);
  // Second shelf: an old television, a video recorder, and a stack of tapes.
  b.box(5.92, 6.52, shelf[1], shelf[1] + 0.47, 6.3, 6.62, b.sides(M.blackPlastic, { south: M.tube }));
  b.box(6.64, 7.1, shelf[1], shelf[1] + 0.09, 6.32, 6.6, M.blackPlastic);
  b.box(6.72, 6.98, shelf[1] + 0.035, shelf[1] + 0.055, 6.6, 6.602, M.darkMetal, { cast: false });
  b.box(6.7, 6.9, shelf[1] + 0.09, shelf[1] + 0.24, 6.36, 6.56, b.sides(M.blackPlastic, { south: M.tapes }));
  b.box(7.16, 7.35, shelf[1], shelf[1] + 0.025, 6.42, 6.53, M.blackPlastic);
  b.box(7.2, 7.31, shelf[1] + 0.025, shelf[1] + 0.027, 6.45, 6.5, M.paper, { cast: false });
  // Third shelf: boxes and old newspapers.
  F.carton(5.9, 6.4, shelf[2], shelf[2] + 0.34, 6.32, 6.62);
  F.carton(6.5, 6.86, shelf[2], shelf[2] + 0.26, 6.34, 6.6);
  b.box(7.0, 7.3, shelf[2], shelf[2] + 0.16, 6.36, 6.6, M.paper);
  // Top shelf: a suitcase and a folded blanket.
  b.box(5.9, 6.6, shelf[3], shelf[3] + 0.22, 6.32, 6.62, M.clothBlue);
  b.box(6.8, 7.3, shelf[3], shelf[3] + 0.14, 6.34, 6.6, M.blanket);
  b.block(5.76, 8.04, 6.26, 6.68);

  // --- Against the east wall ------------------------------------------------------
  // A rolled carpet stood in the corner and a ladder leaning on the wall.
  b.cyl(7.8, 6.47, 0, 1.5, 0.12, M.clothRed, { sides: 10 });
  for (const z of [6.78, 7.0]) b.rod([7.9, 0, z], [8.01, 1.95, z], 0.014, M.woodLight);
  for (let i = 1; i < 6; i++) b.rod([7.9 + i * 0.018, i * 0.32, 6.78], [7.9 + i * 0.018, i * 0.32, 7.0], 0.01, M.woodLight, { cast: false });
  // Big boxes, and the spare gas cylinder.
  F.carton(7.58, 8.02, 0, 0.5, 7.08, 7.58);
  F.cartonAt(7.8, 0.5, 7.32, 0.4, 0.34, 0.42, 0.15);
  b.cyl(7.8, 7.86, 0, 0.05, 0.13, M.redPlastic, { sides: 12, open: true });
  b.cyl(7.8, 7.86, 0.05, 0.5, 0.15, M.redPlastic, { sides: 12 });
  b.cyl(7.8, 7.86, 0.5, 0.6, 0.15, M.redPlastic, { sides: 12, top: 0.07 });
  b.cyl(7.8, 7.86, 0.6, 0.7, 0.09, M.redPlastic, { sides: 10, open: true });
  b.cyl(7.8, 7.86, 0.6, 0.66, 0.03, M.steel, { sides: 6 });
  b.block(7.55, 8.04, 6.68, 8.14);

  // --- Along the south wall, behind the door --------------------------------------------
  b.box(5.85, 6.6, 0, 0.25, 7.82, 8.1, M.clothDark); // suitcases
  b.box(5.9, 6.5, 0.25, 0.45, 7.84, 8.08, M.clothRed);
  b.cyl(6.95, 7.96, 0, 0.26, 0.11, M.redPlastic, { sides: 10, top: 0.13 }); // mop and bucket
  b.rod([6.97, 0.05, 7.98], [7.05, 1.3, 8.1], 0.012, M.woodLight);
  F.heap(6.97, 0.2, 7.98, 0.2, 0.12, 0.2, M.clothGrey);
  b.rod([7.3, 0, 8.02], [7.34, 1.2, 8.1], 0.012, M.woodLight); // broom
  b.box(7.22, 7.4, 0, 0.14, 7.96, 8.08, M.sack);
  b.block(5.76, 7.55, 7.78, 8.14);

  // A bulb on a cord. It is off.
  f.hangingBulb(6.7, 7.2, 0.3, M.bulbOff);
}
