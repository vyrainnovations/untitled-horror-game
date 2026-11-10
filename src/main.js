// Entry point. Sets up the renderer, builds the flat, creates the player and
// runs the game loop.
import * as THREE from 'three';
import { buildApartment } from './apartment.js';
import { createPlayer } from './player.js';
import { createVhs } from './vhs.js';

// The game picture is this many lines tall, however big the screen is. That
// is what gives the lo-fi look. The VHS filter then draws it onto the screen.
const RENDER_HEIGHT = 360;
// The filter itself never draws more lines than this, to stay fast on 4K screens.
const MAX_SCREEN_LINES = 1440;
const DARK = 0x04050a;

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

const camera = new THREE.PerspectiveCamera(64, 1, 0.05, 40);

const apartment = buildApartment(scene);
const player = createPlayer(camera, renderer.domElement, apartment.colliders, apartment.start);
const vhs = createVhs(renderer);

// The "click to play" message, hidden while the mouse is captured.
const overlay = document.getElementById('overlay');
document.addEventListener('playerlockchange', () => {
  overlay.style.display = player.isLocked() ? 'none' : '';
});

function resize() {
  const aspect = window.innerWidth / window.innerHeight;
  // How many real pixels tall the window is. Past the limit, draw at half
  // (or a third...) so each drawn pixel is a whole number of real pixels.
  const realLines = window.innerHeight * window.devicePixelRatio;
  const divide = Math.max(1, Math.ceil(realLines / MAX_SCREEN_LINES));
  const screenHeight = Math.max(1, Math.round(realLines / divide));
  const screenWidth = Math.max(1, Math.round(screenHeight * aspect));
  renderer.setSize(screenWidth, screenHeight, false);
  vhs.setSize(Math.max(1, Math.round(RENDER_HEIGHT * aspect)), RENDER_HEIGHT, screenWidth, screenHeight);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

let debugView = null; // only used while developing, see below
let last = 0;
renderer.setAnimationLoop((ms) => {
  const t = ms / 1000;
  const dt = Math.min(0.05, t - last); // never jump far after a hitch
  last = t;
  player.update(dt);
  if (debugView) {
    camera.position.set(debugView[0], debugView[1], debugView[2]);
    camera.rotation.set(debugView[4], debugView[3], 0);
  }
  apartment.update(t, dt);
  vhs.render(scene, camera, t);
});

// Only while developing: lets tests reach into the game from the console.
//   __game.bright(true)   floods the flat with light and removes the fog,
//                         to check that things are where they should be.
//   __game.view(x, y, z, yaw, pitch)   looks from anywhere, even from above
//                         with the ceiling hidden. __game.view() goes back.
if (import.meta.env.DEV) {
  const flood = new THREE.AmbientLight(0xffffff, 2.2);
  const fog = scene.fog;
  window.__game = {
    player,
    apartment,
    camera,
    scene,
    renderer,
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
