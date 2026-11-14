// The second part of the game, in order: STORY.md, Part 2, "The job".
//
//   1. The phone. The unknown number, and three files (src/phone.js).
//   2. "Sit down at the PC". The editing program is on the monitor.
//   3. "Find the frame where it goes wrong", for each clip (src/editor.js,
//      src/clips.js). Each mark is answered by a message across the top of
//      the screen, and the next clip is loaded.
//   4. After clip 2, the tape jumps on to 3:07 and its door is hammered on;
//      then his own front door is hammered on, for real (src/door.js).
//      Only after he has looked through the peephole does the answer come.
//   5. After clip 3, the real chai has boiled over and the gas hisses; then
//      a fourth file: the study, live. Nothing to mark: scrubbing back
//      brings Hamza nearer, until the tape goes all the way back to the
//      night and Saad asleep at his desk. Then it tears back to tonight, a
//      torch comes on, and the picture burns out. That is the end of Part 2.
//
// Under all of it a drone rises (TENSION), and there are small frights on
// the way: the landline rings after clip 1, a figure is standing on one
// pass of each tape, a face comes to the peephole, the pan boils over out
// loud. STORY.md, "The scares, and what each one is", says what each
// really is.
//
// All four clips are built. This file only says what comes after
// what. The pieces are in the files named above, and src/seat.js (sitting
// at the desk) and src/footage.js (drawing the tapes).
import { createPhone } from './phone.js';
import { createSeat } from './seat.js';
import { createFootage } from './footage.js';
import { createEditor } from './editor.js';
import { createDoor } from './door.js';
import { CLIPS } from './clips.js';

// The words on the task line.
const TASKS = {
  sit: 'Sit down at the PC',
  clip: 'Find the frame where it goes wrong',
  door: 'Someone is at the front door',
};
const REPLY_AFTER = 1.8; // seconds after a frame is marked before the answer comes in
const NEXT_MESSAGE = 6.5; // seconds between messages, when the answer is more than one: time to read each
const BANNER = 9; // seconds a message stays across the top of the screen
const HAMMER_AFTER = 1.2; // seconds after the second tape runs out before the real door is hammered on
const REPLY_AFTER_PEEPHOLE = 1.6; // seconds after looking through the peephole before the answer comes in
const FILE_AFTER = 2.5; // seconds after "One more file" before the fourth file arrives
const BODY = 4.5; // seconds on the night itself, and Saad asleep, before the tape tears back to tonight
const SEEN_AFTER = 1.1; // seconds after the picture burns out before "I can see you."
const LINGER = 5; // seconds after that before the game moves on
const THREAD_AFTER = 1.4; // seconds after the phone buzzes before it is in his hand
// How far up the drone is (0 to 1) at each point of the night.
const TENSION = {
  phone: 0.12, // the unknown number
  clip: [0.2, 0.3, 0.48, 0.64], // each tape, as it is loaded
  door: 0.62, // the front door being hammered on
  boil: 0.56, // the pan boiling over
  step: 0.055, // more, for every step back on the live tape
  body: 0.95, // the night itself
};
// The landline, after the first tape: where it is, how long after the next
// file arrives it starts, how many times it rings, and how far apart.
const LANDLINE = { at: [4.73, 0.23], after: 6, rings: 3, every: 2.7 };

// The keys along the bottom of the screen while sat at the desk.
const AT_SCREEN = [['Space', 'Play / pause'], ['A  D', 'Scrub'], ['E', 'Mark this frame'], ['Q', 'Stand up']];
const LOOKING_AWAY = [['Q', 'Stand up']];

