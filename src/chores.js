// The chores that open the game: STORY.md, Part 1, "An ordinary night".
// They teach the controls and make the flat feel safe.
//
// HOW TO CHANGE THINGS
//   The words on the screen, the order of the steps and the hints are in
//   STEPS, just below. The lengths of the little movements are in TIMES.
//   What each step actually does is further down, under ACTIONS.
//
// Everything here runs on the game's own clock, so it stops while the game
// is paused, and reset() puts every object back where it started.
import * as THREE from 'three';

// --- The steps, in order ------------------------------------------------------
// Each line is one thing the player has to do.
//   task    the line at the top left of the screen. Steps that share the
//           same words keep the same line up.
//   prompt  what the prompt says when the player looks at the thing.
//   thing   the thing that has to be used (see THINGS, further down).
//   does    what happens when it is used (see ACTIONS, further down).
//   wait    instead of a thing to use: just wait this many seconds.
//   ticks   false if the line should give way to the next one without being
//           ticked off, because the job was not finished.
//   buzzing true while the phone should be buzzing.
//   hints   [seconds, words]: if the player has still not managed the step
//           after that many seconds, these words appear under the task
//           line. [seconds, null] takes the words away again.
// The order can be changed, with one catch: the bag has to be picked up
// before it can be put out. But read STORY.md first: the order, and the
// chai that is never finished, are what the ending is made of.
const STEPS = [
  {
    task: 'Take out the rubbish',
    prompt: 'Pick up the rubbish',
    thing: 'bag',
    does: 'pickUpBag',
    hints: [[2, 'W A S D to walk. Mouse to look.'], [14, null], [30, 'The bag is by the bin, in the kitchen.']],
  },
  {
    task: 'Take out the rubbish',
    prompt: 'Put the rubbish out',
    thing: 'frontDoor',
    does: 'putBagOut',
    hints: [[20, 'Take it to the front door, at the end of the corridor.']],
  },
  {
    task: 'Lock up',
    prompt: 'Slide the bolt',
    thing: 'bolt',
    does: 'slideBolt',
    hints: [[15, 'The bolt is near the top of the front door.']],
  },
  {
    task: 'Make chai',
    prompt: 'Light the ring',
    thing: 'hob',
    does: 'lightRing',
    ticks: false, // lighting the ring is not the chai made
    hints: [[22, 'The pan is on the hob, in the kitchen.']],
  },
  {
    // Nothing to do but wait. It never boils: the phone gets in first, and
    // the player walks away from a lit ring. STORY.md is built on that, so
    // this line must never be ticked off.
    task: 'Wait for it to boil',
    wait: 5,
    ticks: false,
  },
  {
    task: 'Your phone is buzzing in the study',
    prompt: 'Pick up the phone',
    thing: 'phone',
    does: 'pickUpPhone',
    buzzing: true,
    hints: [[25, 'It is on the desk, to the right of the screen.']],
  },
];

// --- How long things take, in seconds -----------------------------------------
const TIMES = {
  pickUp: 0.28, // the bag coming up into the hand
  doorOpens: 0.5, // the front door swinging open
  bagGoesOut: 0.55, // the bag going out through the gap
  doorHolds: 0.3, // the door standing open afterwards
  doorShuts: 0.4, // the door swinging shut again
  boltSlides: 0.18, // the bolt going across
  ringCatches: 0.36, // the lighter ticking before the gas catches
  buzzEvery: 2.6, // the phone buzzes this often
  screenStaysLit: 1.3, // and its screen is lit for this long each time
};

const DOOR_OPEN = 0.7; // how far the front door opens: 0.7 is about 40 degrees, a wide crack
const BOLT_TRAVEL = 0.085; // how far the bolt slides, in metres: far enough for its end to go into the frame
const RING_LIGHT = 0.42; // how bright the lit gas ring is
const KNOB_ON = -1.4; // how far the gas knob turns to light the ring, in radians: about a quarter turn
// Where the carried bag is seen: right of centre and low, as if 62 cm in
// front of the eyes, so that only the top of it shows. [right, up, forward
// is negative]. These are for the usual field of view (64 degrees): the
// game widens or narrows them with the setting, so the bag sits in the
// same place on the screen whatever the player has chosen.
const HELD = [0.34, -0.47, -0.62];
const HELD_SIZE = 0.7; // carried smaller than life
const USUAL_VIEW = 64;
// In truth the bag is held only 20 cm from the eyes and shrunk to match.
// It looks the same, and it can never poke through a wall the player is
// standing against.
const NEAR = 0.2;
// The bag's way out: through the gap in the doorway, then down on the
// landing beside the door, out of sight. [x, y, z] on the plan.
const GAP = [4.63, 0.3, 12.03];
const LANDING = [4.3, 0, 12.42];

