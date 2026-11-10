// Starter scene. It only proves the pipeline works: a dim room with one
// hanging light, rendered at low resolution. Replace it with the real game.
import * as THREE from 'three';

// Render at a small fixed height and let CSS stretch it, for the lo-fi look.
const RENDER_HEIGHT = 240;

const renderer = new THREE.WebGLRenderer({ antialias: false });
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050506);
scene.fog = new THREE.Fog(0x050506, 2, 9);

const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 50);
camera.position.set(0, 1.6, 3);

// A room: one box seen from the inside.
const room = new THREE.Mesh(
  new THREE.BoxGeometry(6, 3, 8),
  new THREE.MeshLambertMaterial({ color: 0x6b6558, side: THREE.BackSide })
);
room.position.y = 1.5;
scene.add(room);

const bulb = new THREE.PointLight(0xffd9a0, 6, 8);
bulb.position.set(0, 2.6, 0);
scene.add(bulb);
scene.add(new THREE.AmbientLight(0x202030, 0.6));

function resize() {
  const aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(Math.round(RENDER_HEIGHT * aspect), RENDER_HEIGHT, false);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

renderer.setAnimationLoop((ms) => {
  const t = ms / 1000;
  camera.rotation.y = Math.sin(t * 0.2) * 0.3; // slow look left and right
  bulb.intensity = 6 + Math.sin(t * 13) * 0.4; // slight flicker
  renderer.render(scene, camera);
});
