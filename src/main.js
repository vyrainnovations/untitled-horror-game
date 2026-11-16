// Entry point. Sets up the renderer, builds the flat, creates the player,
// the menu, the settings and the sound, and runs the game loop.
//
// The game is always in one of three states:
//   title    the menu is up and the camera drifts through the flat
//   playing  the player has the mouse and walks about
//   paused   Esc was pressed: the picture freezes like a paused tape and the
//            menu comes back
import * as THREE from 'three';
import { buildApartment } from './apartment.js';
import { createPlayer } from './player.js';
import { createVhs } from './vhs.js';
import { createSettings } from './settings.js';
import { createAudio } from './audio.js';
import { createMenu } from './menu.js';
import { createAttract } from './attract.js';
import { createHud } from './hud.js';
import { createInteract } from './interact.js';
import { createChores } from './chores.js';
import { createJob } from './job.js';
import { createEnding } from './ending.js';
import { floorAt } from './plan.js';

// The VHS filter never draws more lines than this, to stay fast on 4K screens.
const MAX_SCREEN_LINES = 1440;
const DARK = 0x04050a;
const BULB_FULL = 2.6; // the corridor bulb's brightness when it is burning steadily

const renderer = new THREE.WebGLRenderer({ antialias: false });
// Nothing in the flat moves, so shadows are drawn once and then kept.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(DARK);
scene.fog = new THREE.Fog(DARK, 1.5, 11);

const settings = createSettings();
const camera = new THREE.PerspectiveCamera(settings.get('fieldOfView'), 1, 0.05, 40);
camera.rotation.order = 'YXZ';
scene.add(camera); // so that something carried in the hand can hang from the camera

const apartment = buildApartment(scene);
const player = createPlayer(camera, renderer.domElement, apartment.colliders, apartment.start);
const vhs = createVhs(renderer);
const audio = createAudio();
const attract = createAttract(camera, () => vhs.cut());
const hud = createHud(); // the words on the screen while playing
const interact = createInteract({ camera, walls: apartment.walls, hud }); // looking at a thing and using it
// The chores that open the game. Shadows are drawn once, so when a chore
// takes something away it asks for them to be drawn again.
const chores = createChores({
  apartment,
  camera,
  player,
  interact,
  hud,
  audio,
  redrawShadows: () => { renderer.shadowMap.needsUpdate = true; },
  onDone: afterTheChores,
});
// The second part of the game: the phone, the PC and the tapes.
const job = createJob({
  renderer, scene, camera, apartment, player, settings, interact, hud, audio,
  cut: () => vhs.cut(), // a burst of static across the whole picture
  onFlameOut: () => chores.boilOver(), // the chai left on the ring in Part 1 boils over
  onDone: afterTheLastClip,
});

// The end: the gas, the door, the last shot, the title and the credits.
const ending = createEnding({
  apartment, camera, interact, hud, audio,
  footage: job.parts.footage,
  cut: () => vhs.cut(),
  onLights: () => job.lightsBack(), // the flat's lights come back when the cutscene is over
  onFinished: theEnd,
});

// The chores are done: the rubbish is out, the door is bolted, a ring is
// burning under the chai, and the player has just picked up the buzzing
// phone in the study. Part 2 begins (src/job.js).
function afterTheChores() {
  job.start();
}

// Parts 2 and 3 are over: the tapes, and the hiding (src/job.js). Part 4,
// the cutscene and the ending, is src/ending.js.
function afterTheLastClip() {
  ending.start();
}

// After the credits: back to the title screen, and the mouse back to the player.
function theEnd() {
  toTitle();
  player.release();
}

// --- The three states ------------------------------------------------------
let mode = 'title';
let worldTime = 0; // seconds the flat has been running: stops while paused
let playTime = 0; // seconds actually played: what the tape counter shows

// Start from the title screen, or carry on from a pause. The browser only
// hands over the mouse straight after a click or a key press, and it refuses
// for about a second after the player has pressed Esc. So if it says no,
// wait that second out and ask once more before giving up.
let asking = false; // true while waiting for the browser's answer
async function play() {
  if (asking) return;
  asking = true;
  const from = mode;
  audio.start();
  let gotMouse = await player.capture();
  if (!gotMouse) {
    menu.say('One moment...');
    await new Promise((done) => setTimeout(done, 1300));
    // Only ask again if the player has not gone somewhere else meanwhile.
    if (mode === from) gotMouse = await player.capture();
  }
  asking = false;
  if (mode !== from) {
    if (gotMouse) player.release();
    return;
  }
  if (!gotMouse) {
    menu.say('The browser would not hand over the mouse. Try again.');
    return;
  }
  if (mode === 'title') {
    // A new game: the player and everything in the flat go back to the start.
    player.reset(apartment.start);
    chores.start();
    playTime = 0;
    vhs.cut();
    audio.music(null, { fade: 2.5 }); // the title's theme fades: the first part of the game has no music
    audio.setTension(0, 0.5);
    audio.setPower(true);
  }
  mode = 'playing';
  vhs.setPaused(false);
  audio.setScene('playing');
  menu.hide();
  hud.show(true);
}

