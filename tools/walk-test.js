// The walking test. It checks three things:
//   1. Every room can be reached on foot from where the game starts, by really
//      walking there with the game's own movement code.
//   2. A crowd of walkers mashing the keys at random, for thousands of steps
//      each, never ends up outside the flat, inside a wall or a piece of
//      furniture, or wedged somewhere it cannot get out of.
//   3. Footsteps are told the right kind of floor in every room.
//
// To run it: start the game (npm run dev), open the browser's console and type
//   (await import('/tools/walk-test.js')).run()
// It takes a few seconds, then prints a report and answers true (passed) or
// false. Reload the page afterwards to play again.
//
// Run it after anything that moves a wall, a door or a piece of furniture.

const RADIUS = 0.25; // how wide the player is. Must match src/player.js.
const CELL = 0.05; // the test lays a grid of 5 cm squares over the flat
const SPARE = 0.03; // the route keeps this much clear of everything
const WIDTH = 9.5; // the grid covers a little more than the flat
const DEPTH = 12.2;

// Each room: its rectangle on the plan and the floor it should have.
const ROOMS = {
  study: { x: [0, 4.2], z: [0, 3.4], floor: 'mosaic' },
  bedroom: { x: [0, 4.2], z: [3.4, 7.2], floor: 'mosaic' },
  kitchen: { x: [0, 4.2], z: [7.2, 12], floor: 'tile' },
  corridor: { x: [4.2, 5.7], z: [0, 12], floor: 'mosaic' },
  spareRoom: { x: [5.7, 9.3], z: [0, 3.6], floor: 'mosaic' },
  bathroom: { x: [5.7, 8.1], z: [3.6, 6.2], floor: 'tile' },
  store: { x: [5.7, 8.1], z: [6.2, 8.2], floor: 'cement' },
};
const roomAt = (x, z) => Object.keys(ROOMS).find((name) => x >= ROOMS[name].x[0] && x < ROOMS[name].x[1] && z >= ROOMS[name].z[0] && z < ROOMS[name].z[1]);

// How far a point is from a barrier (0 if it is inside one). The same sums
// as the player's own collision code, written out a second time on purpose.
function gapTo(c, x, z) {
  if (c.half !== undefined) {
    const lx = c.bx - c.ax;
    const lz = c.bz - c.az;
    const along = Math.max(0, Math.min(1, ((x - c.ax) * lx + (z - c.az) * lz) / (lx * lx + lz * lz)));
    return Math.max(0, Math.hypot(x - (c.ax + lx * along), z - (c.az + lz * along)) - c.half);
  }
  return Math.hypot(Math.max(c.minX - x, 0, x - c.maxX), Math.max(c.minZ - z, 0, z - c.maxZ));
}
function nearestGap(colliders, x, z) {
  let nearest = Infinity;
  for (const c of colliders) nearest = Math.min(nearest, gapTo(c, x, z));
  return nearest;
}

