// The landing outside the front door: the top of a stairwell, shared with
// the flat opposite. The player never walks on it (STORY.md: he cannot
// leave). It is seen three times: as a dark crack when the rubbish goes
// out, through the peephole, and lit, at the very end, when the door opens.
//
// It runs south from the front door (z = 12) to the neighbours' door
// (z = 14.9), and from x = 3.3 to the top of the stairs at x = 6.7. East of
// that the stairs go down (the north half) and up (the south half).
//
// Nothing here casts a shadow: shadows are drawn once, for the flat.
export function dressLanding(b, M, f, F) {
  const still = { cast: false };
  const W = 3.3; // the west wall
  const E = 6.7; // the top of the stairs
  const FAR = 9.5; // the far wall of the stairwell
  const N = 12.06; // the outside of the flat's own wall
  const S = 14.9; // the neighbours' wall
  const SPLIT = 13.5; // between the two flights of stairs
  const DADO = 1.25; // walls are painted dark up to here, as stairwells are

  // --- Floor and ceiling ------------------------------------------------------
  b.box(W, E, -0.1, 0, N, S, M.landingFloor, still);
  b.box(W - 0.12, E, 2.8, 2.9, 11.94, S + 0.12, M.ceiling, still);

  // --- Walls --------------------------------------------------------------------
  // The flat's own south wall is the north wall here (src/apartment.js gives
  // it this paint). East of the flat it has to be built.
  b.box(5.76, FAR + 0.12, -3.2, 5.6, 11.94, N, M.landingWall, still);
  b.box(W - 0.12, W, 0, 2.8, 11.94, S + 0.12, M.landingWall, still); // west
  b.box(FAR, FAR + 0.12, -3.2, 5.6, N, S, M.landingWall, still); // the far end of the stairwell
  // South, with the neighbours' doorway in it (x 4.5 to 5.4).
  b.box(W, 4.5, 0, 2.8, S, S + 0.12, M.landingWall, still);
  b.box(5.4, FAR + 0.12, -3.2, 5.6, S, S + 0.12, M.landingWall, still);
  b.box(4.5, 5.4, 2.1, 2.8, S, S + 0.12, M.landingWall, still);
  // The dark paint low on every wall, a centimetre proud of it.
  b.box(W, W + 0.01, 0, DADO, N, S, M.landingDado, still);
  b.box(W, 4.44, 0, DADO, N, N + 0.01, M.landingDado, still);
  b.box(5.46, E, 0, DADO, N, N + 0.01, M.landingDado, still);
  b.box(W, 4.44, 0, DADO, S - 0.01, S, M.landingDado, still);
  b.box(5.46, E, 0, DADO, S - 0.01, S, M.landingDado, still);

  // --- The neighbours' front door, and the steel gate in front of it ----------------
  b.box(4.5, 5.4, 0.01, 2.08, S + 0.03, S + 0.07, b.sides(M.woodDark, { north: M.doorWood }), still);
  for (const x of [4.47, 5.43]) b.box(x - 0.035, x + 0.035, 0, 2.14, S - 0.03, S + 0.05, M.woodDark, still);
  b.box(4.44, 5.46, 2.1, 2.17, S - 0.03, S + 0.05, M.woodDark, still);
  const gate = S - 0.07;
  for (const x of [4.5, 5.4]) b.box(x - 0.02, x + 0.02, 0.02, 2.06, gate - 0.02, gate + 0.02, M.darkMetal, still);
  for (const y of [0.04, 1.02, 2.04]) b.box(4.5, 5.4, y - 0.02, y + 0.02, gate - 0.02, gate + 0.02, M.darkMetal, still);
  for (let x = 4.6; x < 5.36; x += 0.1) b.rod([x, 0.04, gate], [x, 2.04, gate], 0.008, M.darkMetal, { ...still, sides: 4 });
  b.box(5.3, 5.38, 0.98, 1.12, gate - 0.04, gate - 0.02, M.steel, still); // its padlock plate
  // A doorbell with a little red light, a nameplate, a mat, two pairs of shoes.
  b.box(5.56, 5.64, 1.34, 1.46, S - 0.025, S, M.whitePlastic, still);
  f.led(5.6, 1.43, S - 0.03, M.ledRed, 0.012);
  b.box(5.56, 5.82, 1.6, 1.68, S - 0.012, S, M.steel, still);
  b.panel(4.95, 0.004, S - 0.42, 0.7, 0.42, '+y', M.doormat);
  F.shoes(4.3, 0, S - 0.2, 0.2, M.woodDark);
  F.slippers(4.02, S - 0.22, -0.3);
  F.plant(3.52, S - 0.25, 0, 1.5);

  // --- On the west wall: the electricity meters, and a vent with the street behind it ---
  b.box(W + 0.01, W + 0.1, 1.2, 1.9, 13.25, 14.15, M.darkMetal, still);
  for (const z of [13.42, 13.7, 13.98]) {
    b.box(W + 0.1, W + 0.14, 1.52, 1.78, z - 0.1, z + 0.1, M.whitePlastic, still);
    b.box(W + 0.14, W + 0.145, 1.62, 1.7, z - 0.06, z + 0.06, M.blackPlastic, still);
    b.rod([W + 0.06, 1.2, z], [W + 0.06, 0.3, z], 0.012, M.whitePlastic, still);
  }
  b.rod([W + 0.06, 1.9, 13.7], [W + 0.06, 2.8, 13.7], 0.016, M.whitePlastic, still);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
    b.panel(W + 0.012, 2.22 + row * 0.11, 12.52 + col * 0.11, 0.07, 0.07, '+x', M.ventGlow);
  }

  // --- The stairs -------------------------------------------------------------------
  const RUN = 0.27;
  const RISE = 0.17;
  for (let i = 0; i < 10; i++) {
    // Up: the south half. Each step is a block as deep as the rest of the flight.
    b.box(E + i * RUN, FAR, i * RISE, (i + 1) * RISE, SPLIT + 0.05, S, M.landingFloor, still);
    // Down: the north half.
    b.box(E + i * RUN, E + (i + 1) * RUN, -(i + 1) * RISE - 0.1, -(i + 1) * RISE, N, SPLIT - 0.05, M.landingFloor, still);
  }
  b.box(E + 10 * RUN, FAR, -1.9, -1.8, N, SPLIT - 0.05, M.landingFloor, still); // the half landing below
  // The rail between the two flights, and the post at the top.
  b.box(E - 0.04, E + 0.04, 0, 1.0, SPLIT - 0.04, SPLIT + 0.04, M.darkMetal, still);
  b.rod([E, 0.95, SPLIT], [E + 10 * RUN, 0.95 + 10 * RISE, SPLIT], 0.02, M.woodDark, still);
  b.rod([E, 0.95, SPLIT], [E + 10 * RUN, 0.95 - 10 * RISE, SPLIT], 0.02, M.woodDark, still);
  for (let i = 1; i < 10; i += 2) {
    b.rod([E + i * RUN, i * RISE, SPLIT], [E + i * RUN, 0.95 + i * RISE, SPLIT], 0.008, M.darkMetal, { ...still, sides: 4 });
    b.rod([E + i * RUN, -i * RISE, SPLIT - 0.02], [E + i * RUN, 0.95 - i * RISE, SPLIT - 0.02], 0.008, M.darkMetal, { ...still, sides: 4 });
  }
  // A light is on somewhere below: it shows on the wall at the bottom of the stairs.
  b.panel(FAR - 0.005, -1.0, 12.75, 1.3, 1.5, '-x', M.stairGlow);

  // --- The landing's own bulb. It is out all night (src/apartment.js lights it at the end) ---
  const bulb = M.bulbOn.clone();
  f.hangingBulb(4.95, 13.45, 0.34, bulb);
  const haze = b.glow(4.95, 2.8 - 0.34, 13.45, 0.9, M.hazeWarm.clone());
  b.tag('landingBulb', { material: bulb, haze, at: [4.95, 2.8 - 0.34, 13.45] });
}
