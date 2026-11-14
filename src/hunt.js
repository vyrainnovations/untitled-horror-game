// Part 3, "The light": STORY.md, beats 15 to 19.
//
// Every light in the flat dies at once. Beside the desk, an arm's length
// away, stands a dark figure with a white light where its face should be,
// bent over the dead screen. The player gets out behind its back and
// hides. It goes from room to room with its light, looking for him. If the
// light falls on him up close, the picture burns white, the tape rewinds,
// and it is lights out again. At the front door it gives up, and the light
// goes out.
//
// (It is Hamza, with a head torch, looking for his friend. The player
// does not know that yet: STORY.md, rules 5 and 6.)
//
// HOW TO CHANGE THINGS
//   ROUTE   where it goes and what it does there, in order.
//   SPOTS   the places to hide.
//   SEES    how far its light reaches and how wide it is.
//   SPEED, TIMES, LAMP, SAYS   what they say.
//
// How it finds him: the light is a cone. He is found if he is inside the
// cone, with no wall in between, and either close (SEES.near) or in it for
// long enough (SEES.hold). Seen from further off, it stops what it was
// doing and comes for him, fast, to the doorway of the room he went into.
// Furniture does not hide him; walls and wardrobes do.
import * as THREE from 'three';
import { createFigure, createGlare } from './figures.js';
import { floorAt } from './plan.js';

const SOUTH = 0;
const EAST = Math.PI / 2;
const NORTH = Math.PI;
const WEST = -Math.PI / 2;

// Where it is when the lights go out: where the last tape left it.
const DESK = { at: [3.1, 1.15], facing: -2.49 };
// Metres a second, and radians a second for turning.
const SPEED = { search: 0.95, chase: 2.15, turn: 2.6 };
// The torch: its colour, how bright, how far it reaches (metres), how wide
// its beam is (radians, from the middle to the edge), and how soft the edge.
const LAMP = { colour: 0xeaf1ff, bright: 15, reach: 12, angle: 0.44, soft: 0.55 };
// What it can see by that light: the beam's half-width, how far, how close
// is found at once, how close is found whatever way it is facing, how long
// in the light at any distance is found, and how long before it gives chase.
const SEES = { cone: 0.46, reach: 10.5, near: 2.6, touch: 0.75, hold: 2.2, spot: 0.3 };
const TIMES = {
  task: 1.4, // seconds after the lights go out before "Hide"
  patience: 17, // if the player has not stood up by then, it turns round
  grace: 6.5, // once he stands, it stays at the screen this long
  stare: 2.8, // how long it stands looking at the wardrobe he is in
  lose: 3.2, // how long out of its sight before it gives up the chase
  white: 0.95, // found: the picture is white for this long
  rewind: 1.5, // and then the tape rewinds for this long
  over: 2.4, // after the light goes out, before the game moves on
  hide: 0.45, // getting into a wardrobe, or out of it
};
const SAYS = 'Unknown number';

// Each room's doorway: where it stands to shine its light in, and the way
// it faces. inside(x, z) says whether a spot on the plan is in that room.
const DOORS = [
  { name: 'study', inside: (x, z) => x < 4.2 && z < 3.4, at: [4.55, 2.15], facing: WEST },
  { name: 'bedroom', inside: (x, z) => x < 4.2 && z >= 3.4 && z < 7.2, at: [4.55, 4.85], facing: WEST },
  { name: 'kitchen', inside: (x, z) => x < 4.2 && z >= 7.2, at: [4.45, 9.6], facing: WEST },
  { name: 'spare', inside: (x, z) => x > 5.7 && z < 3.6, at: [5.35, 2.15], facing: EAST },
  { name: 'bathroom', inside: (x, z) => x > 5.7 && z >= 3.6 && z < 6.2, at: [5.35, 4.9], facing: EAST },
  { name: 'store', inside: (x, z) => x > 5.7 && z >= 6.2, at: [5.35, 7.2], facing: EAST },
];

