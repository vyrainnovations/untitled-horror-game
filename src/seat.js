// Sitting at the desk in the study, in front of the PC.
//
// Sitting down, the view glides into the chair. While seated the player can
// still look round the room with the mouse, but cannot walk. Looking at the
// monitor, the view narrows onto it, the way your eyes settle on a screen,
// so that the editing program on it can be read. Looking away, the view
// opens out again. STORY.md needs this: in the last clip the player has to
// be able to turn round in the real room and see that nobody is there.
import * as THREE from 'three';

const SEAT = [2.5, 1.17, 0.93]; // the eyes, sat in the chair: [x, y, z]
const LEAN = 0.07; // how far forward he leans while looking at the screen, in metres
const SCREEN = new THREE.Vector3(2.5, 1.05, 0.257); // the middle of the monitor
const SCREEN_SIZE = [0.6, 0.34]; // its width and height, in metres
const FILL = 0.84; // looking at the screen, it fills this much of the view, across or up and down, whichever fits: the rest is room for the task line and the keys
const STAND = { x: 2.5, z: 1.9 }; // where he gets up to: behind the chair
const TURN = 2.5; // how far he can turn round in the chair, either way, in radians
const GLIDE = 0.8; // seconds to sit down, or stand up

const smooth = (k) => k * k * (3 - 2 * k);

export function createSeat({ camera, player, settings }) {
  let seated = false;
  let moving = null; // a glide in progress: { from, to, time, then }
  let focus = 0; // 0 looking away, 1 looking at the screen
  const towards = new THREE.Vector3();
  const facing = new THREE.Vector3();

  // The way the eyes look when sat facing the screen.
  const straight = { yaw: 0, pitch: Math.atan2(SCREEN.y - SEAT[1], SEAT[2] - SCREEN.z) };

  // The field of view (degrees) that makes the screen fill the view, for
  // the shape of the window the game is in.
  function focusView() {
    const away = SEAT[2] - LEAN - SCREEN.z;
    const half = Math.max(SCREEN_SIZE[1] / 2 / away, SCREEN_SIZE[0] / 2 / away / camera.aspect) / FILL;
    return (2 * Math.atan(half) * 180) / Math.PI;
  }

  const pose = () => ({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    yaw: camera.rotation.y,
    pitch: camera.rotation.x,
    fov: camera.fov,
  });

  function glide(to, then) {
    moving = { from: pose(), to, time: 0, then };
  }

  // The yaw the player is turned to, taken the short way round from the desk.
  const turned = (yaw) => Math.atan2(Math.sin(yaw), Math.cos(yaw));

  function sitDown(then) {
    if (seated || moving) return;
    // However many times he has turned round, take the short way back to the desk.
    camera.rotation.y = turned(camera.rotation.y);
    player.state.yaw = camera.rotation.y;
    glide({ x: SEAT[0], y: SEAT[1], z: SEAT[2] - LEAN, yaw: straight.yaw, pitch: straight.pitch, fov: focusView() }, () => {
      seated = true;
      focus = 1;
      player.state.yaw = straight.yaw;
      player.state.pitch = straight.pitch;
      if (then) then();
    });
  }

  function standUp(then) {
    if (!seated || moving) return;
    seated = false;
    const yaw = turned(player.state.yaw);
    glide({ x: STAND.x, y: 1.5, z: STAND.z, yaw, pitch: -0.1, fov: settings.get('fieldOfView') }, () => {
      player.reset({ x: STAND.x, z: STAND.z, yaw, pitch: -0.1 });
      if (then) then();
    });
  }

  function update(dt) {
    if (moving) {
      moving.time += dt;
      const k = smooth(Math.min(1, moving.time / GLIDE));
      const { from, to } = moving;
      const mix = (a, b) => a + (b - a) * k;
      camera.position.set(mix(from.x, to.x), mix(from.y, to.y), mix(from.z, to.z));
      camera.rotation.set(mix(from.pitch, to.pitch), mix(from.yaw, to.yaw), 0);
      camera.fov = mix(from.fov, to.fov);
      camera.updateProjectionMatrix();
      if (k === 1) {
        const then = moving.then;
        moving = null;
        then();
      }
      return;
    }
    if (!seated) return;
    // The mouse still turns the head (src/player.js keeps count), but only so far.
    const s = player.state;
    s.yaw = Math.max(-TURN, Math.min(TURN, s.yaw));
    s.pitch = Math.max(-1.1, Math.min(0.9, s.pitch));
    // How straight at the screen he is looking.
    facing.set(-Math.sin(s.yaw) * Math.cos(s.pitch), Math.sin(s.pitch), -Math.cos(s.yaw) * Math.cos(s.pitch));
    towards.copy(SCREEN).sub(camera.position).normalize();
    const off = Math.acos(Math.max(-1, Math.min(1, facing.dot(towards))));
    const target = 1 - smooth(Math.max(0, Math.min(1, (off - 0.16) / 0.3)));
    focus += (target - focus) * Math.min(1, dt * 5);
    camera.position.set(SEAT[0], SEAT[1], SEAT[2] - LEAN * focus);
    camera.rotation.set(s.pitch, s.yaw, 0);
    camera.fov = settings.get('fieldOfView') + (focusView() - settings.get('fieldOfView')) * focus;
    camera.updateProjectionMatrix();
  }

  // Back to standing, at once: used when the game goes back to the title.
  function reset() {
    seated = false;
    moving = null;
    focus = 0;
    camera.fov = settings.get('fieldOfView');
    camera.updateProjectionMatrix();
  }

  return {
    sitDown,
    standUp,
    update,
    reset,
    isSeated: () => seated,
    isMoving: () => !!moving,
    // True while the player is looking at the screen, closely enough to work.
    atScreen: () => seated && focus > 0.6,
    state: () => ({ seated, moving: !!moving, focus: +focus.toFixed(2), fov: +camera.fov.toFixed(1) }),
  };
}
