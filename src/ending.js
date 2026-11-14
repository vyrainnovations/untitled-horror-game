// The end of the game: STORY.md, Part 3, beats 16 to 18, after the thread.
//
//   16. "Turn off the gas". In the kitchen the flame is out, the chai has
//       boiled over, and the hiss is loud. Turn the knob. Silence. The clock
//       on the microwave changes to 3:08.
//   17. "Open the door". The corridor bulb has stopped flickering. Slide the
//       bolt back. The door opens. The landing light is on.
//   18. The last shot, on tape: the empty flat, 16 November 2027. The front
//       door stands open with light coming through it, and Hamza stands in
//       the corridor looking at it: a figure in a lit doorway, the picture on
//       the poster of their film. 3:07 turns to 3:08. STOP. The title. Credits.
//
// HOW TO CHANGE THINGS
//   The words on the task line are TASKS; how long each moment lasts is
//   TIMES. What the last shot shows is LAST_SHOT in src/clips.js.
import * as THREE from 'three';
import { TITLE, CREDITS } from './menu.js';
import { LAST_SHOT } from './clips.js';

const TASKS = {
  gas: 'Turn off the gas',
  door: 'Open the door',
};
const TIMES = {
  knob: 0.5, // the knob turning back
  hush: 3.5, // the flat holding its breath once the hiss stops
  clock: 1.4, // seconds after the knob before the microwave shows 3:08
  task: 2.6, // and before "Open the door"
  bolt: 0.35, // the bolt sliding back
  opens: 3.4, // the door swinging open
  light: 2.4, // looking at the lit doorway before the tape
  shot: 9.5, // the last shot, before it stops
  turns: 8, // seconds into the shot when 3:07 turns to 3:08
  stopped: 1.8, // the stopped tape before the screen goes black
  black: 1.4, // black before the title
  title: 3.5, // the title alone
  back: 9, // the credits, before the title screen
};
const KNOB_OFF = 0; // the gas knob, straight up: off
const DOOR_WIDE = 1.5; // how far the front door swings open, in radians
const BOLT_TRAVEL = 0.085; // as in src/chores.js
const LANDING_LIGHT = 3.2; // how bright the landing light is