function pause() {
  if (mode !== 'playing') return;
  mode = 'paused';
  vhs.setPaused(true);
  audio.setScene('paused');
  audio.click('back');
  hud.show(false);
  menu.show('pause');
}

function toTitle() {
  mode = 'title';
  playTime = 0;
  job.reset();
  ending.reset();
  chores.reset(); // the title screen shows the flat as it is before anything has been done
  attract.restart();
  vhs.setPaused(false);
  vhs.cut();
  audio.setScene('title');
  audio.setTension(0, 1);
  audio.setPower(true);
  audio.music('theme', { fade: 3 });
  hud.show(false);
  menu.show('title');
}

const menu = createMenu({ settings, audio, onPlay: play, onTitle: toTitle });
menu.show('title');

// Esc makes the browser take the mouse back. That is the pause button.
document.addEventListener('playerlockchange', () => {
  if (mode === 'playing' && !player.isLocked()) pause();
});
// Switching to another window pauses too.
window.addEventListener('blur', () => {
  if (mode === 'playing') player.release();
});
// Sound is not allowed until the first click or key press anywhere. Start it
// on that, before anything else hears the click, so the very first menu
// sound is not lost.
for (const first of ['pointerdown', 'keydown']) {
  window.addEventListener(first, () => {
    audio.start();
    if (mode === 'title') audio.music('theme', { fade: 4 }); // the title screen has its theme
  }, { once: true, capture: true });
}

player.setStepListener((x, z, fast) => audio.step(floorAt(x, z), fast));

// --- Using things -----------------------------------------------------------
// E, or the left mouse button, uses whatever the player is looking at. Only
// while playing: while the menu is up, neither does anything. While the
// phone is up, or the player is sat at the PC, the keys go to those instead.
window.addEventListener('keydown', (e) => {
  if (mode !== 'playing' || e.repeat) return;
  if (ending.keyDown(e.code) || job.keyDown(e.code)) e.preventDefault();
  else if (e.code === 'KeyE') interact.use();
});
window.addEventListener('keyup', (e) => job.keyUp(e.code));
// Where the game has the mouse, a press of the button is a click. In windows
// that cannot capture the mouse, holding the button is how you look around,
// so there a click only counts if the mouse was let go again at once,
// without having moved.
let press = null;
const clickUse = () => {
  if (!ending.keyDown('KeyE') && !job.click()) interact.use();
};
document.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || mode !== 'playing') return;
  if (document.pointerLockElement) clickUse();
  else press = { x: e.clientX, y: e.clientY, at: e.timeStamp };
});
document.addEventListener('mouseup', (e) => {
  if (e.button !== 0 || !press) return;
  const quick = e.timeStamp - press.at < 350;
  const still = Math.hypot(e.clientX - press.x, e.clientY - press.y) < 6;
  press = null;
  if (quick && still && mode === 'playing') clickUse();
});

