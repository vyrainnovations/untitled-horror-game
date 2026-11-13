// Building blocks. Everything in the flat is made by calling these: boxes,
// cylinders, rods, balls, flat panels, sheets of cloth, and invisible barriers.
//
// Compass words are used for the sides of things: north is -Z, south is +Z,
// west is -X, east is +X.
import * as THREE from 'three';

// Which two directions run across each of a box's six sides.
const SIDE_ORDER = ['east', 'west', 'top', 'bottom', 'south', 'north'];
const SIDE_AXES = [['z', 'y'], ['z', 'y'], ['x', 'z'], ['x', 'z'], ['x', 'y'], ['x', 'y']];
const FACING = {
  '+x': [0, Math.PI / 2],
  '-x': [0, -Math.PI / 2],
  '+z': [0, 0],
  '-z': [0, Math.PI],
  '+y': [-Math.PI / 2, 0],
  '-y': [Math.PI / 2, 0],
};
const UP = new THREE.Vector3(0, 1, 0);

export function createBuilder(scene) {
  const colliders = []; // everything the player cannot walk through
  const updaters = []; // things that move or flicker, called every frame
  const things = {}; // the few objects the game picks up, moves or switches on, by name
  let parent = scene;

  const first = (m) => (Array.isArray(m) ? m[0] : m);

  function place(mesh, opts = {}) {
    const unlit = !!first(mesh.material).isMeshBasicMaterial;
    mesh.castShadow = opts.cast ?? !unlit;
    mesh.receiveShadow = opts.receive ?? !unlit;
    parent.add(mesh);
    return mesh;
  }

  // Lay a repeating texture across a box by real-world position. That keeps
  // textures the same scale on everything, and lined up across neighbours.
  function worldUV(geometry, cx, cy, cz, material, turn) {
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < 24; i++) {
      const side = i >> 2;
      const tile = (Array.isArray(material) ? material[side] : material).userData.tile;
      if (!tile) continue; // a fitted texture: leave it stretched over the side
      const p = { x: pos.getX(i) + cx, y: pos.getY(i) + cy, z: pos.getZ(i) + cz };
      const [a, b] = SIDE_AXES[side];
      if (turn) uv.setXY(i, p[b] / tile[0], p[a] / tile[1]);
      else uv.setXY(i, p[a] / tile[0], p[b] / tile[1]);
    }
  }

  // A box from its two corners. Options: solid (the player collides with it),
  // turn (rotate the texture a quarter turn), cast / receive (shadows).
  function box(x0, x1, y0, y1, z0, z1, material, opts = {}) {
    const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const cz = (z0 + z1) / 2;
    worldUV(geometry, cx, cy, cz, material, opts.turn);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx, cy, cz);
    if (opts.solid) block(x0, x1, z0, z1);
    return place(mesh, opts);
  }

  // Six materials for one box: `all` everywhere, except the sides named in
  // `special`, for example sides(M.wood, { south: M.doorFront }).
  const sides = (all, special) => SIDE_ORDER.map((name) => special[name] || all);

  // An upright cylinder standing at (x, z), from y0 up to y1. Options: top (a
  // different radius at the top), sides, open (no end caps), squash [x, z].
  function cyl(x, z, y0, y1, radius, material, opts = {}) {
    const geometry = new THREE.CylinderGeometry(opts.top ?? radius, radius, y1 - y0, opts.sides ?? 10, 1, !!opts.open);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, (y0 + y1) / 2, z);
    if (opts.squash) mesh.scale.set(opts.squash[0], 1, opts.squash[1]);
    return place(mesh, opts);
  }

  // A thin round bar between two points [x, y, z]: pipes, legs, cables, rails.
  function rod(from, to, radius, material, opts = {}) {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), opts.sides ?? 5), material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, b.sub(a).normalize());
    return place(mesh, opts);
  }

  function ball(x, y, z, radius, material, opts = {}) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, opts.sides ?? 8, 6), material);
    mesh.position.set(x, y, z);
    if (opts.squash) mesh.scale.set(...opts.squash);
    return place(mesh, opts);
  }

  // A flat rectangle facing one way ('+x', '-x', '+z', '-z', '+y', '-y'):
  // posters, screens, rugs, labels. Option: spin (tilt it in its own plane).
  function panel(x, y, z, w, h, facing, material, opts = {}) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.set(x, y, z);
    const [rx, ry] = FACING[facing];
    mesh.rotation.set(rx, ry, opts.spin ?? 0);
    return place(mesh, { cast: false, ...opts });
  }

  // A sheet of cloth. shape(u, v) says where each point of the sheet sits, with
  // u and v running from 0 to 1 across it. width and height are its real size.
  function cloth(columns, rows, width, height, material, shape, opts = {}) {
    const geometry = new THREE.PlaneGeometry(1, 1, columns, rows);
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const tile = material.userData.tile || [width, height];
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) + 0.5;
      const v = pos.getY(i) + 0.5;
      const p = shape(u, v);
      pos.setXYZ(i, p[0], p[1], p[2]);
      uv.setXY(i, (u * width) / tile[0], (v * height) / tile[1]);
    }
    geometry.computeVertexNormals();
    return place(new THREE.Mesh(geometry, material), opts);
  }

  // Build several things as one unit that is moved and turned together.
  // Inside build(), positions are measured from (x, y, z).
  function group(x, y, z, turn, build) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = turn;
    parent.add(g);
    const outer = parent;
    parent = g;
    build(g);
    parent = outer;
    return g;
  }

  // A soft glow that always faces the camera: the haze round a lit bulb.
  function glow(x, y, z, size, material) {
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(size, size, 1);
    parent.add(sprite);
    return sprite;
  }

  // Invisible barriers. block() is a rectangle on the floor. blockLine() is a
  // thin straight barrier at any angle (an open door). Both hand back the
  // barrier, so that it can be moved later along with the thing it guards.
  function block(minX, maxX, minZ, maxZ) {
    const barrier = { minX, maxX, minZ, maxZ };
    colliders.push(barrier);
    return barrier;
  }
  function blockLine(ax, az, bx, bz, half = 0.03) {
    const barrier = { ax, az, bx, bz, half };
    colliders.push(barrier);
    return barrier;
  }

  // Give something a name, so the game can find it again later to pick it
  // up, move it or switch it on: b.tag('rubbishBag', ...). The names end up
  // in apartment.things. Most of the flat never moves and has no name.
  function tag(name, object) {
    things[name] = object;
    return object;
  }

  return { box, sides, cyl, rod, ball, panel, cloth, group, glow, block, blockLine, tag, things, colliders, updaters, add: (object) => parent.add(object) };
}