export function run({ walkers = 40, steps = 10000 } = {}) {
  const game = window.__game;
  if (!game) throw new Error('The walking test only works while developing (npm run dev).');
  const { player, apartment, floorAt } = game;
  const colliders = apartment.colliders;
  game.testMode();
  const problems = [];

  // --- The grid: which squares the player fits in --------------------------
  const across = Math.ceil(WIDTH / CELL);
  const down = Math.ceil(DEPTH / CELL);
  const centre = (i) => (i + 0.5) * CELL;
  const cellOf = (x, z) => Math.floor(z / CELL) * across + Math.floor(x / CELL);
  const fits = new Uint8Array(across * down);
  for (let j = 0; j < down; j++) for (let i = 0; i < across; i++) if (nearestGap(colliders, centre(i), centre(j)) >= RADIUS + SPARE) fits[j * across + i] = 1;

  // Flood outwards from one square. Answers, for every square, how many
  // squares away it is (-1: cannot be reached) and which square leads to it.
  function flood(from) {
    const far = new Int32Array(across * down).fill(-1);
    const via = new Int32Array(across * down).fill(-1);
    const queue = [from];
    far[from] = 0;
    for (let head = 0; head < queue.length; head++) {
      const at = queue[head];
      const i = at % across;
      const j = (at - i) / across;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= across || nj >= down) continue;
        const next = nj * across + ni;
        if (!fits[next] || far[next] >= 0) continue;
        if (di && dj && !(fits[j * across + ni] && fits[nj * across + i])) continue; // no squeezing past corners
        far[next] = far[at] + 1;
        via[next] = at;
        queue.push(next);
      }
    }
    return { far, via };
  }

  const start = cellOf(apartment.start.x, apartment.start.z);
  if (!fits[start]) problems.push('The starting point is inside something.');
  const fromStart = flood(start);

  // --- 1. Every room can be reached -------------------------------------------
  const rooms = {};
  const targets = [];
  for (const name of Object.keys(ROOMS)) {
    let squares = 0;
    let deepest = -1;
    for (let at = 0; at < fits.length; at++) {
      if (fromStart.far[at] < 0) continue;
      const i = at % across;
      if (roomAt(centre(i), centre((at - i) / across)) !== name) continue;
      squares++;
      if (deepest < 0 || fromStart.far[at] > fromStart.far[deepest]) deepest = at;
    }
    rooms[name] = { 'room to stand in (m2)': +(squares * CELL * CELL).toFixed(1), walked: 'no' };
    if (deepest < 0) problems.push(`Cannot reach the ${name}.`);
    else targets.push([name, deepest]);
  }

  // Really walk it: from the start to the far corner of each room in turn.
  const state = player.state;
  const still = { forward: 0, right: 0, fast: false };
  player.reset(apartment.start);
  player.update(0, still);
  let walked = 0;
  targets.forEach(([name, target], leg) => {
    const { far, via } = flood(cellOf(state.x, state.z));
    if (far[target] < 0) {
      problems.push(`No way from the ${roomAt(state.x, state.z)} to the ${name}.`);
      return;
    }
    const path = [];
    for (let at = target; at >= 0; at = via[at]) path.push(at);
    path.reverse();
    for (const at of path) {
      const tx = centre(at % across);
      const tz = centre(Math.floor(at / across));
      let tries = 0;
      while (Math.hypot(tx - state.x, tz - state.z) > 0.03) {
        if (++tries > 60) {
          problems.push(`Got stuck on the way to the ${name}, at ${state.x.toFixed(2)}, ${state.z.toFixed(2)}.`);
          return;
        }
        const before = [state.x, state.z];
        state.yaw = Math.atan2(state.x - tx, state.z - tz); // face the next square
        player.update(1 / 60, { forward: 1, right: 0, fast: leg % 2 === 1 });
        walked += Math.hypot(state.x - before[0], state.z - before[1]);
      }
    }
    rooms[name].walked = 'yes';
  });

  // --- 2 and 3. Random walkers, and what floor their footsteps land on -----------
  // A walker has got out if it is no longer in any room on the plan. It
  // cannot pass through a wall without first sinking into it, and sinking in
  // is measured after every single step, so those two checks cover everything.
  const reachable = [];
  for (let at = 0; at < fits.length; at++) if (fromStart.far[at] >= 0) reachable.push(at);

  const floors = {};
  let wrongFloor = 0;
  player.setStepListener((x, z) => {
    const got = floorAt(x, z);
    floors[got] = (floors[got] || 0) + 1;
    const room = roomAt(x, z);
    if (!room || ROOMS[room].floor !== got) wrongFloor++;
  });

  let worstOverlap = 0;
  let escapes = 0;
  let stuck = 0;
  let taken = 0;
  const pick = () => Math.floor(Math.random() * 3) - 1;
  for (let w = 0; w < walkers; w++) {
    const from = reachable[Math.floor(Math.random() * reachable.length)];
    player.reset({ x: centre(from % across), z: centre(Math.floor(from / across)), yaw: Math.random() * 6.283 });
    let input = { forward: 1, right: 0, fast: false };
    let anchor = [state.x, state.z];
    let anchoredAt = 0;
    for (let s = 0; s < steps; s++) {
      if (Math.random() < 0.02) input = { forward: pick(), right: pick(), fast: Math.random() < 0.5 };
      state.yaw += (Math.random() - 0.5) * 0.3; // the mouse wandering
      player.update(0.004 + Math.random() * 0.046, input); // frames of every length the game allows
      taken++;
      const overlap = RADIUS - nearestGap(colliders, state.x, state.z);
      if (overlap > worstOverlap) worstOverlap = overlap;
      if (!Number.isFinite(state.x + state.z) || !roomAt(state.x, state.z)) {
        escapes++;
        if (escapes <= 5) problems.push(`A walker got out, to ${state.x.toFixed(2)}, ${state.z.toFixed(2)}.`);
        break;
      }
      // Wedged: has not moved a hand's width in 4000 steps of random key-mashing.
      if (Math.hypot(state.x - anchor[0], state.z - anchor[1]) > 0.1) {
        anchor = [state.x, state.z];
        anchoredAt = s;
      } else if (s - anchoredAt > 4000) {
        stuck++;
        if (stuck <= 5) problems.push(`A walker is wedged at ${state.x.toFixed(2)}, ${state.z.toFixed(2)}.`);
        break;
      }
    }
  }
  if (worstOverlap > 0.01) problems.push(`A walker sank ${(worstOverlap * 100).toFixed(1)} cm into something.`);
  if (wrongFloor) problems.push(`${wrongFloor} footsteps were told the wrong floor.`);
  for (const floor of ['mosaic', 'tile', 'cement']) if (!floors[floor]) problems.push(`No footstep ever landed on ${floor}.`);

  // --- The report ---------------------------------------------------------------
  const report = {
    passed: problems.length === 0,
    problems,
    rooms,
    'route walked (m)': +walked.toFixed(1),
    'random steps taken': taken,
    'walkers that got out': escapes,
    'walkers that got wedged': stuck,
    'deepest overlap (cm)': +(worstOverlap * 100).toFixed(2),
    'footsteps by floor': floors,
    barriers: colliders.length,
  };
  console.table(rooms);
  console.log(report);
  console.log(report.passed ? 'Walking test passed.' : `Walking test FAILED:\n${problems.join('\n')}`);
  run.lastReport = report;
  return report.passed;
}
