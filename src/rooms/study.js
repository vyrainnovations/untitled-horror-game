// The study: the room with the PC. The player starts here, and the editing
// happens here later. Inside walls: x 0.06 to 4.14, z 0.06 to 3.34.
export function dressStudy(b, M, f, F) {
  // --- North wall, left to right -------------------------------------------

  // A camera on a tripod in the corner, pointed into the room.
  const head = [0.48, 1.22, 0.48];
  for (const foot of [[0.48, 0, 0.82], [0.19, 0, 0.31], [0.77, 0, 0.31]]) b.rod(head, foot, 0.014, M.darkMetal);
  b.rod([0.48, 1.1, 0.48], [0.48, 1.44, 0.48], 0.016, M.darkMetal);
  b.box(0.43, 0.53, 1.42, 1.47, 0.43, 0.53, M.blackPlastic);
  b.group(0.48, 1.47, 0.48, -0.39, () => {
    b.box(-0.07, 0.07, 0, 0.1, -0.045, 0.045, M.blackPlastic);
    b.rod([0.07, 0.05, 0], [0.16, 0.05, 0], 0.036, M.darkMetal, { sides: 8 });
    b.box(-0.05, 0, 0.1, 0.13, -0.02, 0.02, M.blackPlastic);
  });
  b.block(0.06, 0.9, 0.06, 0.85);

  // A low bookshelf with a plant on top.
  b.box(0.94, 0.96, 0, 0.9, 0.06, 0.4, M.woodLight);
  b.box(1.64, 1.66, 0, 0.9, 0.06, 0.4, M.woodLight);
  b.box(0.94, 1.66, 0.88, 0.9, 0.06, 0.4, M.woodLight);
  b.box(0.96, 1.64, 0, 0.9, 0.06, 0.075, M.woodLight);
  [0.02, 0.31, 0.6].forEach((y, i) => {
    b.box(0.96, 1.64, y - 0.02, y, 0.075, 0.4, M.woodLight);
    F.bookRow(0.975, i === 2 ? 1.42 : 1.625, y, y + 0.23, 0.12, 0.36, 'south', i);
  });
  F.plant(1.1, 0.24, 0.9);
  b.box(1.32, 1.52, 0.9, 0.93, 0.12, 0.3, M.clothRed);
  b.box(1.34, 1.5, 0.93, 0.955, 0.13, 0.28, M.clothBlue);
  b.block(0.9, 1.7, 0.06, 0.42);

  // The desk.
  b.box(1.7, 3.3, 0.72, 0.75, 0.06, 0.8, M.woodLight);
  b.box(1.7, 1.73, 0, 0.72, 0.1, 0.76, M.woodLight);
  b.box(3.27, 3.3, 0, 0.72, 0.1, 0.76, M.woodLight);
  b.box(1.73, 3.27, 0.25, 0.72, 0.09, 0.11, M.woodLight);
  b.box(2.85, 3.27, 0.12, 0.72, 0.14, 0.76, b.sides(M.woodLight, { south: M.drawers }));
  b.block(1.7, 3.3, 0.06, 0.8);
  // The PC tower under it, with its power light, and a power strip.
  b.box(1.8, 2.0, 0.02, 0.47, 0.2, 0.66, M.blackPlastic);
  f.led(1.9, 0.4, 0.662, M.ledBlue, 0.012);
  b.box(2.1, 2.36, 0, 0.03, 0.14, 0.2, M.whitePlastic, { cast: false });
  f.led(2.12, 0.032, 0.17, M.ledRed, 0.012);
  // The monitor. The picture on it is painted in textures.js.
  b.box(2.4, 2.6, 0.75, 0.765, 0.2, 0.36, M.blackPlastic);
  b.box(2.48, 2.52, 0.765, 0.95, 0.19, 0.22, M.blackPlastic); // the neck, behind the screen
  b.box(2.18, 2.82, 0.86, 1.24, 0.225, 0.255, M.blackPlastic);
  b.panel(2.5, 1.05, 0.257, 0.6, 0.34, '+z', M.screen);
  f.led(2.79, 0.873, 0.257, M.ledBlue, 0.01);
  b.panel(2.26, 0.88, 0.2575, 0.04, 0.035, '+z', M.yellowPlastic); // a sticky note on the bezel
  // Keyboard, mouse, speakers.
  b.box(2.28, 2.72, 0.75, 0.768, 0.46, 0.6, b.sides(M.blackPlastic, { top: M.keyboard }));
  b.box(2.76, 3.0, 0.75, 0.753, 0.44, 0.64, M.clothDark, { cast: false });
  b.box(2.85, 2.91, 0.753, 0.78, 0.5, 0.6, M.blackPlastic);
  b.box(2.02, 2.12, 0.75, 0.95, 0.16, 0.27, M.blackPlastic);
  b.box(2.88, 2.98, 0.75, 0.95, 0.16, 0.27, M.blackPlastic);
  // Headphones, a notebook and pen.
  b.cyl(2.0, 0.62, 0.75, 0.785, 0.04, M.blackPlastic, { sides: 8 });
  b.cyl(2.1, 0.62, 0.75, 0.785, 0.04, M.blackPlastic, { sides: 8 });
  b.box(1.98, 2.12, 0.785, 0.8, 0.605, 0.635, M.blackPlastic);
  b.box(1.82, 1.96, 0.75, 0.762, 0.46, 0.66, M.clothRed, { cast: false });
  b.rod([1.84, 0.767, 0.5], [1.94, 0.767, 0.62], 0.004, M.bluePlastic, { cast: false });
  // A desk lamp, off.
  b.cyl(1.82, 0.22, 0.75, 0.77, 0.07, M.darkMetal, { sides: 8 });
  b.rod([1.82, 0.77, 0.22], [1.9, 1.15, 0.3], 0.008, M.darkMetal);
  b.rod([1.9, 1.15, 0.3], [2.04, 1.1, 0.4], 0.008, M.darkMetal);
  b.cyl(2.06, 0.42, 1.0, 1.1, 0.07, M.darkMetal, { sides: 8, top: 0.03 });
  // Backup drives, his phone, a steel tumbler of chai gone cold, and a mug.
  b.box(3.06, 3.2, 0.75, 0.78, 0.18, 0.36, M.blackPlastic);
  b.box(3.07, 3.19, 0.78, 0.81, 0.19, 0.35, M.steel);
  f.led(3.1, 0.795, 0.352, M.ledBlue, 0.008);
  // His phone. Its screen is dark until it buzzes (src/chores.js).
  b.tag('phone', b.group(3.095, 0.75, 0.57, 0, () => {
    b.box(-0.035, 0.035, 0, 0.008, -0.07, 0.07, M.blackPlastic, { cast: false });
    const lit = b.group(0, 0, 0, 0, () => {
      b.panel(0, 0.0086, 0, 0.058, 0.126, '+y', M.phoneScreen);
      b.glow(0, 0.03, 0, 0.3, M.hazeBlue.clone());
    });
    lit.visible = false;
    b.tag('phoneScreen', lit);
  }));
  F.tumbler(3.21, 0.44, 0.75, M.chai);
  F.mug(3.19, 0.68, 0.75, M.ceramic, M.liquid);

  // Waste bin, with paper in it.
  b.cyl(3.45, 0.45, 0, 0.3, 0.1, M.darkMetal, { sides: 8, top: 0.12 });
  b.ball(3.43, 0.3, 0.44, 0.045, M.paper, { sides: 5 });
  b.ball(3.49, 0.31, 0.48, 0.04, M.paper, { sides: 5 });
  b.ball(3.58, 0.04, 0.62, 0.04, M.paper, { sides: 5 });
  b.block(3.3, 3.6, 0.06, 0.8);

  // A steel rack of gear in the corner: camera bags, lenses, a printer.
  const shelves = F.rack(3.62, 4.12, 0.1, 0.5, 1.9, 4);
  b.box(3.66, 4.08, shelves[0], shelves[0] + 0.3, 0.14, 0.46, M.clothDark); // camera bag
  b.box(3.64, 4.1, shelves[1], shelves[1] + 0.2, 0.12, 0.48, M.whitePlastic); // printer
  b.box(3.7, 4.04, shelves[1] + 0.2, shelves[1] + 0.21, 0.2, 0.44, M.paper, { cast: false });
  b.rod([3.74, shelves[2] + 0.045, 0.2], [3.74, shelves[2] + 0.045, 0.34], 0.045, M.darkMetal, { sides: 8 }); // lenses
  b.cyl(3.9, 0.3, shelves[2], shelves[2] + 0.12, 0.04, M.darkMetal, { sides: 8 });
  b.cyl(4.02, 0.26, shelves[2], shelves[2] + 0.09, 0.035, M.darkMetal, { sides: 8 });
  F.carton(3.66, 4.06, shelves[3], shelves[3] + 0.22, 0.14, 0.46);
  b.block(3.6, 4.14, 0.06, 0.8);

  // On the wall over the desk: a poster, the pinboard, and a tube light (off).
  f.hung(1.3, 1.62, 0.06, 0.42, 0.6, '+z', M.posterMoon, { frame: null });
  f.hung(2.0, 1.78, 0.06, 0.42, 0.6, '+z', M.posterFest, { frame: null, spin: -0.02 });
  f.hung(2.92, 1.72, 0.06, 0.9, 0.6, '+z', M.pinboard, { frame: M.woodLight });
  f.tube([1.7, 2.38, 0.1], [2.9, 2.38, 0.1], false);

  // --- The chair, the rug, the fan ---------------------------------------------
  F.deskChair(2.5, 1.2, 0.28);
  b.block(2.24, 2.76, 0.8, 1.5);
  F.rug(2.3, 1.95, 1.9, 1.25, 0.04);
  f.ceilingFan(2.1, 1.75, 1.1);

  // --- West wall: the window ----------------------------------------------------
  b.rod([0.15, 2.25, 0.7], [0.15, 2.25, 2.72], 0.012, M.darkMetal);
  f.curtain(0.15, 0.72, 0.98, 0.85, 2.25, 4);
  f.curtain(0.15, 1.8, 2.7, 0.85, 2.25, 6); // half drawn across
  b.box(0.06, 0.28, 2.36, 2.64, 1.25, 2.15, b.sides(M.whitePlastic, { east: M.airCon }));
  f.led(0.283, 2.4, 2.08, M.ledGreen, 0.012);

  // --- South wall ------------------------------------------------------------
  // A floor lamp and a side table in the corner.
  F.sideTable(0.1, 0.5, 2.9, 3.3, 0.5);
  b.cyl(0.3, 2.72, 0, 0.03, 0.12, M.darkMetal, { sides: 8 });
  b.rod([0.3, 0, 2.72], [0.3, 1.45, 2.72], 0.012, M.darkMetal);
  b.cyl(0.3, 2.72, 1.4, 1.66, 0.2, M.paper, { sides: 10, top: 0.15 });
  F.bottle(0.24, 3.05, 0.5, 0.22, 0.035, M.bluePlastic);
  b.box(0.3, 0.44, 0.5, 0.53, 2.98, 3.18, M.clothBlue); // a book
  b.block(0.06, 0.8, 2.58, 3.34);

  // A sofa, where he naps between renders.
  b.box(0.8, 2.4, 0.1, 0.4, 2.6, 3.3, M.clothOlive);
  b.box(0.8, 2.4, 0.4, 0.82, 3.12, 3.3, M.clothOlive);
  b.box(0.8, 0.96, 0.4, 0.6, 2.6, 3.12, M.clothOlive);
  b.box(2.24, 2.4, 0.4, 0.6, 2.6, 3.12, M.clothOlive);
  b.box(0.97, 1.59, 0.4, 0.47, 2.62, 3.12, M.clothOlive);
  b.box(1.61, 2.23, 0.4, 0.47, 2.62, 3.12, M.clothOlive);
  b.group(1.2, 0.47, 2.92, 0.35, () => b.box(-0.2, 0.2, 0, 0.12, -0.15, 0.15, M.pillow));
  b.box(1.78, 2.22, 0.47, 0.55, 2.66, 3.06, M.blanket); // a folded blanket
  b.block(0.8, 2.4, 2.58, 3.34);

  // Boxes of kit beside it.
  F.carton(2.42, 2.98, 0, 0.38, 2.76, 3.3);
  F.cartonAt(2.7, 0.38, 3.03, 0.42, 0.28, 0.4, 0.2);
  b.block(2.4, 3.0, 2.72, 3.34);

  // Over the sofa: a poster and a framed certificate.
  f.hung(1.25, 1.68, 3.34, 0.42, 0.6, '-z', M.posterDoor, { frame: null, spin: 0.015 });
  f.hung(2.0, 1.6, 3.34, 0.4, 0.3, '-z', M.certificate);

  // --- East wall ---------------------------------------------------------------
  f.switchboard(4.14, 1.3, 1.5, '-x');
  F.clock(4.14, 1.95, 1.1, '-x');
}
