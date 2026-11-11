// First-person player: mouse to look, WASD to walk. The player is a circle on
// the floor that is pushed back out of any wall, piece of furniture or open
// door it overlaps.
//
// The player does not decide when the game has the mouse. The menu does: it
// calls capture() when you press Start or Resume, and the game pauses when the
// mouse is let go again (Esc).
const EYE_HEIGHT = 1.5; // eye level of someone about 1.62 m tall
const RADIUS = 0.25; // how wide the player is
const WALK_SPEED = 1.5; // metres per second
const FAST_SPEED = 2.5; // holding Shift
const LOOK_SIDEWAYS = 0.0018; // radians turned per pixel of mouse movement, left and right
const LOOK_UP_DOWN = 0.0022; // the same, up and down
const MAX_PITCH = 1.45; // how far up or down you can look

export function createPlayer(camera, element, colliders, start) {
  const state = { x: start.x, z: start.z, yaw: start.yaw || 0, pitch: start.pitch || 0, bob: 0 };
  const keys = new Set();
  camera.rotation.order = 'YXZ';

  // Things the settings screen can change.
  let lookScale = 1; // mouse sensitivity: 1 is normal
  let invertLook = false; // push the mouse away from you to look down
  let headBob = true;
  let stepListener = null; // told about every footstep, for the sound

  // --- Taking and releasing the mouse ---
  // Normal mode: the browser hides and captures the mouse ("pointer lock").
  // Fallback: some embedded browser windows refuse to capture the mouse. There
  // you hold the mouse button and drag to look around instead.
  let dragMode = false;
  const captured = () => document.pointerLockElement === element;
  const isLocked = () => captured() || dragMode;
  const changed = () => document.dispatchEvent(new Event('playerlockchange'));

  // Take the mouse. Answers true if the game now has it. Browsers only allow
  // this straight after a click or a key press, and they refuse for about a
  // second after the player has pressed Esc.
  async function capture() {
    if (isLocked()) return true;
    try {
      const request = element.requestPointerLock();
      // Wait for the browser's answer, but never for more than a moment.
      const patience = new Promise((done) => setTimeout(done, request && request.then ? 1500 : 150));
      await Promise.race([request, patience]);
      return captured();
    } catch (error) {
      // "WrongDocumentError" means this window can never capture the mouse.
      if (error.name !== 'WrongDocumentError') return false;
      dragMode = true;
      changed();
      return true;
    }
  }

  // Let go of the mouse.
  function release() {
    keys.clear();
    if (captured()) document.exitPointerLock();
    else if (dragMode) {
      dragMode = false;
      changed();
    }
  }

  document.addEventListener('pointerlockchange', () => {
    if (!captured()) keys.clear();
    changed();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && dragMode) release();
    else if (isLocked()) keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());
  document.addEventListener('mousemove', (e) => {
    if (!captured() && !(dragMode && e.buttons & 1)) return;
    state.yaw -= e.movementX * LOOK_SIDEWAYS * lookScale;
    state.pitch -= e.movementY * LOOK_UP_DOWN * lookScale * (invertLook ? -1 : 1);
    state.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitch));
  });

  function readInput() {
    const down = (...codes) => codes.some((c) => keys.has(c));
    return {
      forward: (down('KeyW', 'ArrowUp') ? 1 : 0) - (down('KeyS', 'ArrowDown') ? 1 : 0),
      right: (down('KeyD', 'ArrowRight') ? 1 : 0) - (down('KeyA', 'ArrowLeft') ? 1 : 0),
      fast: down('ShiftLeft', 'ShiftRight'),
    };
  }

  // Push the player out of anything solid. There are two kinds of barrier:
  // a rectangle on the floor (walls, furniture) and a thin straight line at
  // any angle (an open door).
  function collide() {
    for (let pass = 0; pass < 4; pass++) {
      for (const c of colliders) {
        let nearX;
        let nearZ;
        let reach = RADIUS;
        if (c.half !== undefined) {
          const lx = c.bx - c.ax;
          const lz = c.bz - c.az;
          const along = Math.max(0, Math.min(1, ((state.x - c.ax) * lx + (state.z - c.az) * lz) / (lx * lx + lz * lz)));
          nearX = c.ax + lx * along;
          nearZ = c.az + lz * along;
          reach += c.half;
        } else {
          nearX = Math.max(c.minX, Math.min(c.maxX, state.x));
          nearZ = Math.max(c.minZ, Math.min(c.maxZ, state.z));
        }
        const dx = state.x - nearX;
        const dz = state.z - nearZ;
        const distSq = dx * dx + dz * dz;
        if (distSq >= reach * reach) continue;
        if (distSq > 1e-9) {
          const dist = Math.sqrt(distSq);
          state.x += (dx / dist) * (reach - dist);
          state.z += (dz / dist) * (reach - dist);
        } else if (c.half === undefined) {
          // Centre is inside a rectangle: leave through the nearest side.
          const exit = [
            [state.x - c.minX, -1, 0],
            [c.maxX - state.x, 1, 0],
            [state.z - c.minZ, 0, -1],
            [c.maxZ - state.z, 0, 1],
          ].sort((a, b) => a[0] - b[0])[0];
          state.x += exit[1] * (exit[0] + RADIUS);
          state.z += exit[2] * (exit[0] + RADIUS);
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
      // One head-bob per step. Each time the bob passes its low point, a foot
      // has landed.
      const stepsBefore = Math.floor(state.bob / Math.PI);
      state.bob += moved * 3.6;
      if (stepListener && Math.floor(state.bob / Math.PI) > stepsBefore) stepListener(state.x, state.z, input.fast);
    }
    // Settle the head back to rest when standing still.
    if (!moving) state.bob += (Math.round(state.bob / Math.PI) * Math.PI - state.bob) * Math.min(1, dt * 8);

    const lift = headBob ? Math.abs(Math.sin(state.bob)) * 0.035 : 0;
    camera.position.set(state.x, EYE_HEIGHT + lift, state.z);
    camera.rotation.set(state.pitch, state.yaw, 0);
  }

  // Put the player back somewhere, looking a given way.
  function reset(place) {
    state.x = place.x;
    state.z = place.z;
    state.yaw = place.yaw || 0;
    state.pitch = place.pitch || 0;
    state.bob = 0;
    keys.clear();
  }

  return {
    state,
    update,
    isLocked,
    capture,
    release,
    reset,
    setLookScale: (scale) => { lookScale = scale; },
    setInvertLook: (on) => { invertLook = on; },
    setHeadBob: (on) => { headBob = on; },
    setStepListener: (listener) => { stepListener = listener; },
  };
}
