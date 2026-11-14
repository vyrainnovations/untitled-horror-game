// The flat: its walls, floors, doors, windows and lights. The furniture and
// clutter in each room live in src/rooms/. The floor plan is in src/plan.js.
import * as THREE from 'three';
import { createBuilder } from './build.js';
import { createMaterials } from './materials.js';
import { createFittings } from './fittings.js';
import { CEILING, DOOR_HEIGHT, STREET_LAMP } from './plan.js';
import { buildOutside } from './outside.js';
import { createFurniture } from './furniture.js';
import { dressStudy } from './rooms/study.js';
import { dressBedroom, dressSpareRoom } from './rooms/bedrooms.js';
import { dressKitchen } from './rooms/kitchen.js';
import { dressBathroom } from './rooms/bathroom.js';
import { dressStore } from './rooms/store.js';
import { dressCorridor } from './rooms/corridor.js';

export function buildApartment(scene) {
  const M = createMaterials();
  const b = createBuilder(scene);
  const f = createFittings(b, M);
  const F = createFurniture(b, M, f);
  const { wall, doorFrame, doorLeaf, windowAt } = f;
  const OUT = M.outside;

  // --- Floors and ceiling --------------------------------------------------
  const floor = (x0, x1, z0, z1, material) => b.box(x0, x1, -0.1, 0, z0, z1, material, { cast: false });
  floor(-0.06, 4.2, -0.06, 7.2, M.mosaic); // study and bedroom 1
  floor(-0.06, 4.2, 7.2, 12.06, M.kitchenFloor);
  floor(4.2, 5.7, -0.06, 12.06, M.mosaic); // corridor
  floor(5.7, 9.36, -0.06, 3.6, M.mosaic); // bedroom 2
  floor(5.7, 8.16, 3.6, 6.2, M.bathFloor);
  floor(5.7, 8.16, 6.2, 8.26, M.cement); // store room
  b.box(-0.2, 9.5, CEILING, CEILING + 0.1, -0.2, 12.2, M.ceiling, { cast: false });
  // Stone strips in the doorways where one floor meets another.
  b.box(4.14, 4.26, 0, 0.006, 8.8, 10.4, M.stone, { cast: false });
  b.box(5.64, 5.76, 0, 0.025, 4.5, 5.3, M.stone, { cast: false });
  b.box(5.64, 5.76, 0, 0.006, 6.8, 7.6, M.stone, { cast: false });
  // Two beams across the corridor.
  for (const z of [3.5, 7.2]) b.box(4.26, 5.64, 2.45, CEILING, z - 0.07, z + 0.07, M.plaster);

  // --- Walls ----------------------------------------------------------------
  const door = (from, to) => ({ from, to });
  const win = (from, to, bottom, top) => ({ from, to, bottom, top });

  // North outer wall.
  wall('x', 0, -0.06, 4.2, OUT, M.studyWall);
  wall('x', 0, 4.2, 5.7, OUT, M.hallWall);
  wall('x', 0, 5.7, 9.36, OUT, M.bed2Wall);
  // West outer wall, with the windows that look onto the lane.
  wall('z', 0, 0.06, 3.4, OUT, M.studyWall, [win(0.9, 2.5, 0.95, 2.15)]);
  wall('z', 0, 3.4, 7.2, OUT, M.bed1Wall, [win(4.4, 6.2, 0.95, 2.15)]);
  wall('z', 0, 7.2, 11.94, OUT, M.kitchenWall, [win(7.75, 9.55, 0.9, 2.2), win(10.4, 11.4, 1.15, 2.0)]);
  // South outer wall, with the front door.
  wall('x', 12, -0.06, 4.2, M.kitchenWall, OUT);
  wall('x', 12, 4.2, 5.76, M.hallWall, OUT, [door(4.5, 5.4)]);
  // Between the rooms on the west side.
  wall('x', 3.4, 0.06, 4.14, M.studyWall, M.bed1Wall);
  wall('x', 7.2, 0.06, 4.14, M.bed1Wall, M.kitchenWall);
  // West side of the corridor: study door, bedroom door, kitchen archway.
  wall('z', 4.2, 0.06, 3.4, M.studyWall, M.hallWall, [door(1.7, 2.6)]);
  wall('z', 4.2, 3.4, 7.2, M.bed1Wall, M.hallWall, [door(4.4, 5.3)]);
  wall('z', 4.2, 7.2, 11.94, M.kitchenWall, M.hallWall, [{ from: 8.8, to: 10.4, top: 2.25 }]);
  // East side of the corridor: spare room, bathroom, store room.
  wall('z', 5.7, 0.06, 3.6, M.hallWall, M.bed2Wall, [door(1.7, 2.6)]);
  wall('z', 5.7, 3.6, 6.2, M.hallWall, M.bathWall, [door(4.45, 5.35)]);
  wall('z', 5.7, 6.2, 8.2, M.hallWall, M.storeWall, [door(6.75, 7.65)]);
  wall('z', 5.7, 8.2, 11.94, M.hallWall, OUT);
  // The rooms on the east side.
  wall('x', 3.6, 5.76, 9.36, M.bed2Wall, M.bathWall);
  wall('x', 6.2, 5.76, 8.04, M.bathWall, M.storeWall);
  wall('x', 8.2, 5.76, 8.16, M.storeWall, OUT);
  wall('z', 8.1, 3.66, 6.2, M.bathWall, OUT, [win(4.6, 5.2, 2.1, 2.45)]);
  wall('z', 8.1, 6.2, 8.14, M.storeWall, OUT);
  wall('z', 9.3, 0.06, 3.54, M.bed2Wall, OUT, [win(1.0, 2.6, 0.95, 2.15)]);

  // --- Doors ----------------------------------------------------------------
  doorFrame('z', 4.2, 1.7, 2.6); // study
  doorFrame('z', 5.7, 1.7, 2.6); // spare room
  doorFrame('z', 4.2, 4.4, 5.3); // bedroom
  doorFrame('z', 5.7, 4.45, 5.35); // bathroom
  doorFrame('z', 5.7, 6.75, 7.65); // store room
  doorFrame('x', 12, 4.5, 5.4); // front door

  doorLeaf(4.12, 2.55, -0.407, 0.914, M.doorWood); // study: pushed back against the wall
  doorLeaf(4.12, 5.25, -0.407, 0.914, M.doorWood); // bedroom: the same
  doorLeaf(5.78, 1.75, 0.966, 0.259, M.doorWood); // spare room: standing half open
  doorLeaf(5.78, 4.5, 0.5, -0.866, M.doorBath, { edge: M.whitePlastic }); // bathroom
  doorLeaf(5.78, 7.6, 0.985, 0.174, M.doorWood); // store room

  // The front door is shut. Lock, bolt and handle are on the inside. The
  // whole door is one piece hung from its hinge, which is on the east side
  // at (5.35, 11.97), so that it can swing. Positions inside are measured
  // from the hinge. It opens outwards, onto the landing, so it never swings
  // into the player. The way through stays blocked: he cannot leave.
  // None of it casts a shadow, because it moves and shadows are drawn once.
  const moves = { cast: false };
  b.tag('frontDoor', b.group(5.35, 0, 11.97, 0, () => {
    b.box(-0.8, 0, 0.01, DOOR_HEIGHT - 0.06, -0.02, 0.02, b.sides(M.woodDark, { north: M.doorFront }), moves);
    b.box(-0.75, -0.63, 1.0, 1.14, -0.06, -0.02, M.darkMetal, moves); // lock
    b.rod([-0.69, 1.07, -0.06], [-0.69, 1.07, -0.09], 0.016, M.steel, moves);
    b.box(-0.75, -0.61, 0.92, 0.94, -0.07, -0.05, M.steel, moves); // handle
    // The bolt, near the top: a plate, two loops, and the bar that slides
    // through them. The bar starts drawn back (the door is not bolted yet).
    // Slid 8.5 cm to the west, its end goes into the door frame.
    b.box(-0.775, -0.49, 1.845, 1.9, -0.028, -0.02, M.darkMetal, moves);
    for (const x of [-0.7475, -0.5775]) b.box(x - 0.0075, x + 0.0075, 1.853, 1.892, -0.052, -0.028, M.steel, moves);
    b.tag('bolt', b.group(0, 0, 0, 0, () => {
      b.rod([-0.77, 1.8725, -0.039], [-0.5, 1.8725, -0.039], 0.011, M.steel, { cast: false, sides: 6 });
      b.rod([-0.615, 1.8725, -0.039], [-0.615, 1.8725, -0.09], 0.009, M.steel, moves); // the knob you push it by
    }));
    // The peephole, at eye height.
    b.rod([-0.4, 1.52, -0.02], [-0.4, 1.52, -0.034], 0.012, M.steel, { ...moves, sides: 8 });
    b.panel(-0.4, 1.52, -0.0345, 0.013, 0.013, '-z', M.void);
  }));
  b.block(4.5, 5.4, 11.94, 12.06);

  // The wood of the door frame split round the bolt and the lock: forced,
  // the night Saad died. It is never there in the flat the player walks
  // through, which is that night before 3:07. Only the tapes, filmed after
  // it, show it (src/clips.js, "shows").
  const split = b.group(0, 0, 0, 0, () => {
    const raw = { cast: false };
    for (const y of [1.87, 1.07]) {
      b.box(4.5, 4.552, y - 0.09, y + 0.1, 11.906, 11.921, M.woodLight, raw); // torn face, pale raw wood
      b.rod([4.53, y - 0.12, 11.912], [4.546, y + 0.07, 11.888], 0.005, M.woodLight, raw); // splinters standing out
      b.rod([4.515, y - 0.05, 11.912], [4.508, y + 0.13, 11.893], 0.004, M.woodLight, raw);
      b.box(4.546, 4.553, y - 0.14, y + 0.16, 11.9, 11.922, M.darkMetal, raw); // the crack along the edge
    }
  });
  split.visible = false;
  b.tag('splitWood', split);
  // The landing outside it. Its light is out: all that shows through the
  // open door is black, blacker than anything inside the flat.
  b.tag('landing', b.box(2.9, 7.0, -1, 4, 12.9, 13.0, M.void));

  // --- Windows ----------------------------------------------------------------
  windowAt(0, 0.9, 2.5, 0.95, 2.15, 1); // study
  windowAt(0, 4.4, 6.2, 0.95, 2.15, 1, { panes: 3 }); // bedroom
  windowAt(0, 7.75, 9.55, 0.9, 2.2, 1, { panes: 3 }); // dining: the big one to look out of
  windowAt(0, 10.4, 11.4, 1.15, 2.0, 1); // over the kitchen sink
  windowAt(9.3, 1.0, 2.6, 0.95, 2.15, -1); // spare room
  // Bathroom ventilator: frosted glass slats high in the wall.
  const slat = new THREE.MeshLambertMaterial({ color: 0x8fa0a8, emissive: 0x0e161c });
  for (let i = 0; i < 5; i++) b.box(8.06, 8.14, 2.11 + i * 0.068, 2.125 + i * 0.068, 4.6, 5.2, slat, { cast: false });

  buildOutside(b, M);

  // --- Lights -----------------------------------------------------------------
  // Everything in the flat stands still, so shadows are worked out once at the
  // start and never again. That makes seven shadow-casting lights cheap.
  const shadows = (light, size, near, far) => {
    light.castShadow = true;
    light.shadow.mapSize.set(size, size);
    light.shadow.camera.near = near;
    light.shadow.camera.far = far;
    light.shadow.bias = -0.0006;
    light.shadow.normalBias = 0.02;
    scene.add(light);
    if (light.target) scene.add(light.target);
    return light;
  };

  // A little light everywhere, so black is never completely black.
  const sky = new THREE.HemisphereLight(0x2b3347, 0x120f0c, 0.65);
  scene.add(sky);

  // The corridor bulb: the only warm light in the flat, and it is not well.
  const bulbMaterial = M.bulbOn.clone();
  f.hangingBulb(4.95, 8.4, 0.38, bulbMaterial);
  const bulb = shadows(new THREE.PointLight(0xffc98a, 2.6, 9, 1.6), 512, 0.06, 9);
  bulb.position.set(4.95, CEILING - 0.38, 8.4);
  const bulbHaze = b.glow(4.95, CEILING - 0.38, 8.4, 0.9, M.hazeWarm.clone());

  // A cold strip light under the kitchen wall cabinets.
  f.tube([0.55, 1.47, 11.57], [1.2, 1.47, 11.57], true);
  const strip = shadows(new THREE.PointLight(0xb4d6ae, 1.8, 7, 1.6), 512, 0.05, 7);
  strip.position.set(0.88, 1.42, 11.52);
  b.glow(0.88, 1.46, 11.55, 0.7, M.hazeCold);

  // The PC monitor in the study, shining into the room.
  const SCREEN = 3.4; // how bright it is
  const screen = shadows(new THREE.SpotLight(0x9db4e0, SCREEN, 9, 1.25, 0.7, 1.2), 512, 0.1, 9);
  screen.position.set(2.5, 1.05, 0.3);
  screen.target.position.set(2.5, 0.85, 3);
  const screenFill = new THREE.PointLight(0x9db4e0, 0.4, 1.6, 2);
  screenFill.position.set(2.5, 1.05, 0.55);
  scene.add(screenFill);

  // The street lamp outside. One lamp, three beams: one through each window.
  const street = (target, angle, size = 1024) => {
    const beam = shadows(new THREE.SpotLight(0xff9a3c, 5, 26, angle, 0.2, 1), size, 3, 26);
    beam.position.set(...STREET_LAMP);
    beam.target.position.set(...target);
    return beam;
  };
  const beams = [
    street([0, 1.55, 1.7], 0.15), // study
    street([0, 1.55, 5.3], 0.23), // bedroom
    street([0, 1.55, 9.35], 0.32, 2048), // both kitchen windows
  ];

  // Lamplight that lands on the bedroom wall bounces back into the room.
  // The engine does not do bounces, so a soft light stands in for it.
  const bounce = shadows(new THREE.PointLight(0xff9a3c, 0.55, 5.5, 1.4), 256, 0.1, 5.5);
  bounce.position.set(3.4, 1.7, 5.0);

  // Two faint glows with no shadows: a tube light beyond the bathroom
  // ventilator, and lamplight soaking through the spare room's shut curtains.
  const vent = new THREE.PointLight(0x8fb0c8, 0.5, 3.2, 1.5);
  vent.position.set(7.85, 2.25, 4.9);
  const drawn = new THREE.PointLight(0xd88a3c, 0.75, 4.2, 1.4);
  drawn.position.set(8.9, 1.5, 1.8);
  scene.add(vent, drawn);

  // The gas ring under the pan of chai. It gives no light until the player
  // lights it (src/chores.js). The light is in the flat from the start,
  // turned down to nothing, because adding a light later makes the game
  // stop for a moment while it works out how to draw everything again.
  const ring = new THREE.PointLight(0x7f9cff, 0, 2.2, 1.8);
  ring.position.set(1.466, 1.03, 11.56);
  scene.add(ring);

  // --- Furniture and clutter ----------------------------------------------------
  // Each room's things are one group, so that the tapes (src/footage.js) can
  // show the flat as it is a year later: cleared out.
  const rooms = {};
  const room = (name, dress) => { rooms[name] = b.group(0, 0, 0, 0, () => dress(b, M, f, F)); };
  room('study', dressStudy);
  room('bedroom', dressBedroom);
  room('spareRoom', dressSpareRoom);
  room('kitchen', dressKitchen);
  room('bathroom', dressBathroom);
  room('store', dressStore);
  room('corridor', dressCorridor);

  // --- Things that change over time ---------------------------------------------
  const bulbLit = new THREE.Color(0xffe2b0);
  const bulbDead = new THREE.Color(0x3a2c1c);
  let dropoutUntil = 0;
  let nextDropout = 8;
  let now = 0;
  b.updaters.push((t) => {
    now = t;
    // The corridor bulb flickers, and now and then cuts out for a moment.
    if (t > nextDropout) {
      dropoutUntil = t + 0.05 + Math.random() * 0.25;
      nextDropout = t + 5 + Math.random() * 16;
    }
    const out = t < dropoutUntil;
    const level = out ? 0.06 : 1 + Math.sin(t * 13) * 0.05 + Math.sin(t * 47) * 0.025;
    bulb.intensity = 2.6 * level;
    bulbMaterial.color.copy(out ? bulbDead : bulbLit);
    bulbHaze.material.opacity = 0.5 * level;
    screen.intensity = SCREEN * (1 + Math.sin(t * 2.1) * 0.03);
  });

  return {
    colliders: b.colliders,
    walls: f.walls, // every piece of wall, as a box: for telling what is behind a wall
    things: b.things, // the few objects the game moves or switches on, by name (see b.tag)
    rooms, // each room's furniture and clutter, as one group
    start: { x: 2.5, z: 2.2, yaw: 0, pitch: -0.1 }, // in the study, behind the chair, facing the desk
    lights: { bulb, strip, screen, screenFill, beams, bounce, vent, drawn, ring, sky },
    // The corridor bulb's own glow, so a tape can show it switched off.
    bulbLook: { material: bulbMaterial, haze: bulbHaze, dead: bulbDead },
    update(t, dt) {
      for (const tick of b.updaters) tick(t, dt);
    },
    // Make the corridor bulb cut out for a moment, as when the front door
    // is hammered on.
    cutBulb(seconds) {
      dropoutUntil = Math.max(dropoutUntil, now + seconds);
    },
  };
}
