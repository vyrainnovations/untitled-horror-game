// Fittings: the parts of a flat that are not furniture. Walls with doorways
// and windows cut into them, door frames, doors, windows, curtains, and the
// things fixed to walls and ceilings (pictures, switches, fans, bulbs).
import { CEILING, DOOR_HEIGHT, HALF } from './plan.js';

// Which way a wall surface faces: [x step, z step].
const NORMAL = { '+x': [1, 0], '-x': [-1, 0], '+z': [0, 1], '-z': [0, -1] };

export function createFittings(b, M) {
  // A wall along a line. axis 'x' runs east-west at z = at. axis 'z' runs
  // north-south at x = at. `low` is the surface seen from the north or west
  // side, `high` the one seen from the south or east side. Openings are
  // doorways and windows: { from, to, bottom, top }.
  function wall(axis, at, from, to, low, high, openings = []) {
    const piece = (a, c, y0, y1, solid) => {
      if (c - a < 0.001 || y1 - y0 < 0.001) return;
      if (axis === 'x') b.box(a, c, y0, y1, at - HALF, at + HALF, b.sides(M.plaster, { north: low, south: high }), { solid });
      else b.box(at - HALF, at + HALF, y0, y1, a, c, b.sides(M.plaster, { west: low, east: high }), { solid });
    };
    let cursor = from;
    for (const o of openings) {
      piece(cursor, o.from, 0, CEILING, true);
      piece(o.from, o.to, 0, o.bottom ?? 0, true); // the wall under a window
      piece(o.from, o.to, o.top ?? DOOR_HEIGHT, CEILING, false); // the wall over the opening
      cursor = o.to;
    }
    piece(cursor, to, 0, CEILING, true);
  }

  // The wooden frame round a doorway. It narrows the opening by 5 cm a side.
  function doorFrame(axis, at, from, to, wood = M.woodDark) {
    const T = 0.05; // how thick the frame is
    const D = 0.08; // how far it stands out from the middle of the wall
    if (axis === 'z') {
      b.box(at - D, at + D, 0, DOOR_HEIGHT, from, from + T, wood, { solid: true, turn: true });
      b.box(at - D, at + D, 0, DOOR_HEIGHT, to - T, to, wood, { solid: true, turn: true });
      b.box(at - D, at + D, DOOR_HEIGHT - T, DOOR_HEIGHT, from + T, to - T, wood);
    } else {
      b.box(from, from + T, 0, DOOR_HEIGHT, at - D, at + D, wood, { solid: true, turn: true });
      b.box(to - T, to, 0, DOOR_HEIGHT, at - D, at + D, wood, { solid: true, turn: true });
      b.box(from + T, to - T, DOOR_HEIGHT - T, DOOR_HEIGHT, at - D, at + D, wood);
    }
  }

  // An open door. It hangs from (hingeX, hingeZ) and points along (dirX, dirZ).
  function doorLeaf(hingeX, hingeZ, dirX, dirZ, face, opts = {}) {
    const width = opts.width ?? 0.8;
    const length = Math.hypot(dirX, dirZ);
    const dx = dirX / length;
    const dz = dirZ / length;
    b.group(hingeX, 0, hingeZ, Math.atan2(-dz, dx), () => {
      b.box(0, width, 0.01, DOOR_HEIGHT - 0.06, -0.02, 0.02, b.sides(opts.edge ?? M.woodDark, { south: face, north: face }));
      b.box(width - 0.09, width - 0.05, 0.97, 1.05, -0.05, 0.05, M.steel); // handle plate, both sides
      b.box(width - 0.17, width - 0.05, 1.0, 1.02, 0.05, 0.065, M.steel); // levers
      b.box(width - 0.17, width - 0.05, 1.0, 1.02, -0.065, -0.05, M.steel);
    });
    b.blockLine(hingeX, hingeZ, hingeX + dx * width, hingeZ + dz * width, 0.03);
  }

  // A window in a north-south wall at x = at: stone sill, wooden frame, dirty
  // glass, and a steel grill on the outside. `inside` is +1 when the room is
  // east of the wall and -1 when it is west of it.
  function windowAt(at, z0, z1, y0, y1, inside, opts = {}) {
    const f = 0.04;
    const wood = opts.frame ?? M.woodDark;
    b.box(Math.min(at - inside * 0.07, at + inside * 0.16), Math.max(at - inside * 0.07, at + inside * 0.16), y0 - 0.04, y0 + 0.005, z0 - 0.06, z1 + 0.06, M.stone);
    b.box(at - 0.03, at + 0.03, y0, y0 + f, z0, z1, wood);
    b.box(at - 0.03, at + 0.03, y1 - f, y1, z0, z1, wood);
    b.box(at - 0.03, at + 0.03, y0, y1, z0, z0 + f, wood);
    b.box(at - 0.03, at + 0.03, y0, y1, z1 - f, z1, wood);
    const panes = opts.panes ?? 2;
    for (let i = 1; i < panes; i++) {
      const z = z0 + ((z1 - z0) * i) / panes;
      b.box(at - 0.025, at + 0.025, y0, y1, z - f / 2, z + f / 2, wood);
    }
    b.panel(at, (y0 + y1) / 2, (z0 + z1) / 2, z1 - z0 - 2 * f, y1 - y0 - 2 * f, inside > 0 ? '+x' : '-x', M.glass);
    const gx = at - inside * 0.1;
    for (let z = z0 + 0.14; z < z1 - 0.06; z += 0.14) b.box(gx - 0.008, gx + 0.008, y0, y1, z - 0.008, z + 0.008, M.darkMetal);
    for (const k of [1 / 3, 2 / 3]) {
      const y = y0 + (y1 - y0) * k;
      b.box(gx - 0.008, gx + 0.008, y - 0.008, y + 0.008, z0, z1, M.darkMetal);
    }
  }

  // A curtain hanging beside a north-south wall. x is where it hangs, z0 to z1
  // how far it is spread, folds how many pleats it has.
  function curtain(x, z0, z1, yBottom, yTop, folds, material = M.curtain) {
    const height = yTop - yBottom;
    b.cloth(Math.max(6, folds * 4), 5, folds * 0.3, height, material, (u, v) => [
      x + Math.sin(u * folds * Math.PI * 2) * (0.02 + 0.02 * (1 - v)),
      yBottom + v * height,
      z0 + u * (z1 - z0),
    ]);
  }

  // Something flat hung on a wall: a framed picture, a poster, a calendar.
  // (x, z) is a point on the wall's surface and `facing` is the way the wall
  // faces. Pass frame: null for no frame.
  function hung(x, y, z, w, h, facing, material, opts = {}) {
    const [nx, nz] = NORMAL[facing];
    const depth = opts.depth ?? 0.02;
    const rim = opts.rim ?? 0.025;
    const framed = opts.frame !== null;
    if (framed) {
      const frame = opts.frame || M.woodDark;
      if (nx) b.box(Math.min(x, x + nx * depth), Math.max(x, x + nx * depth), y - h / 2 - rim, y + h / 2 + rim, z - w / 2 - rim, z + w / 2 + rim, frame, { cast: false });
      else b.box(x - w / 2 - rim, x + w / 2 + rim, y - h / 2 - rim, y + h / 2 + rim, Math.min(z, z + nz * depth), Math.max(z, z + nz * depth), frame, { cast: false });
    }
    const off = framed ? depth + 0.003 : 0.004;
    return b.panel(x + nx * off, y, z + nz * off, w, h, facing, material, { spin: opts.spin });
  }

  // A tiny light: a power LED, a standby light.
  function led(x, y, z, material, size = 0.014) {
    const half = size / 2;
    return b.box(x - half, x + half, y - half, y + half, z - half, z + half, material);
  }

  // A plate of light switches, with the little red light that switchboards
  // in this part of the world have.
  function switchboard(x, y, z, facing) {
    const [nx, nz] = NORMAL[facing];
    hung(x, y, z, 0.15, 0.1, facing, M.switchboard, { frame: null });
    led(x + nx * 0.008 + (nz ? 0.055 : 0), y + 0.032, z + nz * 0.008 + (nx ? 0.055 : 0), M.ledRed, 0.012);
  }

  // A fluorescent tube between two points [x, y, z], with its fitting above.
  function tube(from, to, on) {
    b.rod(from, to, 0.016, on ? M.tubeOn : M.bulbOff, { sides: 6, cast: false });
    b.rod([from[0], from[1] + 0.03, from[2]], [to[0], to[1] + 0.03, to[2]], 0.024, M.whitePlastic, { sides: 4, cast: false });
  }

  // A ceiling fan. speed is in turns of a radian per second; 0 is stopped.
  function ceilingFan(x, z, speed = 0) {
    b.cyl(x, z, CEILING - 0.03, CEILING, 0.05, M.whitePlastic, { sides: 8, cast: false });
    b.rod([x, CEILING, z], [x, CEILING - 0.32, z], 0.012, M.darkMetal, { cast: false });
    const hub = b.group(x, CEILING - 0.36, z, 0, () => {
      b.cyl(0, 0, -0.05, 0.05, 0.1, M.whitePlastic, { sides: 10, cast: false });
      for (let i = 0; i < 3; i++) {
        b.group(0, 0, 0, (i * Math.PI * 2) / 3, () => b.box(0.09, 0.66, -0.012, 0, -0.065, 0.065, M.whitePlastic, { cast: false }));
      }
    });
    if (speed) b.updaters.push((t, dt) => { hub.rotation.y += dt * speed; });
    return hub;
  }

  // A bare bulb on a cord. Returns the bulb itself, so it can flicker.
  function hangingBulb(x, z, drop, material) {
    const y = CEILING - drop;
    b.rod([x, CEILING, z], [x, y + 0.09, z], 0.006, M.blackPlastic, { cast: false });
    b.cyl(x, z, y + 0.04, y + 0.09, 0.022, M.blackPlastic, { sides: 6, cast: false });
    return b.ball(x, y, z, 0.045, material, { cast: false });
  }

  return { wall, doorFrame, doorLeaf, windowAt, curtain, hung, led, switchboard, tube, ceilingFan, hangingBulb };
}
