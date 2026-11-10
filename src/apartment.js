// The apartment, blocked out in plain boxes ("grey-box"). No textures, no
// real models yet: this is only here to judge the layout and the mood.
//
// Top-down plan, in metres. X runs left to right, Z runs top to bottom.
//
//        x=0               x=4    x=5.4    x=7
//   z=0   +-----------------+------+-------+
//         |                 |      | bath  |
//         |    bedroom      = hall =       |
//         |                 |      +-------+ z=2.6
//   z=3.4 +-----------------+      |
//         |                        |
//         |    kitchen        hall |
//         |                 |      |
//   z=6   +-----------------+-door-+
//
// "=" is a doorway. The kitchen has a wide open archway onto the hall.
import * as THREE from 'three';

const CEILING = 2.5;
const DOOR_HEIGHT = 2.05;
const WALL = 0.12; // wall thickness
const HALF = WALL / 2;

export function buildApartment(scene) {
  // Everything the player cannot walk through, as flat rectangles on the floor.
  const colliders = [];
  // An invisible barrier. Used to close gaps that are too narrow to walk
  // through, so the player cannot wedge into them.
  const block = (minX, maxX, minZ, maxZ) => colliders.push({ minX, maxX, minZ, maxZ });

  const mat = (color) => new THREE.MeshLambertMaterial({ color });
  const M = {
    wall: mat(0x8a8578),
    ceiling: mat(0x6f6b62),
    floorBedroom: mat(0x5a5348),
    floorKitchen: mat(0x55584f),
    floorHall: mat(0x4d4a45),
    floorBath: mat(0x596062),
    furniture: mat(0x6e6a66),
    dark: mat(0x3a3836),
    pale: mat(0x9a9a94),
    door: mat(0x4a4038),
  };

  // Add a box from its two corners. solid = the player collides with it.
  function box(x0, x1, y0, y1, z0, z1, material, solid = false) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0),
      material
    );
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    scene.add(mesh);
    if (solid) colliders.push({ minX: x0, maxX: x1, minZ: z0, maxZ: z1 });
    return mesh;
  }

  // A wall along a line, with optional doorways cut into it. Each doorway is
  // [from, to] along the wall. Above each doorway sits a lintel you walk under.
  function wall(axis, at, from, to, doorways = []) {
    const piece = (a, b, y0, y1, solid) => {
      if (b - a < 0.001) return;
      if (axis === 'x') box(a, b, y0, y1, at - HALF, at + HALF, M.wall, solid);
      else box(at - HALF, at + HALF, y0, y1, a, b, M.wall, solid);
    };
    let cursor = from - HALF;
    for (const [a, b] of doorways) {
      piece(cursor, a, 0, CEILING, true);
      piece(a, b, DOOR_HEIGHT, CEILING, false);
      cursor = b;
    }
    piece(cursor, to + HALF, 0, CEILING, true);
  }

  // --- Shell: floors, ceiling, walls -------------------------------------
  box(0, 4, -0.1, 0, 0, 3.4, M.floorBedroom);
  box(0, 4, -0.1, 0, 3.4, 6, M.floorKitchen);
  box(4, 5.4, -0.1, 0, 0, 6, M.floorHall);
  box(5.4, 7, -0.1, 0, 0, 2.6, M.floorBath);
  box(-0.2, 7.2, CEILING, CEILING + 0.1, -0.2, 6.2, M.ceiling);

  wall('x', 0, 0, 7); // north
  wall('z', 0, 0, 6); // west
  wall('x', 6, 0, 5.4, [[4.25, 5.15]]); // south, with the front door
  wall('x', 3.4, 0, 4); // between bedroom and kitchen
  wall('z', 4, 0, 6, [[1.6, 2.5], [4.0, 5.4]]); // hall west: bedroom door, kitchen arch
  wall('z', 5.4, 0, 6, [[0.9, 1.8]]); // hall east: bathroom door
  wall('z', 7, 0, 2.6); // bathroom east
  wall('x', 2.6, 5.4, 7); // bathroom south

  // Front door: shut. A slab filling the doorway, plus a handle and a mat.
  box(4.25, 5.15, 0, DOOR_HEIGHT, 5.97, 6.03, M.door, true);
  box(4.33, 4.37, 0.98, 1.04, 5.9, 5.97, M.pale);
  box(4.35, 5.05, 0, 0.015, 5.35, 5.85, M.dark);

  // --- Bedroom -----------------------------------------------------------
  // Bed in the south-west corner.
  box(0.06, 1.06, 0, 0.3, 1.3, 3.3, M.dark, true); // frame
  box(0.08, 1.04, 0.3, 0.45, 1.32, 3.28, M.pale); // mattress
  box(0.2, 0.9, 0.45, 0.55, 2.8, 3.2, M.furniture); // pillow

  // Desk against the north wall, with the PC on it.
  box(1.6, 3.0, 0.7, 0.75, 0.06, 0.76, M.furniture); // top
  box(1.6, 1.66, 0, 0.7, 0.06, 0.76, M.furniture); // left side
  box(2.94, 3.0, 0, 0.7, 0.06, 0.76, M.furniture); // right side
  block(1.6, 3.0, 0.06, 0.76);
  box(2.6, 2.85, 0.05, 0.6, 0.15, 0.65, M.dark); // PC tower under the desk
  box(2.25, 2.35, 0.75, 0.85, 0.22, 0.32, M.dark); // monitor stand
  box(1.98, 2.62, 0.83, 1.22, 0.2, 0.24, M.dark); // monitor body
  box(2.05, 2.55, 0.75, 0.77, 0.45, 0.62, M.dark); // keyboard

  // The monitor is on. Its screen is the brightest thing in the bedroom.
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.33),
    new THREE.MeshBasicMaterial({ color: 0x7f97b8, fog: false })
  );
  screen.position.set(2.3, 1.025, 0.245);
  scene.add(screen);
  const screenLight = new THREE.PointLight(0x8fa8d8, 1.1, 5, 1.6);
  screenLight.position.set(2.3, 1.05, 0.6);
  scene.add(screenLight);

  // Chair, pushed back a little from the desk.
  box(2.08, 2.52, 0.4, 0.46, 0.95, 1.39, M.dark, true); // seat
  block(2.08, 2.52, 0.76, 0.95); // gap between chair and desk
  box(2.08, 2.52, 0.46, 0.95, 1.34, 1.39, M.dark); // back
  box(2.27, 2.33, 0, 0.4, 1.14, 1.2, M.dark); // post

  // Wardrobe in the north-east corner.
  box(3.3, 3.94, 0, 2.0, 0.06, 1.1, M.furniture, true);
  box(3.04, 3.26, 0, 0.32, 0.3, 0.52, M.dark); // waste bin between desk and wardrobe
  block(3.0, 3.3, 0.06, 0.76);

  // Window on the west wall above the bed. Night outside.
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.0),
    new THREE.MeshBasicMaterial({ color: 0x18233c, fog: false })
  );
  windowGlow.rotation.y = Math.PI / 2;
  windowGlow.position.set(0.065, 1.55, 2.2);
  scene.add(windowGlow);
  box(0.06, 0.09, 1.03, 2.07, 2.18, 2.22, M.dark); // frame, upright bar
  box(0.06, 0.09, 1.53, 1.57, 1.6, 2.8, M.dark); // frame, cross bar
  const windowLight = new THREE.PointLight(0x33466e, 0.7, 4.5, 1.6);
  windowLight.position.set(0.5, 1.6, 2.2);
  scene.add(windowLight);

  // --- Kitchen -----------------------------------------------------------
  box(0.06, 2.6, 0, 0.9, 5.34, 5.94, M.furniture, true); // counter
  box(0.06, 2.6, 0.9, 0.93, 5.3, 5.94, M.pale); // worktop
  box(0.06, 2.6, 1.5, 2.15, 5.59, 5.94, M.furniture); // wall cabinets
  box(1.1, 1.7, 0.93, 0.96, 5.45, 5.85, M.dark); // hob
  box(0.06, 0.76, 0, 1.8, 3.5, 4.2, M.pale, true); // fridge
  box(1.7, 2.5, 0.68, 0.72, 4.05, 4.65, M.furniture); // table top
  box(2.07, 2.13, 0, 0.68, 4.32, 4.38, M.furniture); // table leg
  block(1.7, 2.5, 4.05, 4.65);
  box(1.4, 1.7, 0, 0.45, 4.2, 4.5, M.dark, true); // stool, tucked against the table

  // A cold strip light under the wall cabinets.
  box(0.5, 2.2, 1.47, 1.5, 5.62, 5.68,
    new THREE.MeshBasicMaterial({ color: 0xb9d4b4, fog: false }));
  const kitchenLight = new THREE.PointLight(0xa8c8a0, 1.6, 5, 1.6);
  kitchenLight.position.set(1.35, 1.35, 5.3);
  scene.add(kitchenLight);

  // --- Bathroom (no light on in here) -------------------------------------
  box(6.4, 6.9, 0, 0.4, 0.3, 0.8, M.pale, true); // toilet bowl
  box(6.4, 6.9, 0.4, 0.8, 0.06, 0.3, M.pale, true); // toilet tank
  box(6.56, 6.94, 0.65, 0.85, 1.1, 1.6, M.pale, true); // sink
  box(6.7, 6.8, 0, 0.65, 1.3, 1.4, M.pale); // sink pedestal
  box(6.92, 6.94, 1.15, 1.85, 1.05, 1.65, M.dark); // mirror (just a dark slab for now)
  box(5.52, 6.94, 0, 0.5, 1.95, 2.54, M.pale, true); // bathtub
  block(6.56, 6.94, 0.8, 1.1); // gap between toilet and sink
  block(6.56, 6.94, 1.6, 1.95); // gap between sink and bathtub

  // --- Hallway -----------------------------------------------------------
  box(5.06, 5.34, 0, 0.4, 4.5, 5.3, M.furniture, true); // shoe rack

  // One bare bulb. It is the only warm light in the flat, and it is not well.
  const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false });
  box(4.66, 4.74, 2.3, 2.4, 3.86, 3.94, bulbMaterial);
  box(4.69, 4.71, 2.4, 2.5, 3.89, 3.91, M.dark); // cord
  const bulb = new THREE.PointLight(0xffc98a, 2.2, 7, 1.6);
  bulb.position.set(4.7, 2.2, 3.9);
  scene.add(bulb);

  scene.add(new THREE.AmbientLight(0x1c2030, 0.55));

  // Called every frame. Makes the hall bulb flicker and sometimes cut out.
  const bulbOn = new THREE.Color(0xffe2b0);
  const bulbOff = new THREE.Color(0x3a2c1c);
  let dropoutUntil = 0;
  let nextDropout = 6;
  function update(t) {
    if (t > nextDropout) {
      dropoutUntil = t + 0.05 + Math.random() * 0.25;
      nextDropout = t + 4 + Math.random() * 14;
    }
    const out = t < dropoutUntil;
    bulb.intensity = out ? 0.15 : 2.2 + Math.sin(t * 13) * 0.12 + Math.sin(t * 47) * 0.06;
    bulbMaterial.color.copy(out ? bulbOff : bulbOn);
    screenLight.intensity = 1.1 + Math.sin(t * 2.1) * 0.05;
  }

  return { colliders, update };
}
