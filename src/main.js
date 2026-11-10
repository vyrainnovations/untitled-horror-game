// Entry point. Sets up the renderer, builds the apartment, creates the player
// and runs the game loop.
import * as THREE from 'three';
import { buildApartment } from './apartment.js';
import { createPlayer } from './player.js';
import { createVhs } from './vhs.js';

// Render at a small fixed height and let CSS stretch it, for the lo-fi look.
const RENDER_HEIGHT = 240;
const DARK = 0x04050a;

const renderer = new THREE.WebGLRenderer({ antialias: false });
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(DARK);
scene.fog = new THREE.Fog(DARK, 1.0, 8.5);

const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 30);

const apartment = buildApartment(scene);
// Start in the bedroom, standing behind the chair, facing the desk.
const player = createPlayer(camera, renderer.domElement, apartment.colliders, { x: 2.3, z: 2.3, yaw: 0 });
const vhs = createVhs(renderer);

// The "click to play" message, hidden while the mouse is captured.
const overlay = document.getElementById('overlay');
document.addEventListener('playerlockchange', () => {
  overlay.style.display = player.isLocked() ? 'none' : '';
});

function resize() {
  const aspect = window.innerWidth / window.innerHeight;
  const width = Math.round(RENDER_HEIGHT * aspect);
  renderer.setSize(width, RENDER_HEIGHT, false);
  vhs.setSize(width, RENDER_HEIGHT);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

let last = 0;
renderer.setAnimationLoop((ms) => {
  const t = ms / 1000;
  const dt = Math.min(0.05, t - last); // never jump far after a hitch
  last = t;
  player.update(dt);
  apartment.update(t);
  vhs.render(scene, camera, t);
});

// Only while developing: lets tests reach into the game from the console.
if (import.meta.env.DEV) window.__game = { player, apartment, camera, scene };