// --- Settings: what each one does -------------------------------------------
function resize() {
  // A window with no size at all (a hidden panel) has nothing to draw into:
  // keep the last size until it has one.
  if (!window.innerWidth || !window.innerHeight) return;
  const aspect = window.innerWidth / window.innerHeight;
  // How many real pixels tall the window is. Past the limit, draw at half
  // (or a third...) so each drawn pixel is a whole number of real pixels.
  const realLines = window.innerHeight * window.devicePixelRatio;
  const divide = Math.max(1, Math.ceil(realLines / MAX_SCREEN_LINES));
  const screenHeight = Math.max(1, Math.round(realLines / divide));
  const screenWidth = Math.max(1, Math.round(screenHeight * aspect));
  // The game picture is this many lines tall, however big the screen is.
  // That is what gives the lo-fi look. The VHS filter then draws it onto the screen.
  const lines = settings.get('pictureLines');
  renderer.setSize(screenWidth, screenHeight, false);
  vhs.setSize(Math.max(1, Math.round(lines * aspect)), lines, screenWidth, screenHeight);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

const apply = {
  sensitivity: (v) => player.setLookScale(v / 100),
  invertLook: (v) => player.setInvertLook(v),
  volume: (v) => audio.setVolume(v / 100),
  brightness: (v) => vhs.setBrightness(v / 100),
  tapeWear: (v) => vhs.setWear(v / 100),
  fieldOfView: (v) => {
    camera.fov = v;
    camera.updateProjectionMatrix();
  },
  headBob: (v) => player.setHeadBob(v),
  pictureLines: () => resize(),
};
for (const key of settings.keys()) apply[key](settings.get(key));
settings.onChange((key, value) => apply[key](value));
resize();

// --- The loop -------------------------------------------------------------------
let debugView = null; // only used while developing, see below
let last = 0;

// Move the game on by dt seconds. Everything that happens over time goes
// through here, so that pausing stops all of it at once.
const STILL = { forward: 0, right: 0, fast: false }; // looking about, but not walking
function tick(dt) {
  if (mode === 'playing') {
    // Who has the controls: walking, the phone, the desk (src/job.js), or
    // the ending (looking, but not walking).
    const hands = ending.busy() ? 'ending' : job.hands();
    if (hands === 'walk') player.update(dt);
    else if (hands === 'phone' || hands === 'ending') player.update(dt, STILL);
    // 'seat', 'door', 'hide' and 'frozen': whoever has the controls places the view itself.
    chores.update(dt);
    job.update(dt);
    ending.update(dt);
    if (hands === 'walk') interact.update();
    hud.update(dt);
    playTime += dt;
    worldTime += dt;
  } else if (mode === 'title') {
    attract.update(dt);
    worldTime += dt;
  }
  // Paused: nothing moves, and the camera stays where it was.
  if (mode !== 'paused') apartment.update(worldTime, dt);
}

// Draw the game as it stands, without moving it on.
function draw(now) {
  if (debugView) {
    camera.position.set(debugView[0], debugView[1], debugView[2]);
    camera.rotation.set(debugView[4], debugView[3], 0);
  }
  audio.update(camera.position.x, camera.position.z, apartment.lights.bulb.intensity / BULB_FULL);
  menu.setClock(playTime);
  job.film(); // the tape on the monitor, drawn before the picture it is part of
  ending.film(); // and the last shot, when it is on
  vhs.render(scene, camera, now);
}

function frame(ms) {
  const now = ms / 1000;
  const dt = Math.min(0.05, Math.max(0, now - last)); // never jump far after a hitch
  last = now;
  tick(dt);
  draw(now);
}
renderer.setAnimationLoop(frame);

// Only while developing: lets tests reach into the game from the console.
//   __game.bright(true)   floods the flat with light and removes the fog,
//                         to check that things are where they should be.
//   __game.view(x, y, z, yaw, pitch)   looks from anywhere, even from above
//                         with the ceiling hidden. __game.view() goes back.
//   __game.frame(ms)      draws one frame by hand, for timing tests.
//   __game.mode()         'title', 'playing' or 'paused'.
//   __game.hold(true)     stops the game's own clock, so that a test can move
//                         time on by hand with __game.tick(seconds) and look at
//                         one exact moment with __game.draw(). hold(false)
//                         lets it run again.
if (import.meta.env.DEV) {
  const flood = new THREE.AmbientLight(0xffffff, 2.2);
  const fog = scene.fog;
  window.__game = {
    player,
    apartment,
    camera,
    scene,
    renderer,
    settings,
    audio,
    menu,
    hud,
    interact,
    chores,
    job,
    ending,
    frame,
    tick, // move the game on by so many seconds without waiting: __game.tick(0.05)
    draw: () => draw(performance.now() / 1000),
    hold: (on) => renderer.setAnimationLoop(on ? null : frame),
    play,
    pause,
    toTitle,
    mode: () => mode,
    floorAt,
    // Skip the menu and stand in the flat, with silent feet, for tests that
    // walk the player by hand. Reload the page to get the game back.
    testMode() {
      mode = 'testing';
      menu.hide();
      player.release();
      player.setStepListener(null);
      player.reset(apartment.start);
    },
    bright(on) {
      if (on) scene.add(flood);
      else scene.remove(flood);
      scene.fog = on ? null : fog;
    },
    view(x, y, z, yaw = 0, pitch = 0) {
      debugView = x === undefined ? null : [x, y, z, yaw, pitch];
      // From above, hide the ceiling (the one big slab at the top).
      scene.traverse((o) => {
        if (o.isMesh && o.position.y > 2.8 && o.geometry.parameters && o.geometry.parameters.width > 9) o.visible = !(debugView && y > 2.8);
      });
    },
  };
}