export function createJob({ renderer, scene, camera, apartment, player, settings, interact, hud, audio, cut, onFlameOut, onDone }) {
  let stage = 'waiting'; // 'waiting' for the chores, 'phone', 'sit', 'edit', 'after' a clip is marked, 'door'
  let clipIndex = 0; // the clip the player is on
  const timers = []; // things that happen after a wait, on the game's clock

  const phone = createPhone({ camera, audio, hud, onDone: phoneDone });
  const seat = createSeat({ camera, player, settings });
  const footage = createFootage({ renderer, scene, apartment });
  const editor = createEditor({ scene, footage, audio, hud, onMarked: marked, onTapeEnd: tapeEnded, onAllTheWayBack: allTheWayBack, onDeeper: deeper, onFigure: figure, onBurnt: burnt });
  const door = createDoor({ apartment, scene, camera, player, settings, interact, audio, cut, onLooked: looked });

  // Do something after a wait. Paused, the wait stops too.
  const later = (seconds, then) => timers.push({ left: seconds, then });

  // --- 1. The phone ------------------------------------------------------------------
  function start() {
    stage = 'phone';
    audio.setTension(TENSION.phone, 6);
    phone.open();
  }

  // The files are in and the phone is back in his pocket.
  function phoneDone() {
    stage = 'sit';
    hud.task(TASKS.sit);
    audio.setTension(TENSION.clip[0], 6);
    editor.load(0); // the program opens on the monitor, with the first clip
  }

  // --- 2. Sitting down -------------------------------------------------------------------
  // Look at the chair, or the screen, and press E.
  const canSit = () => stage !== 'waiting' && stage !== 'phone' && editor.isOn() && !seat.isSeated() && !seat.isMoving();
  interact.add({ at: [2.5, 0.75, 1.25], look: 0.4, prompt: () => (canSit() ? 'Sit down' : null), use: sit });
  interact.add({ at: [2.5, 1.05, 0.26], look: 0.36, reach: 2.2, prompt: () => (canSit() ? 'Sit down' : null), use: sit });

  function sit() {
    hud.prompt(null);
    seat.sitDown(() => {
      if (stage === 'sit') {
        stage = 'edit';
        hud.task(TASKS.clip, { ticked: true });
      }
    });
  }

  // --- 3. The clips -----------------------------------------------------------------------
  function marked(index, clip) {
    stage = 'after';
    hud.task(null, { ticked: true });
    // The kitchen tape: the flame died at 01:10, and in the real kitchen
    // the chai has just boiled over too, loud enough to hear from the
    // study. From now on the gas hisses.
    if (clip.hiss) {
      onFlameOut();
      audio.act('boilOver');
      audio.setTension(TENSION.boil, 1);
    }
    // A tape that jumps on by itself is answered later, after the door.
    if (!clip.jumpsOn) later(REPLY_AFTER, () => answer(index, clip));
  }

  // The unknown number answers a mark, a message at a time. Then the next clip.
  function answer(index, clip) {
    clip.reply.forEach((words, i) => later(i * NEXT_MESSAGE, () => {
      audio.message('pocket');
      hud.banner('Unknown number', words, BANNER);
    }));
    const more = clip.reply.length > 1 ? FILE_AFTER : 0; // a file that was not expected comes a moment after
    later((clip.reply.length - 1) * NEXT_MESSAGE + more, () => nextClip(index));
  }

  function nextClip(index) {
    const next = index + 1;
    if (next < CLIPS.length) {
      clipIndex = next;
      if (next >= 3) audio.message('files'); // "One more file": it arrives
      audio.setTension(TENSION.clip[next], 5);
      // After the first tape, the landline rings in the corridor behind him.
      // Nobody has that number. (Hamza, a year ago, outside the door.)
      if (next === 1) for (let i = 0; i < LANDLINE.rings; i++) later(LANDLINE.after + i * LANDLINE.every, () => audio.ring(...LANDLINE.at));
      editor.load(next);
      if (seat.isSeated()) {
        stage = 'edit';
        hud.task(TASKS.clip);
      } else {
        stage = 'sit';
        hud.task(TASKS.sit);
      }
      return;
    }
    // The last tape is not marked, so nothing should come here. Should a
    // tape be added after it, it loads above by itself.
    stage = 'done';
    onDone();
  }

  // A step further back. On the live tape every one brings him nearer:
  // a short rush of sound, cut dead, and the drone a little higher.
  function deeper(index, clip, depth) {
    if (!clip.live) return;
    audio.riser(0.9, 0.16 + 0.07 * depth);
    audio.setTension(TENSION.clip[index] + TENSION.step * depth, 1);
  }

  // Somebody is standing in the picture, on one of the first three tapes.
  function figure() {
    audio.sting('cold');
  }

  // The last tape has gone all the way back: the night, 3:07, and Saad
  // asleep at his desk. The player looks at it for a moment. Then it tears
  // back to tonight, where a torch comes on, and the picture burns out.
  function allTheWayBack() {
    audio.setTension(TENSION.body, 2);
    later(BODY, () => {
      audio.riser(2.0, 0.9);
      editor.burnOut();
    });
  }

  // The screen is dead. "I can see you." Then Part 3.
  function burnt() {
    audio.sting('hit');
    cut();
    later(SEEN_AFTER, () => {
      audio.message('pocket');
      hud.banner('Unknown number', 'I can see you.', BANNER);
    });
    later(SEEN_AFTER + LINGER, () => {
      // Part 2 is over. Part 3 begins: the phone lights up, and the thread
      // scrolls up through a year of messages to the night itself and the
      // name. Once it is put away, the rest of the ending is src/ending.js.
      stage = 'thread';
      audio.setTension(0.3, 4);
      audio.message('pocket');
      later(THREAD_AFTER, () => phone.openThread(() => {
        stage = 'done';
        audio.setTension(0, 3);
        onDone();
      }));
    });
  }

  // --- 4. The door -------------------------------------------------------------------------
  // The second tape has run out, after its hammering. Now his own door.
  function tapeEnded() {
    later(HAMMER_AFTER, () => {
      stage = 'door';
      hud.task(TASKS.door);
      audio.setTension(TENSION.door, 0.5);
      door.start();
    });
  }

  // He has looked through the peephole: nobody. Then the answer comes.
  function looked() {
    hud.task(null, { ticked: true });
    later(REPLY_AFTER_PEEPHOLE, () => answer(clipIndex, CLIPS[clipIndex]));
  }

  // --- Every frame ----------------------------------------------------------------------
  // Who has the controls: 'walk', 'phone' (the phone is up: look, but no
  // walking), 'seat' (sat at the desk) or 'door' (an eye to the peephole).
  function hands() {
    if (phone.isUp() && !seat.isSeated() && !seat.isMoving()) return 'phone';
    if (door.isLooking()) return 'door';
    if (seat.isSeated() || seat.isMoving()) return 'seat';
    return 'walk';
  }

  function update(dt) {
    for (const timer of [...timers]) {
      timer.left -= dt;
      if (timer.left <= 0) {
        timers.splice(timers.indexOf(timer), 1);
        timer.then();
      }
    }
    phone.update(dt);
    seat.update(dt);
    door.update(dt, seat.isSeated() || seat.isMoving());
    const working = seat.isSeated() && seat.atScreen() && !phone.isUp();
    editor.setActive(working);
    if (editor.isOn()) editor.update(dt);
    hud.keys(seat.isSeated() && !phone.isUp() ? (working && stage === 'edit' ? AT_SCREEN : LOOKING_AWAY) : null);

    // While the door is hammered on, a word for a player who stays put.
    if (door.isHammering()) {
      if (seat.isSeated() && door.hammeredFor() > 5) hud.hint('Press Q to stand up.');
      else if (!seat.isSeated() && door.hammeredFor() > 14) hud.hint('The front door is at the end of the corridor.');
      else hud.hint(null);
    } else if (stage === 'door') hud.hint(null);
  }

  // Draw the tape into its picture, if anyone can see the monitor: that is,
  // if the player is in the study.
  function film() {
    const at = camera.position;
    if (editor.isOn() && at.x < 4.2 && at.z < 3.4) editor.film();
  }

  // --- Keys ------------------------------------------------------------------------------
  // Answers true if the key was for the phone, the desk or the peephole.
  function keyDown(code) {
    const where = hands();
    if (phone.isUp()) {
      // The phone in his hand, sat down or not: E is for the phone.
      if (code === 'KeyE') phone.use();
      return code === 'KeyE' || code === 'Space' || where === 'seat';
    }
    if (where === 'door') return true;
    if (where === 'seat') {
      if (seat.isMoving()) return true;
      if (code === 'KeyQ') {
        editor.setActive(false);
        seat.standUp();
        return true;
      }
      if (seat.atScreen() && editor.press(code)) return true;
      return code === 'KeyE' || code === 'Space';
    }
    return false;
  }
  const keyUp = (code) => editor.release(code);

  // A click: the same as E.
  function click() {
    return keyDown('KeyE');
  }

  function reset() {
    stage = 'waiting';
    clipIndex = 0;
    timers.length = 0;
    phone.reset();
    seat.reset();
    editor.reset();
    door.reset();
    hud.keys(null);
  }

  return {
    start,
    update,
    film,
    keyDown,
    keyUp,
    click,
    hands,
    reset,
    // For tests.
    parts: { phone, seat, footage, editor, door },
    state: () => ({ stage, clip: clipIndex, timers: timers.length, hands: hands(), phone: phone.state(), seat: seat.state(), editor: editor.state(), door: door.state() }),
  };
}
