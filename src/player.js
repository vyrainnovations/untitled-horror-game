// First-person player: click to capture the mouse, mouse to look, WASD to
// walk. The player is a circle on the floor that is pushed back out of any
// wall or furniture rectangle it overlaps.
const EYE_HEIGHT = 1.6;
const RADIUS = 0.25; // how wide the player is
const WALK_SPEED = 1.5; // metres per second
const FAST_SPEED = 2.5; // holding Shift
const LOOK_SPEED = 0.0022; // radians per pixel of mouse movement
const MAX_PITCH = 1.45; // how far up or down you can look

export function createPlayer(camera, element, colliders, start) {
  const state = { x: start.x, z: start.z, yaw: start.yaw || 0, pitch: 0, bob: 0 };
  const keys = new Set();
  camera.rotation.order = 'YXZ';

  // --- Mouse capture and look ---
  // Normal mode: the browser hides and captures the mouse ("pointer lock").
  // Fallback: some embedded browser windows refuse to capture the mouse. There
  // the game still starts on click, and you hold the mouse button and drag to
  // look around.
  let dragMode = false;
  const captured = () => document.pointerLockElement === element;
  const isLocked = () => captured() || dragMode;
  const changed = () => document.dispatchEvent(new Event('playerlockchange'));

  element.addEventListener('click', async () => {
    if (isLocked()) return;
    try {
      await element.requestPointerLock();
    } catch (error) {
      // "WrongDocumentError" means this window can never capture the mouse.
      // Anything else is the browser refusing a click made too soon after
      // Esc, and the next click will work.
      if (error.name === 'WrongDocumentError') {
        dragMode = true;
        changed();
      }
    }
  });
  document.addEventListener('pointerlockchange', () => {
    if (!captured()) keys.clear();
    changed();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && dragMode) {
      dragMode = false;
      keys.clear();
      changed();
    }
  });
  document.addEventListener('mousemove', (e) => {
    if (!captured() && !(dragMode && e.buttons & 1)) return;
    state.yaw -= e.movementX * LOOK_SPEED;
    state.pitch -= e.movementY * LOOK_SPEED;
    state.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitch));
  });

  // --- Keyboard ---
  window.addEventListener('keydown', (e) => {
    if (isLocked()) keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  function readInput() {
    const down = (...codes) => codes.some((c) => keys.has(c));
    return {
      forward: (down('KeyW', 'ArrowUp') ? 1 : 0) - (down('KeyS', 'ArrowDown') ? 1 : 0),
      right: (down('KeyD', 'ArrowRight') ? 1 : 0) - (down('KeyA', 'ArrowLeft') ? 1 : 0),
      fast: down('ShiftLeft', 'ShiftRight'),
    };
  }

  // Push the player out of anything solid.
  function collide() {
    for (let pass = 0; pass < 3; pass++) {
      for (const c of colliders) {
        const nearX = Math.max(c.minX, Math.min(c.maxX, state.x));
        const nearZ = Math.max(c.minZ, Math.min(c.maxZ, state.z));
        const dx = state.x - nearX;
        const dz = state.z - nearZ;
        const distSq = dx * dx + dz * dz;
        if (distSq >= RADIUS * RADIUS) continue;
        if (distSq > 1e-9) {
          const dist = Math.sqrt(distSq);
          state.x += (dx / dist) * (RADIUS - dist);
          state.z += (dz / dist) * (RADIUS - dist);
        } else {
          // Centre is inside the box: leave through the nearest side.
          const exits = [
            [state.x - c.minX, -1, 0], [c.maxX - state.x, 1, 0],
            [state.z - c.minZ, 0, -1], [c.maxZ - state.z, 0, 1],
          ].sort((a, b) => a[0] - b[0])[0];
          state.x += exits[1] * (exits[0] + RADIUS);
          state.z += exits[2] * (exits[0] + RADIUS);
        }
      }
    }
  }

  // Advance the player by dt seconds. input is optional (used for testing).
  function update(dt, input = readInput()) {
    let moving = false;
    if (input.forward || input.right) {
      const length = Math.hypot(input.forward, input.right);
      const f = input.forward / length;
      const r = input.right / length;
      const speed = input.fast ? FAST_SPEED : WALK_SPEED;
      const sin = Math.sin(state.yaw);
      const cos = Math.cos(state.yaw);
      const beforeX = state.x;
      const beforeZ = state.z;
      state.x += (-sin * f + cos * r) * speed * dt;
      state.z += (-cos * f - sin * r) * speed * dt;
      collide();
      const moved = Math.hypot(state.x - beforeX, state.z - beforeZ);
      moving = moved > 0.0005;
      state.bob += moved * 3.6; // one head-bob per step
    }
    // Settle the head back to rest when standing still.
    if (!moving) state.bob += (Math.round(state.bob / Math.PI) * Math.PI - state.bob) * Math.min(1, dt * 8);

    camera.position.set(state.x, EYE_HEIGHT + Math.abs(Math.sin(state.bob)) * 0.035, state.z);
    camera.rotation.set(state.pitch, state.yaw, 0);
  }

  return { state, update, isLocked };
}
