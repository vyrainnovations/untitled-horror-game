// The second part of the game, in order: STORY.md, Part 2, "The job".
//
//   1. The phone. The unknown number, and three files (src/phone.js).
//   2. "Sit down at the PC". The editing program is on the monitor.
//   3. "Find the frame where it goes wrong", for each clip (src/editor.js,
//      src/clips.js). So far only the first clip is built.
//
// This file only says what comes after what. The pieces are in the files
// named above, and src/seat.js (sitting at the desk) and src/footage.js
// (drawing the tapes).
import { createPhone } from './phone.js';
import { createSeat } from './seat.js';
import { createFootage } from './footage.js';
import { createEditor } from './editor.js';

// The words on the task line.
const TASKS = {
  sit: 'Sit down at the PC',
  clip: 'Find the frame where it goes wrong',
};
const REPLY_AFTER = 1.8; // seconds after a frame is marked before the answer comes in

// The keys along the bottom of the screen while sat at the desk.
const AT_SCREEN = [['Space', 'Play / pause'], ['A  D', 'Scrub'], ['E', 'Mark this frame'], ['Q', 'Stand up']];
const LOOKING_AWAY = [['Q', 'Stand up']];

export function createJob({ renderer, scene, camera, apartment, player, settings, interact, hud, audio, onDone }) {
  let stage = 'waiting'; // 'waiting' for the chores, 'phone', 'sit', 'edit', then 'after' a clip is marked
  let replyIn = 0; // seconds until the unknown number answers a mark
  let replyFor = null; // the clip it is answering

  const phone = createPhone({ camera, audio, hud, onDone: phoneDone });
  const seat = createSeat({ camera, player, settings });
  const footage = createFootage({ renderer, scene, apartment });
  const editor = createEditor({ scene, footage, audio, hud, onMarked: marked });

  // --- 1. The phone ------------------------------------------------------------------
  function start() {
    stage = 'phone';
    phone.open();
  }

  // The files are in and the phone is back in his pocket.
  function phoneDone() {
    stage = 'sit';
    hud.task(TASKS.sit);
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
    replyIn = REPLY_AFTER;
    replyFor = clip;
    hud.task(null, { ticked: true });
  }

  // --- Every frame ----------------------------------------------------------------------
  // Who has the controls: 'walk', 'phone' (the phone is up: look, but no
  // walking) or 'seat' (sat at the desk).
  function hands() {
    if (phone.isUp()) return 'phone';
    if (seat.isSeated() || seat.isMoving()) return 'seat';
    return 'walk';
  }

  function update(dt) {
    phone.update(dt);
    seat.update(dt);
    const working = seat.isSeated() && seat.atScreen();
    editor.setActive(working);
    if (editor.isOn()) editor.update(dt);
    hud.keys(seat.isSeated() ? (working && stage === 'edit' ? AT_SCREEN : LOOKING_AWAY) : null);

    if (replyFor) {
      replyIn -= dt;
      if (replyIn <= 0) {
        const clip = replyFor;
        replyFor = null;
        audio.message('pocket');
        hud.banner('Unknown number', clip.reply);
        // --- THE NEXT PART OF THE GAME STARTS HERE -------------------------
        // Clip 1 is marked and answered. Clip 2, the front door (STORY.md,
        // Part 2, beat 9), is not built yet: when it is, load it here with
        // editor.load(1) instead of handing on.
        onDone();
      }
    }
  }

  // Draw the tape into its picture, if anyone can see the monitor: that is,
  // if the player is in the study.
  function film() {
    const at = camera.position;
    if (editor.isOn() && at.x < 4.2 && at.z < 3.4) editor.film();
  }

  // --- Keys ------------------------------------------------------------------------------
  // Answers true if the key was for the phone or the desk.
  function keyDown(code) {
    const where = hands();
    if (where === 'phone') {
      if (code === 'KeyE') phone.use();
      return code === 'KeyE';
    }
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
    replyFor = null;
    phone.reset();
    seat.reset();
    editor.reset();
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
    parts: { phone, seat, footage, editor },
    state: () => ({ stage, hands: hands(), phone: phone.state(), seat: seat.state(), editor: editor.state() }),
  };
}