export function createEnding({ apartment, camera, footage, interact, hud, audio, cut, onFinished }) {
  const { things, lights } = apartment;
  const knob = things.gasKnob;
  const bolt = things.bolt;
  const door = things.frontDoor;

  let stage = 'waiting'; // 'waiting', 'gas', 'door', 'opening', 'shot', 'stopped', 'card'
  let shotTime = 0; // seconds into the last shot
  let clock = '3:07'; // what the microwave says
  let moves = []; // things turning or sliding: { seconds, time, paint, then }
  const timers = [];
  const later = (seconds, then) => timers.push({ left: seconds, then });
  const move = (seconds, paint, then) => moves.push({ seconds, time: 0, paint, then });
  const smooth = (k) => k * k * (3 - 2 * k);

  // --- The knob and the bolt -------------------------------------------------------
  interact.add({
    at: [knob.position.x, knob.position.y, knob.position.z - 0.01],
    look: 0.24,
    prompt: () => (stage === 'gas' ? 'Turn off the gas' : null),
    use: turnOff,
  });
  interact.add({
    at: [door.position.x - 0.66, 1.87, door.position.z - 0.05],
    look: 0.26,
    prompt: () => (stage === 'door' ? 'Slide the bolt back' : null),
    use: unbolt,
  });

  // --- The microwave's clock ---------------------------------------------------------
  function microwave(text) {
    clock = text;
    const picture = things.microwaveClock.material.map;
    const canvas = picture.image;
    const g = canvas.getContext('2d');
    g.fillStyle = '#050505';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.font = 'bold 11px Courier New';
    g.textAlign = 'center';
    g.fillStyle = '#3cff6a';
    g.fillText(text, canvas.width / 2, 10);
    picture.needsUpdate = true;
  }

  // --- 16. The gas ------------------------------------------------------------------
  // Called once the thread has been read and the phone put away.
  function start() {
    stage = 'gas';
    hud.task(TASKS.gas);
    audio.setGas(3); // the hiss is loud now
  }

  function turnOff() {
    stage = 'turning';
    hud.prompt(null);
    audio.act('knob');
    const from = knob.rotation.z;
    move(TIMES.knob, (k) => { knob.rotation.z = from + (KNOB_OFF - from) * k; });
    audio.setGas(false);
    audio.hush(TIMES.hush); // silence
    later(TIMES.clock, () => {
      microwave('3:08');
      audio.act('beep');
    });
    later(TIMES.task, () => {
      // --- 17. The door ---------------------------------------------------------
      stage = 'door';
      hud.task(TASKS.door, { ticked: true });
      apartment.steadyBulb(true); // the bulb has stopped flickering
    });
  }

  function unbolt() {
    stage = 'opening';
    hud.prompt(null);
    hud.task(null, { ticked: true });
    audio.act('bolt');
    move(TIMES.bolt, (k) => { bolt.position.x = -BOLT_TRAVEL * (1 - k); }, () => {
      later(0.5, () => {
        // The door opens, and the landing light is on.
        audio.act('doorWide');
        move(TIMES.opens, (k) => {
          door.rotation.y = DOOR_WIDE * k;
          lights.landing.intensity = LANDING_LIGHT * Math.min(1, k * 3);
          apartment.landingLight(Math.min(1, k * 3));
        }, () => later(TIMES.light, lastShot));
      });
    });
  }

  // --- 18. The last shot -----------------------------------------------------------
  // The tape fills the screen: a black sheet and the picture, hung just in
  // front of the eyes, in front of everything.
  const screen = new THREE.Group();
  const black = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x000000, fog: false, depthTest: false, depthWrite: false }));
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), footage.material);
  black.renderOrder = 1000;
  tape.renderOrder = 1001;
  tape.position.z = 0.001; // a hair in front of the black
  screen.add(black, tape);
  screen.visible = false;
  camera.add(screen);
  // Keep it filling the view, whatever its shape.
  function fit() {
    const near = 0.1;
    const tall = 2 * near * Math.tan((camera.fov * Math.PI) / 360);
    black.scale.set(tall * camera.aspect * 1.05, tall * 1.05, 1);
    tape.scale.set(tall * 4 / 3, tall, 1);
    screen.position.set(0, 0, -near);
  }

  function lastShot() {
    stage = 'shot';
    shotTime = 0;
    hud.clear();
    cut();
    screen.visible = true;
    audio.setTape({ motor: 1 });
  }

  const pad2 = (n) => String(Math.floor(n)).padStart(2, '0');
  function clockOnTape() {
    const total = 3 * 3600 + 7 * 60 + 60 - TIMES.turns + Math.min(shotTime, TIMES.shot);
    return `${pad2(total / 3600)}:${pad2((total / 60) % 60)}:${pad2(total % 60)}`;
  }

  // --- The title, and the credits ------------------------------------------------------
  const card = document.createElement('div');
  card.className = 'ending';
  card.hidden = true;
  const title = document.createElement('h1');
  title.className = 'ending__title';
  title.textContent = TITLE;
  const credits = document.createElement('div');
  credits.className = 'ending__credits';
  for (const line of CREDITS) {
    const p = document.createElement('p');
    p.textContent = line;
    credits.append(p);
  }
  card.append(title, credits);
  document.body.appendChild(card);

  function showCard() {
    stage = 'card';
    screen.visible = false;
    card.hidden = false;
    later(TIMES.black, () => title.classList.add('is-in'));
    later(TIMES.black + TIMES.title, () => credits.classList.add('is-in'));
    later(TIMES.black + TIMES.title + TIMES.back, finish);
  }

  function finish() {
    if (stage !== 'card') return;
    stage = 'done';
    onFinished();
  }

  // --- Every frame -------------------------------------------------------------------
  function update(dt) {
    for (const timer of [...timers]) {
      timer.left -= dt;
      if (timer.left <= 0) {
        timers.splice(timers.indexOf(timer), 1);
        timer.then();
      }
    }
    for (const m of [...moves]) {
      m.time += dt;
      const k = Math.min(1, m.time / m.seconds);
      m.paint(smooth(k));
      if (k < 1) continue;
      moves.splice(moves.indexOf(m), 1);
      if (m.then) m.then();
    }
    if (stage === 'shot') {
      shotTime += dt;
      if (shotTime >= TIMES.shot) {
        stage = 'stopped';
        audio.setTape({ motor: 0 });
        audio.tape('stop');
        later(TIMES.stopped, showCard);
      }
    }
    // The tape's picture and the writing on it are the ending's while it is
    // on screen. (The editing program, still running underneath, would
    // otherwise write its own over them.)
    if (stage === 'shot' || stage === 'stopped') {
      fit();
      footage.set({ time: stage === 'shot' ? shotTime : TIMES.shot, colour: LAST_SHOT.past[0].colour });
      footage.caption(stage === 'shot' ? 'PLAY' : 'STOP', LAST_SHOT.past[0].date, clockOnTape());
    }
  }

  // Draw the last shot into the tape's picture, while it is playing.
  function film() {
    if (stage === 'shot') footage.film(LAST_SHOT, shotTime, 0);
  }

  // Enter, or a click, on the credits goes back to the title screen.
  function keyDown(code) {
    if (stage === 'card' && credits.classList.contains('is-in') && (code === 'Enter' || code === 'Space' || code === 'KeyE')) {
      finish();
      return true;
    }
    return busy();
  }

  // True while the ending has the controls: the player can look, not walk.
  const busy = () => ['opening', 'shot', 'stopped', 'card'].includes(stage);

  function reset() {
    stage = 'waiting';
    timers.length = 0;
    moves = [];
    shotTime = 0;
    screen.visible = false;
    card.hidden = true;
    title.classList.remove('is-in');
    credits.classList.remove('is-in');
    apartment.landingLight(0);
    lights.landing.intensity = 0;
    apartment.steadyBulb(false);
    microwave('3:07');
  }

  return {
    start,
    update,
    film,
    keyDown,
    busy,
    reset,
    state: () => ({
      stage,
      shotTime: +shotTime.toFixed(2),
      door: +door.rotation.y.toFixed(2),
      bolt: +bolt.position.x.toFixed(3),
      knob: +knob.rotation.z.toFixed(2),
      microwave: clock,
      landing: +lights.landing.intensity.toFixed(2),
      tape: screen.visible,
      card: !card.hidden,
      title: title.classList.contains('is-in') ? title.textContent : null,
      credits: credits.classList.contains('is-in'),
    }),
  };
}