// The places to hide: the two wardrobes.
//   at     the spot to look at to get the prompt: [x, y, z]
//   stand  where he stands when he steps out again: [x, z]
//   eye    where his eyes are inside it: [x, y, z]
//   yaw    the way he faces inside it, towards the room's door (radians)
//   from   where it stands to look at this wardrobe, and the way it faces then
const SPOTS = [
  { name: 'spare', at: [6.6, 1.2, 2.93], stand: [6.6, 2.5], eye: [6.6, 1.42, 3.2], yaw: 0.72, stare: 0.47 },
  { name: 'bedroom', at: [2.6, 1.2, 4.07], stand: [2.6, 4.55], eye: [2.6, 1.42, 3.8], yaw: -2.15, stare: -2.29 },
];

// Where it goes, in order.
//   turn    turn the whole body to face this way, taking so many seconds
//   walk    walk to this spot [x, z]. station: the search can be picked up
//           again from here after a chase
//   look    face this way, then sweep the light so far to each side
//   stare   if he is hiding in this wardrobe, stand and look at it
//   say     a message from the unknown number
//   wait    stand still
const ROUTE = [
  { turn: 0.78, seconds: 4.2 }, // straightening up from the desk: the light goes round the room
  { walk: [3.7, 2.15] },
  { walk: [4.95, 2.15], station: true },
  { look: NORTH, sweep: 0.35, seconds: 1.6 },
  { look: SOUTH, sweep: 0.3, seconds: 2.4 },
  { say: 'Where are you.' },
  { walk: [5.3, 2.15] }, // the spare room
  { look: EAST, sweep: 0.9, seconds: 3 },
  { walk: [6.05, 2.15] },
  { look: EAST, sweep: 1.25, seconds: 3.2 },
  { stare: 'spare' },
  { walk: [4.95, 2.15] },
  { walk: [4.95, 4.88], station: true }, // the bathroom
  { look: EAST, sweep: 0.8, seconds: 2.6 },
  { say: 'I know you are in here.' },
  { walk: [4.6, 4.85] }, // his bedroom
  { look: WEST, sweep: 0.9, seconds: 3 },
  { walk: [3.85, 4.85] },
  { look: WEST, sweep: 1.25, seconds: 3.2 },
  { stare: 'bedroom' },
  { walk: [4.95, 4.85] },
  { walk: [4.95, 7.2], station: true }, // the store room
  { look: EAST, sweep: 0.7, seconds: 2.4 },
  { walk: [4.95, 9.6], station: true }, // the kitchen
  { say: 'It is Hamza.' },
  { walk: [4.5, 9.6] },
  { look: WEST, sweep: 0.9, seconds: 3 },
  { walk: [3.6, 9.6] },
  { look: WEST, sweep: 1.3, seconds: 3.6 },
  { walk: [4.95, 9.6] },
  { walk: [4.95, 10.7], station: true }, // the front door
  { look: SOUTH, sweep: 0, seconds: 2 },
  { say: 'Please.' },
  { wait: 3.4 },
];

const smooth = (k) => k * k * (3 - 2 * k);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// The short way round from one angle to another.
const turnBy = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