const smooth = (k) => k * k * (3 - 2 * k); // start gently, stop gently

export function createChores({ apartment, camera, player, interact, hud, audio, redrawShadows, onDone }) {
  const { things } = apartment;
  const bag = things.rubbishBag;
  const door = things.frontDoor;
  const bolt = things.bolt;
  const flame = things.ringFlame;
  const ringLight = apartment.lights.ring;
  const phone = things.phone;
  const phoneScreen = things.phoneScreen;
  const binBarrier = things.binBarrier;
  const knob = things.gasKnob;
  const spill = things.chaiSpill;

  // How things are at the start, so reset() can put them back.
  const home = {
    bagParent: bag.parent,
    bagPosition: bag.position.clone(),
    bagRotation: bag.rotation.clone(),
    barrierMinZ: binBarrier.minZ,
  };
  // With the bag gone, the barrier round the bin corner starts at the bin.
  const BARRIER_WITHOUT_BAG = 10.83;

  let index = -1; // which step the player is on. -1: the chores have not begun
  let stepTime = 0; // seconds spent on this step so far
  let busy = false; // true while something is in the middle of happening
  let holding = false; // true while the bag is in the player's hand
  let settled = false; // true once the bag has finished coming up into the hand
  let ringLit = false; // true once the gas ring is burning
  let sinceBuzz = 0; // seconds since the phone last buzzed
  const moves = []; // movements that are under way (see move())

  // --- Small helpers -----------------------------------------------------------

  // Move something smoothly. paint(k) is called every frame with k going
  // from 0 to 1 over `seconds`, after waiting `delay` first. then() is
  // called once it has finished.
  function move(seconds, paint, then, delay = 0) {
    moves.push({ time: -delay, seconds, paint, then });
  }
  const after = (seconds, then) => move(0, null, then, seconds);

  function setCastsShadow(object, on) {
    object.traverse((part) => {
      if (part.isMesh) part.castShadow = on;
    });
  }

  // Where and how the bag sits in the hand, measured from the camera.
  const scaleToNear = NEAR / -HELD[2];
  const heldTurn = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.6, -0.1));
  const heldPosition = new THREE.Vector3();
  let heldSize = 1;
  const spread = (degrees) => Math.tan((degrees * Math.PI) / 360);
  // Work the hold out again for the field of view the player has chosen.
  // Answers how much wider (or narrower) than usual the view is.
  function findHold() {
    const wider = spread(camera.fov) / spread(USUAL_VIEW);
    heldPosition.set(HELD[0] * wider, HELD[1] * wider, HELD[2]).multiplyScalar(scaleToNear);
    heldSize = HELD_SIZE * wider * scaleToNear;
    return wider;
  }

  // --- ACTIONS: what each step does ----------------------------------------------
  // can() says whether the prompt should show at all just now.
  const ACTIONS = {
    // The bag comes up off the floor into the hand, and is carried from now on.
    pickUpBag: {
      run() {
        audio.act('bag');
        holding = true;
        settled = false;
        camera.attach(bag); // from now on it moves with the camera
        const fromPosition = bag.position.clone();
        const fromTurn = bag.quaternion.clone();
        findHold();
        move(TIMES.pickUp, (k) => {
          bag.position.lerpVectors(fromPosition, heldPosition, k);
          bag.quaternion.slerpQuaternions(fromTurn, heldTurn, k);
          bag.scale.setScalar(1 + (heldSize - 1) * k);
        }, () => { settled = true; });
        // It has left the floor: no shadow there any more, and the way past
        // the bin is as wide as the bin, not the bag.
        setCastsShadow(bag, false);
        redrawShadows();
        binBarrier.minZ = BARRIER_WITHOUT_BAG;
        next();
      },
    },

    // The front door opens a crack, the bag goes out onto the dark landing,
    // and the door shuts again.
    putBagOut: {
      can: () => holding && settled,
      run() {
        busy = true;
        audio.act('doorOpen');
        move(TIMES.doorOpens, (k) => { door.rotation.y = DOOR_OPEN * k; });
        after(TIMES.doorOpens * 0.55, () => {
          // Let go. The bag leaves the camera and becomes its real size
          // again, at the spot where it appeared to be.
          holding = false;
          const wider = findHold();
          const seenSize = HELD_SIZE * wider;
          camera.updateWorldMatrix(true, false);
          const from = camera.localToWorld(new THREE.Vector3(HELD[0] * wider, HELD[1] * wider, HELD[2]));
          home.bagParent.attach(bag);
          home.bagParent.worldToLocal(from);
          const gap = new THREE.Vector3(...GAP);
          const landing = new THREE.Vector3(...LANDING);
          move(TIMES.bagGoesOut, (k) => {
            // A curve from the hand, through the gap, down to the landing.
            const a = (1 - k) * (1 - k);
            const b = 2 * (1 - k) * k;
            const c = k * k;
            bag.position.set(a * from.x + b * gap.x + c * landing.x, a * from.y + b * gap.y + c * landing.y, a * from.z + b * gap.z + c * landing.z);
            bag.scale.setScalar(seenSize + (1 - seenSize) * k);
          }, () => {
            audio.act('bagDown');
            after(TIMES.doorHolds, () => {
              move(TIMES.doorShuts, (k) => { door.rotation.y = DOOR_OPEN * (1 - k); }, () => {
                audio.act('doorShut');
                bag.visible = false; // it is out on the landing, behind the wall
                busy = false;
                next();
              });
            });
          });
        });
      },
    },

    // The bolt on the front door slides across, into the frame.
    slideBolt: {
      run() {
        busy = true;
        audio.act('bolt');
        move(TIMES.boltSlides, (k) => { bolt.position.x = -BOLT_TRAVEL * k; }, () => {
          busy = false;
          next();
        });
      },
    },

    // The ring under the pan of chai: the lighter ticks, the gas catches,
    // and it burns from then on. Nothing in this file ever puts it out.
    lightRing: {
      run() {
        busy = true;
        audio.act('ignite');
        move(TIMES.ringCatches * 0.6, (k) => { knob.rotation.z = KNOB_ON * k; });
        after(TIMES.ringCatches, () => {
          ringLit = true;
          flame.visible = true;
          audio.setRing(true);
          busy = false;
          next();
        });
      },
    },

    // The phone comes up off the desk and stops buzzing.
    pickUpPhone: {
      run() {
        audio.act('phoneUp');
        phone.visible = false; // it is in his hand now
        next();
      },
    },
  };

  // --- THINGS: where each usable thing is ----------------------------------------
  // at is the spot the player has to look at, [x, y, z]. look is how near
  // to that spot they have to be looking, in metres.
  const THINGS = {
    bag: { at: [home.bagPosition.x, 0.22, home.bagPosition.z], look: 0.34 },
    frontDoor: { at: [door.position.x - 0.4, 1.25, door.position.z - 0.02], look: 0.6 },
    bolt: { at: [door.position.x - 0.66, 1.87, door.position.z - 0.05], look: 0.26 },
    hob: { at: [flame.position.x, 1.0, flame.position.z - 0.03], look: 0.32 },
    phone: { at: [phone.position.x, phone.position.y + 0.02, phone.position.z], look: 0.26 },
  };
  const phoneAt = [phone.position.x, phone.position.z]; // where the buzzing comes from

  for (const name of Object.keys(THINGS)) {
    interact.add({
      at: THINGS[name].at,
      look: THINGS[name].look,
      // The prompt only shows for the thing the current step is about.
      prompt() {
        const step = STEPS[index];
        if (!step || busy || step.thing !== name) return null;
        const action = ACTIONS[step.does];
        return !action.can || action.can() ? step.prompt : null;
      },
      use: () => ACTIONS[STEPS[index].does].run(),
    });
  }

  // --- Moving from step to step ----------------------------------------------------

  function goTo(i) {
    const old = STEPS[index];
    const step = STEPS[i];
    index = i;
    stepTime = 0;
    sinceBuzz = TIMES.buzzEvery; // a step with the phone buzzing starts with a buzz
    phoneScreen.visible = false;
    hud.hint(null);
    if (!step) {
      // That was the last step.
      hud.task(null, { ticked: !old || old.ticks !== false });
      onDone();
      return;
    }
    if (!old) hud.task(step.task);
    else if (old.task !== step.task) hud.task(step.task, { ticked: old.ticks !== false });
  }
  const next = () => goTo(index + 1);

  // Call every frame while the game is being played.
  function update(dt) {
    // Movements that are under way.
    for (const m of [...moves]) {
      m.time += dt;
      if (m.time < 0) continue;
      const k = m.seconds > 0 ? Math.min(1, m.time / m.seconds) : 1;
      if (m.paint) m.paint(smooth(k));
      if (k < 1) continue;
      moves.splice(moves.indexOf(m), 1);
      if (m.then) m.then();
    }

    // The bag swings a little in the hand as the player walks.
    if (holding && settled) {
      const stride = player.state.bob;
      findHold();
      bag.position.set(
        heldPosition.x + Math.sin(stride) * 0.01 * scaleToNear,
        heldPosition.y - Math.abs(Math.sin(stride)) * 0.014 * scaleToNear,
        heldPosition.z,
      );
      bag.scale.setScalar(heldSize);
    }

    // A lit ring never burns quite steadily.
    if (ringLit) {
      const flicker = Math.random();
      flame.scale.y = 0.8 + flicker * 0.45;
      ringLight.intensity = RING_LIGHT * (0.88 + flicker * 0.24);
    }

    const step = STEPS[index];
    if (!step) return;
    stepTime += dt;

    // A step that is only a wait.
    if (step.wait !== undefined) {
      if (stepTime >= step.wait) next();
      return;
    }

    // The phone: two buzzes, and its screen lights the desk for a moment.
    if (step.buzzing) {
      sinceBuzz += dt;
      if (sinceBuzz >= TIMES.buzzEvery) {
        sinceBuzz = 0;
        audio.buzz(phoneAt[0], phoneAt[1]);
      }
      phoneScreen.visible = sinceBuzz < TIMES.screenStaysLit;
    }

    // The hint for a player who is taking a long time.
    let words = null;
    for (const [seconds, text] of step.hints || []) if (stepTime >= seconds) words = text;
    hud.hint(busy ? null : words);
  }

  // Put everything back the way it was before the chores began.
  function reset() {
    moves.length = 0;
    index = -1;
    stepTime = 0;
    busy = false;
    holding = false;
    settled = false;
    home.bagParent.add(bag);
    bag.position.copy(home.bagPosition);
    bag.rotation.copy(home.bagRotation);
    bag.scale.setScalar(1);
    bag.visible = true;
    setCastsShadow(bag, true);
    binBarrier.minZ = home.barrierMinZ;
    door.rotation.y = 0;
    bolt.position.x = 0;
    ringLit = false;
    flame.visible = false;
    ringLight.intensity = 0;
    audio.setRing(false);
    knob.rotation.z = 0;
    spill.visible = false;
    audio.setGas(false);
    phone.visible = true;
    phoneScreen.visible = false;
    sinceBuzz = 0;
    hud.clear();
    redrawShadows();
  }

  // Begin from the first step.
  function start() {
    reset();
    goTo(0);
  }

  // Much later (the third tape, src/job.js): the chai the player left on
  // the ring boils over and puts the flame out. The knob is still turned
  // on, so from now on the gas hisses. Nobody sees it happen; it is there
  // to be found.
  function boilOver() {
    ringLit = false;
    flame.visible = false;
    ringLight.intensity = 0;
    audio.setRing(false);
    spill.visible = true;
    audio.setGas(true);
  }

  return {
    start,
    reset,
    boilOver,
    update,
    // For tests: where the chores have got to.
    state: () => ({ step: index, of: STEPS.length, does: STEPS[index] ? STEPS[index].does || 'wait' : null, busy, holding, ringLit, knob: +knob.rotation.z.toFixed(2), boiledOver: spill.visible, moves: moves.length }),
  };
}
