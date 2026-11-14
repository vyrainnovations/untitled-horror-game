// The two bedrooms.
//
// Bedroom 1 is his: lived in, unmade. Inside walls: x 0.06 to 4.14, z 3.46 to 7.14.
// The spare room was a flatmate's, who moved out. Almost everything is gone.
// Inside walls: x 5.76 to 9.24, z 0.06 to 3.54.

export function dressBedroom(b, M, f, F) {
  // The bed, unmade, with its head to the south wall.
  F.bed(1.95, 5.1, 0, 1.5, 2.0, { pillows: 2 });
  F.heap(1.6, 0.46, 6.52, 0.42, 0.07, 0.3, M.clothGrey); // yesterday's t-shirt
  b.block(1.2, 2.7, 5.1, 7.14);

  // Bedside tables. Lamp and alarm clock on one, books and water on the other.
  F.sideTable(0.72, 1.18, 6.66, 7.12, 0.5);
  F.tableLamp(0.84, 6.98, 0.5);
  b.box(1.0, 1.12, 0.5, 0.56, 6.86, 6.92, M.blackPlastic);
  b.panel(1.06, 0.53, 6.858, 0.1, 0.04, '-z', M.digits);
  b.block(0.72, 1.2, 6.64, 7.14);
  F.sideTable(2.72, 3.18, 6.66, 7.12, 0.5);
  b.box(2.79, 2.95, 0.5, 0.54, 6.8, 7.02, M.clothRed);
  b.box(2.8, 2.94, 0.54, 0.57, 6.82, 7.0, M.clothBlue);
  F.bottle(3.09, 6.8, 0.5, 0.24, 0.036, M.bluePlastic);
  F.tumbler(3.07, 6.98, 0.5);
  b.block(2.7, 3.2, 6.64, 7.14);

  // Along the north wall: a laundry basket, a steel cupboard, a wooden wardrobe.
  b.cyl(0.38, 3.78, 0, 0.55, 0.2, M.sack, { sides: 10, top: 0.24 });
  F.heap(0.38, 0.5, 3.78, 0.4, 0.16, 0.4, M.clothBlue);
  b.box(0.74, 1.64, 0, 1.95, 3.46, 3.98, b.sides(M.enamel, { south: M.cupboard }));
  b.block(0.06, 1.65, 3.46, 4.0);
  b.box(1.7, 3.5, 0, 2.1, 3.46, 4.06, b.sides(M.woodMid, { south: M.wardrobe }));
  b.box(1.85, 2.6, 2.1, 2.32, 3.52, 4.0, M.clothBlue); // a suitcase on top
  b.box(2.15, 2.3, 2.32, 2.35, 3.74, 3.78, M.blackPlastic);
  F.carton(2.8, 3.3, 2.1, 2.4, 3.55, 3.98);
  b.block(1.65, 3.5, 3.46, 4.08);

  // The chair that clothes live on.
  F.chair(3.82, 3.8, 0);
  b.box(3.62, 4.02, 0.47, 0.53, 3.62, 3.98, M.clothBlue);
  b.box(3.62, 4.02, 0.6, 0.96, 3.56, 3.62, M.clothGrey);
  b.block(3.5, 4.14, 3.46, 4.1);

  // The window: curtains pulled mostly open, air conditioner above.
  b.rod([0.15, 2.25, 4.2], [0.15, 2.25, 6.4], 0.012, M.darkMetal);
  f.curtain(0.15, 4.22, 4.5, 0.85, 2.25, 4);
  f.curtain(0.15, 5.72, 6.38, 0.85, 2.25, 6);
  b.box(0.06, 0.28, 2.36, 2.64, 4.85, 5.75, b.sides(M.whitePlastic, { east: M.airCon }));
  f.led(0.283, 2.4, 5.68, M.ledGreen, 0.012);

  // On the walls.
  f.hung(1.95, 1.65, 7.14, 0.6, 0.42, '-z', M.landscape);
  f.switchboard(4.14, 1.3, 4.25, '-x');
  b.box(3.94, 4.14, 1.5, 1.52, 6.2, 6.95, M.woodDark); // a shelf
  F.bookRow(3.98, 4.12, 1.52, 1.74, 6.25, 6.62, 'west', 1);
  F.plant(4.04, 6.82, 1.52, 0.6);

  // On the floor and the ceiling.
  F.rug(3.45, 6.35, 0.8, 1.3, 0.03);
  F.slippers(2.92, 5.55, 0.2);
  f.ceilingFan(2.0, 5.2, 0.7);
}

export function dressSpareRoom(b, M, f, F) {
  // A stripped bed along the north wall, one folded blanket left on it.
  F.bed(7.25, 0.56, Math.PI / 2, 0.95, 1.95, { bare: true });
  b.block(7.2, 9.24, 0.06, 1.08);

  // The curtains are shut. Lamplight soaks through them.
  b.rod([9.15, 2.25, 0.8], [9.15, 2.25, 2.8], 0.012, M.darkMetal);
  f.curtain(9.15, 0.82, 2.78, 0.85, 2.25, 12, M.curtainShut);

  // An empty wardrobe, and a tall mirror nobody took.
  b.box(6.0, 7.2, 0, 2.0, 2.94, 3.54, b.sides(M.woodMid, { north: M.wardrobe }));
  b.block(5.76, 7.2, 2.9, 3.54);
  f.hung(7.72, 0.92, 3.54, 0.48, 1.6, '-z', M.mirror, { frame: M.woodDark });

  // Taped boxes that were never collected.
  F.carton(8.35, 9.2, 0, 0.45, 2.62, 3.5);
  F.cartonAt(8.8, 0.45, 3.08, 0.6, 0.4, 0.55, 0.15);
  F.cartonAt(8.72, 0.85, 3.1, 0.4, 0.3, 0.4, -0.2);
  b.block(8.3, 9.24, 2.55, 3.54);
  b.panel(8.0, 0.005, 2.3, 0.3, 0.4, '+y', M.newspaper, { spin: 0.5 });
  b.panel(8.25, 0.006, 2.48, 0.3, 0.4, '+y', M.newspaper, { spin: -0.3 });

  // Something under a dust sheet in the corner.
  F.draped(5.82, 6.62, 0.1, 0.9, 1.05);
  b.block(5.76, 6.65, 0.06, 0.92);

  // One chair, left facing the door, under the bare bulb. It is where Hamza
  // sits tonight, watching the study, so a tape can show it on its own
  // (src/apartment.js lifts it out of the room's things).
  b.tag('spareChair', b.group(0, 0, 0, 0, () => F.chair(7.6, 2.05, -Math.PI / 2)));
  b.block(7.35, 7.85, 1.8, 2.3);
  f.hangingBulb(7.5, 1.8, 0.5, M.bulbOff);

  // Pale patches where pictures used to hang, and last year's calendar.
  f.hung(6.9, 1.6, 0.06, 0.45, 0.6, '+z', M.ghost, { frame: null });
  f.hung(8.4, 1.55, 0.06, 0.34, 0.45, '+z', M.ghost, { frame: null });
  f.hung(5.76, 1.65, 1.1, 0.4, 0.5, '+x', M.ghost, { frame: null });
  f.hung(8.75, 1.65, 3.54, 0.3, 0.45, '-z', M.calendar, { frame: null, spin: -0.07 });
  f.switchboard(5.76, 1.3, 2.78, '+x');
}