export function createHunt({ renderer, scene, camera, apartment, player, seat, interact, hud, audio, cut, onDone }) {
  const walls = apartment.walls;

  // --- The figure, and its light ---------------------------------------------------
  const him = createFigure('hamza', { torch: true });
  him.root.visible = false;
  scene.add(him.root);
  const glare = createGlare(1); // the light, seen from in front
  glare.position.copy(him.lamp.position);
  glare.position.z += 0.03;
  him.head.add(glare);
  // The beam. It is in the flat from the start, turned down to nothing,
  // because adding a light later makes the game stop for a moment. It is
  // the one light whose shadows move: while it is on, its shadows are drawn
  // again every frame, and nobody else's (see takeShadows).
  const beam = new THREE.SpotLight(LAMP.colour, 0, LAMP.reach, LAMP.angle, LAMP.soft, 1.15);
  beam.castShadow = true;
  beam.shadow.mapSize.set(512, 512);
  beam.shadow.camera.near = 0.2;
  beam.shadow.camera.far = LAMP.reach;
  beam.shadow.bias = -0.0015;
  beam.shadow.normalBias = 0.03;
  beam.shadow.autoUpdate = false;
  beam.shadow.needsUpdate = true; // once, so that it has a shadow to its name
  scene.add(beam, beam.target);
  const others = []; // every other light that casts a shadow
  scene.traverse((thing) => {
    if (thing.isLight && thing.castShadow && thing !== beam) others.push(thing);
  });
  function takeShadows(mine) {
    for (const light of others) light.shadow.autoUpdate = !mine;
    beam.shadow.autoUpdate = mine;
  }

  // --- What the screen does while hiding, and when found ------------------------------
  const slit = document.createElement('div');
  slit.className = 'slit';
  slit.hidden = true;
  const flash = document.createElement('div');
  flash.className = 'found';
  flash.hidden = true;
  const osd = document.createElement('p');
  osd.className = 'found__osd';
  osd.textContent = `${String.fromCharCode(9664, 9664)} REW`; // two triangles pointing left, as a tape deck shows rewind
  flash.append(osd);
  document.body.append(slit, flash);

  // --- Where it has got to ----------------------------------------------------------------
  let stage = 'off'; // 'off', 'desk' (lights out, it is at the screen), 'search', 'chase', 'found', 'rewind', 'over'
  let clock = 0; // seconds since the lights went out (this time round)
  let stood = null; // seconds since the player got up from the chair
  let index = 0; // the step of the route it is on
  let stepTime = 0; // seconds into that step
  let faced = false; // on a 'look' step: has it turned to face the way yet
  let detour = null; // the steps of a chase, instead of the route
  let pos = { x: DESK.at[0], z: DESK.at[1] };
  let facing = DESK.facing; // the way its body faces
  let headYaw = 0; // how far its head is turned from that
  let phase = 0; // its walk
  let seenFor = 0; // seconds the player has been in its light
  let unseen = 0; // seconds since he was last in it
  let lastSeen = null; // where: [x, z]
  let chasing = null; // the doorway it is making for
  let hidden = null; // the place the player is hiding in
  let moving = null; // getting in or out: { from, to, time, then }
  let found = 0; // seconds since he was found
  let catches = 0; // how many times so far
  let beat = 0; // seconds until the next heartbeat
  let outside = 0; // seconds the player has been out of the study without hiding
  const said = new Set(); // messages already sent
  const lampAt = new THREE.Vector3();
  const lampWay = new THREE.Vector3();
  const toHim = new THREE.Vector3();

  // --- Hiding --------------------------------------------------------------------------
  for (const spot of SPOTS) {
    interact.add({
      at: spot.at,
      look: 0.75,
      reach: 1.7,
      prompt: () => (['desk', 'search', 'chase'].includes(stage) && !hidden && !moving ? 'Hide in the wardrobe' : null),
      use: () => hide(spot),
    });
  }

  const view = () => ({ x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: camera.rotation.y, pitch: camera.rotation.x });

  function hide(spot) {
    hud.prompt(null);
    audio.act('doorOpen');
    moving = { from: view(), to: { x: spot.eye[0], y: spot.eye[1], z: spot.eye[2], yaw: spot.yaw, pitch: 0 }, time: 0, then: () => {
      hidden = spot;
      player.state.yaw = spot.yaw;
      player.state.pitch = 0;
      slit.hidden = false;
      hud.hint(null);
    } };
    moving.to.yaw = moving.from.yaw + turnBy(moving.from.yaw, spot.yaw);
  }

  // E, or Q: step out again.
  function stepOut() {
    if (!hidden || moving) return;
    const spot = hidden;
    hidden = null;
    slit.hidden = true;
    audio.act('doorOpen');
    const out = { x: spot.stand[0], y: 1.5, z: spot.stand[1], yaw: camera.rotation.y, pitch: 0 };
    moving = { from: view(), to: out, time: 0, then: () => player.reset({ x: out.x, z: out.z, yaw: out.yaw, pitch: 0 }) };
  }

  // --- Seeing ---------------------------------------------------------------------------
  // Is there a wall between two points [x, y, z]? Every piece of wall is a box.
  function wallBetween(a, b) {
    for (const wall of walls) {
      let from = 0;
      let to = 1;
      for (let i = 0; i < 3 && from <= to; i++) {
        const step = b[i] - a[i];
        if (Math.abs(step) < 1e-9) {
          if (a[i] < wall.min[i] || a[i] > wall.max[i]) from = 2;
          continue;
        }
        const t0 = (wall.min[i] - a[i]) / step;
        const t1 = (wall.max[i] - a[i]) / step;
        from = Math.max(from, Math.min(t0, t1));
        to = Math.min(to, Math.max(t0, t1));
      }
      if (from <= to) return true;
    }
    return false;
  }

  // How far the player is from it, on the plan.
  const away = () => Math.hypot(camera.position.x - pos.x, camera.position.z - pos.z);

  // Is the player in its light? Answers the distance if so, or 0. The
  // light is taken as a wedge on the plan: how high or low he is does not
  // come into it, so a man sat in a chair an arm's length away is not
  // missed for being under the beam.
  function inLight() {
    if (hidden) return 0;
    const dx = camera.position.x - lampAt.x;
    const dz = camera.position.z - lampAt.z;
    const distance = Math.hypot(dx, dz);
    if (distance > SEES.reach) return 0;
    const flat = Math.hypot(lampWay.x, lampWay.z) || 1;
    if (distance > 0.05 && (dx * lampWay.x + dz * lampWay.z) / (distance * flat) < Math.cos(SEES.cone)) return 0;
    if (wallBetween([lampAt.x, lampAt.y, lampAt.z], [camera.position.x, camera.position.y - 0.1, camera.position.z])) return 0;
    return Math.max(distance, 0.01);
  }

  // --- Moving it ---------------------------------------------------------------------------
  // Walk towards a spot. Answers true once it is there.
  function walkTo(to, speed, dt) {
    const dx = to[0] - pos.x;
    const dz = to[1] - pos.z;
    const left = Math.hypot(dx, dz);
    if (left < 0.03) {
      pos.x = to[0];
      pos.z = to[1];
      return true;
    }
    const way = Math.atan2(dx, dz);
    const turn = turnBy(facing, way);
    facing += clamp(turn, -SPEED.turn * dt, SPEED.turn * dt);
    // It does not set off until it is nearly facing the way it is going.
    if (Math.abs(turn) < 0.6) {
      const step = Math.min(left, speed * dt);
      pos.x += (dx / left) * step;
      pos.z += (dz / left) * step;
      const before = Math.floor(phase / Math.PI);
      phase += (step / 0.72) * Math.PI;
      if (Math.floor(phase / Math.PI) > before) audio.stepAt(pos.x, pos.z, floorAt(pos.x, pos.z));
      him.stride(phase, speed > 1.5 ? 1 : 0.7);
    }
    headYaw += (0 - headYaw) * Math.min(1, dt * 4);
    return false;
  }

  // Do the step it is on. list is the route, or a chase's detour.
  function act(step, dt, speed) {
    if (!step) return true;
    stepTime += dt;
    if (step.walk) return walkTo(step.walk, speed, dt);
    him.pose('stand');
    if (step.turn !== undefined) {
      if (step.from === undefined) step.from = facing;
      const k = Math.min(1, stepTime / step.seconds);
      facing = step.from + (step.turn - step.from) * smooth(k);
      return k >= 1;
    }
    if (step.look !== undefined) {
      if (!faced) {
        const turn = turnBy(facing, step.look);
        facing += clamp(turn, -SPEED.turn * dt, SPEED.turn * dt);
        if (Math.abs(turn) < 0.03) {
          faced = true;
          stepTime = 0;
        }
        return false;
      }
      const k = Math.min(1, stepTime / step.seconds);
      headYaw = step.sweep * Math.sin(k * Math.PI * 2);
      return k >= 1;
    }
    if (step.stare) {
      const spot = SPOTS.find((s) => s.name === step.stare);
      if (hidden !== spot) return true;
      // He is in there. It turns, and the light comes to rest on the gap
      // between the doors. Then it turns away.
      if (!step.began) {
        step.began = true;
        stepTime = 0;
        audio.riser(TIMES.stare * 0.8, 0.3);
      }
      const turn = turnBy(facing, spot.stare);
      facing += clamp(turn, -1.2 * dt, 1.2 * dt);
      headYaw += (0 - headYaw) * Math.min(1, dt * 4);
      if (stepTime >= TIMES.stare) {
        step.began = false;
        return true;
      }
      return false;
    }
    if (step.say) {
      if (!said.has(step.say)) {
        said.add(step.say);
        audio.message('pocket');
        hud.banner(SAYS, step.say, 7);
      }
      return true;
    }
    if (step.wait) return stepTime >= step.wait;
    return true;
  }

  function nextStep() {
    stepTime = 0;
    faced = false;
  }

  // It has seen him, from across the flat: it comes for him. The way there
  // is along the corridor to the doorway of the room he is in, and a look
  // inside; or, if he is in the corridor, straight at him.
  function giveChase() {
    const [x, z] = lastSeen;
    const door = DOORS.find((d) => d.inside(x, z));
    const steps = [];
    if (Math.abs(pos.x - 4.95) > 0.1) steps.push({ walk: [4.95, pos.z] }); // out of the room it is in, first
    if (door) {
      steps.push({ walk: [4.95, door.at[1]] }, { walk: door.at }, { look: door.facing, sweep: 1.25, seconds: 3 }, { walk: [4.95, door.at[1]] });
    } else {
      steps.push({ walk: [4.95, clamp(z, 0.9, 11)] }, { look: z > pos.z ? SOUTH : NORTH, sweep: 1.3, seconds: 2.6 });
    }
    if (stage !== 'chase') {
      audio.sting('thud');
      audio.riser(0.7, 0.35);
    }
    stage = 'chase';
    chasing = door ? door.name : 'corridor';
    detour = steps;
    nextStep();
  }

  // --- Found --------------------------------------------------------------------------------
  function caught() {
    stage = 'found';
    found = 0;
    catches += 1;
    hud.prompt(null);
    hud.hint(null);
    audio.sting('white');
    flash.hidden = false;
    flash.className = 'found is-white';
  }

  // The tape rewinds: back to the chair, and lights out again.
  function again() {
    flash.hidden = true;
    flash.className = 'found';
    audio.setTape({ rewind: 0 });
    slit.hidden = true;
    hidden = null;
    moving = null;
    seat.snap();
    cut();
    begin();
  }

  // --- The start, and the end -------------------------------------------------------------
  // Lights out, and it is at the desk.
  function begin() {
    stage = 'desk';
    clock = 0;
    stood = null;
    index = 0;
    detour = null;
    chasing = null;
    seenFor = 0;
    unseen = 0;
    lastSeen = null;
    outside = 0;
    beat = 0.4;
    said.clear();
    for (const step of ROUTE) {
      delete step.from;
      step.began = false;
    }
    nextStep();
    pos = { x: DESK.at[0], z: DESK.at[1] };
    facing = DESK.facing;
    headYaw = 0;
    him.pose('bend');
    him.root.visible = true;
    him.lamp.material.color.set(0xffffff);
    beam.intensity = LAMP.bright;
    place();
  }

  // Called once, when the last tape has burnt out.
  function start() {
    catches = 0;
    apartment.power(false);
    audio.setPower(false);
    audio.act('powerDown');
    audio.act('torch');
    audio.setTension(1, 1);
    takeShadows(true);
    hud.task('Hide');
    begin();
  }

  function finish() {
    stage = 'over';
    found = 0;
    audio.act('torch');
    beam.intensity = 0;
    him.lamp.material.color.set(0x1c1c1c);
    glare.visible = false;
    him.root.visible = false; // without its light, there is nothing to see
    hud.task(null, { ticked: true });
    hud.hint(null);
    audio.setTension(0.35, 3);
  }

  // Put the figure, its head and its light where they have got to.
  function place() {
    him.root.position.set(pos.x, 0, pos.z);
    him.root.rotation.y = facing;
    him.head.rotation.y = headYaw;
    him.root.updateWorldMatrix(true, true);
    him.lamp.getWorldPosition(lampAt);
    him.head.getWorldDirection(lampWay); // the head's own +z: the way it is looking
    beam.position.copy(lampAt);
    beam.target.position.copy(lampAt).addScaledVector(lampWay, 4);
    beam.target.position.y -= 0.35; // a head torch points a little down
    // The glare is only there from in front, and biggest head on.
    toHim.copy(camera.position).sub(lampAt).normalize();
    const headOn = Math.max(0, toHim.dot(lampWay));
    glare.visible = headOn > 0.05;
    const size = 0.2 + 0.85 * headOn ** 3; // head and shoulders, no more: the shape of a man has to show round it
    glare.scale.set(size, size, 1);
  }

  // --- Every frame ---------------------------------------------------------------------------
  function update(dt) {
    if (stage === 'off') return;
    clock += dt;

    // Getting into a wardrobe, or out of it.
    if (moving) {
      moving.time += dt;
      const k = smooth(Math.min(1, moving.time / TIMES.hide));
      const { from, to } = moving;
      const mix = (a, b) => a + (b - a) * k;
      camera.position.set(mix(from.x, to.x), mix(from.y, to.y), mix(from.z, to.z));
      camera.rotation.set(mix(from.pitch, to.pitch), mix(from.yaw, to.yaw), 0);
      if (k === 1) {
        const then = moving.then;
        moving = null;
        then();
      }
    } else if (hidden) {
      // In the wardrobe: he can turn his head a little, and no more.
      const s = player.state;
      s.yaw = clamp(s.yaw, hidden.yaw - 0.75, hidden.yaw + 0.75);
      s.pitch = clamp(s.pitch, -0.3, 0.3);
      const breath = Math.sin(clock * 1.9) * 0.004;
      camera.position.set(hidden.eye[0], hidden.eye[1] + breath, hidden.eye[2]);
      camera.rotation.set(s.pitch, s.yaw, 0);
    }

    if (stage === 'found') {
      found += dt;
      if (found >= TIMES.white) {
        stage = 'rewind';
        found = 0;
        flash.className = 'found is-rewind';
        him.root.visible = false;
        beam.intensity = 0;
        audio.setTape({ rewind: 1 });
        audio.tape('jump');
      }
      return;
    }
    if (stage === 'rewind') {
      found += dt;
      if (found >= TIMES.rewind) again();
      return;
    }
    if (stage === 'over') {
      found += dt;
      if (found >= TIMES.over) {
        if (hidden) stepOut(); // out of the wardrobe first
        if (!moving) {
          stage = 'off';
          takeShadows(false);
          onDone();
        }
      }
      return;
    }

    const seated = seat.isSeated() || seat.isMoving();
    if (stage === 'desk') {
      // Bent over the dead screen. It stays there until he has had time to
      // get out behind it, or has sat there too long.
      if (!seated && stood === null) stood = 0;
      if (stood !== null) stood += dt;
      if ((stood !== null && stood >= TIMES.grace) || clock >= TIMES.patience) {
        stage = 'search';
        nextStep();
      }
      // The light trembles a little on the screen: it is breathing.
      headYaw = Math.sin(clock * 0.9) * 0.05;
    } else {
      // The search, or a chase.
      const list = detour || ROUTE;
      const at = detour ? 0 : index;
      if (act(list[at], dt, detour ? SPEED.chase : SPEED.search)) {
        nextStep();
        if (detour) {
          detour.shift();
          if (!detour.length) {
            // Lost him. Back to the search, from the last place it can be picked up.
            detour = null;
            chasing = null;
            stage = 'search';
            while (index > 0 && !ROUTE[index].station) index -= 1;
          }
        } else {
          index += 1;
          if (index >= ROUTE.length) {
            place();
            finish();
            return;
          }
        }
      }
    }
    place();
    renderer.shadowMap.needsUpdate = true; // its shadows move with it

    // What it sees.
    if (stage === 'search' || stage === 'chase') {
      const distance = inLight();
      if (distance > 0) {
        seenFor += dt;
        unseen = 0;
        lastSeen = [camera.position.x, camera.position.z];
        if (distance < SEES.near || seenFor >= SEES.hold) return caught();
        const door = DOORS.find((d) => d.inside(lastSeen[0], lastSeen[1]));
        if (seenFor >= SEES.spot && chasing !== (door ? door.name : 'corridor')) giveChase();
        if (stage === 'chase') {
          // Its head turns to keep the light on him.
          const way = Math.atan2(camera.position.x - pos.x, camera.position.z - pos.z);
          headYaw = clamp(turnBy(facing, way), -1.3, 1.3);
        }
      } else {
        seenFor = Math.max(0, seenFor - dt * 2);
        unseen += dt;
      }
      // Walked into, whichever way it is facing. Not while it is still
      // turning from the desk: he was sat that close to begin with.
      if (!hidden && (detour || index > 0) && away() < SEES.touch) return caught();
    }

    // His heart: faster and harder the nearer it is.
    const distance = away();
    beat -= dt;
    if (beat <= 0) {
      audio.beat(clamp(1.25 - distance * 0.13, 0.25, 1));
      beat = clamp(0.4 + distance * 0.1, 0.48, 1.4) * (stage === 'chase' ? 0.75 : 1);
    }

    // Words for a player who is not sure what to do. Sooner, once found.
    const quick = catches > 0;
    const inStudy = camera.position.x < 4.2 && camera.position.z < 3.4;
    outside = !inStudy && !hidden && !moving ? outside + dt : 0;
    if (hidden || moving) hud.hint(null);
    else if (seated) hud.hint(clock > (quick ? 1 : 3.5) ? 'Press Q to stand up.' : null);
    else if (inStudy && stage === 'desk') hud.hint(stood > (quick ? 0.2 : 2) ? 'Get out of the room, behind its back.' : null);
    else if (outside > (quick ? 1.5 : 6)) hud.hint('Hide. There is a wardrobe in the spare room, across the corridor.');
    else hud.hint(null);
    hud.keys(hidden ? [['E', 'Step out']] : seated ? [['Q', 'Stand up']] : null);
  }

  // Who has the controls: 'hide' (in a wardrobe, or getting into one: look,
  // but no walking), 'frozen' (found), or nothing (the hunt has no say).
  function hands() {
    if (stage === 'found' || stage === 'rewind') return 'frozen';
    if (hidden || moving) return 'hide';
    return null;
  }

  // A key. Answers true if it was the hunt's.
  function keyDown(code) {
    if (stage === 'found' || stage === 'rewind') return true;
    if (moving) return true;
    if (hidden) {
      if (code === 'KeyE' || code === 'KeyQ') stepOut();
      return true;
    }
    return false;
  }

  function reset() {
    stage = 'off';
    hidden = null;
    moving = null;
    detour = null;
    catches = 0;
    slit.hidden = true;
    flash.hidden = true;
    flash.className = 'found';
    him.root.visible = false;
    beam.intensity = 0;
    takeShadows(false);
    apartment.power(true);
    audio.setPower(true);
  }

  return {
    start,
    update,
    hands,
    keyDown,
    reset,
    isOn: () => stage !== 'off',
    // For tests.
    spots: SPOTS,
    state: () => ({
      stage,
      step: detour ? 'chase' : index,
      of: ROUTE.length,
      at: [+pos.x.toFixed(2), +pos.z.toFixed(2)],
      facing: +facing.toFixed(2),
      hidden: hidden ? hidden.name : null,
      moving: !!moving,
      seenFor: +seenFor.toFixed(2),
      catches,
      chasing,
      away: +away().toFixed(2),
      beam: beam.intensity,
      slit: !slit.hidden,
      flash: flash.hidden ? null : flash.className,
    }),
  };
}
