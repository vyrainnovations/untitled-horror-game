// Using things. When the player stands near something that can be used and
// looks at it, a prompt appears ("E  Pick up the rubbish"). Pressing E, or
// clicking the left mouse button, does it.
//
// This file does not know what the things are. Other files hand them in
// with add(). src/main.js decides when E and the mouse button count (only
// while playing, never while the menu is up).

const REACH = 1.5; // how near you have to stand, in metres, measured along the floor
const LOOK = 0.3; // how near to the thing you have to be looking, in metres
const WIDEST = 0.7; // and never further off to the side than this (about 35 degrees)

export function createInteract({ camera, walls, hud }) {
  const things = [];
  let current = null; // what the player is looking at now, if it can be used
  let frozen = false;

  // Add something that can be used:
  //   at      where it is, [x, y, z], or a function that says where
  //   prompt  the words of the prompt, or a function that gives them. If the
  //           function answers nothing, the thing cannot be used just now.
  //   use     what happens
  //   reach, look   optional: its own distances instead of the ones above
  function add(thing) {
    things.push(thing);
    return thing;
  }

  // Is there a wall between the eye and a point? Every piece of wall is a
  // box. The check stops a little short of the point, because some things
  // are fixed to a wall.
  function behindWall(eye, at) {
    for (const wall of walls) {
      let from = 0;
      let to = 0.96;
      for (let i = 0; i < 3 && from <= to; i++) {
        const step = at[i] - eye[i];
        if (Math.abs(step) < 1e-9) {
          if (eye[i] < wall.min[i] || eye[i] > wall.max[i]) from = 2;
          continue;
        }
        const a = (wall.min[i] - eye[i]) / step;
        const b = (wall.max[i] - eye[i]) / step;
        from = Math.max(from, Math.min(a, b));
        to = Math.min(to, Math.max(a, b));
      }
      if (from <= to) return true;
    }
    return false;
  }

  // Call every frame while playing. Finds the thing the player is looking
  // at, and shows or hides the prompt.
  function update() {
    current = null;
    let label = null;
    if (!frozen) {
      const eye = [camera.position.x, camera.position.y, camera.position.z];
      const pitch = camera.rotation.x;
      const yaw = camera.rotation.y;
      // The way the player is looking.
      const fx = -Math.sin(yaw) * Math.cos(pitch);
      const fy = Math.sin(pitch);
      const fz = -Math.cos(yaw) * Math.cos(pitch);
      let best = 1;
      for (const thing of things) {
        const words = typeof thing.prompt === 'function' ? thing.prompt() : thing.prompt;
        if (!words) continue;
        const at = typeof thing.at === 'function' ? thing.at() : thing.at;
        const dx = at[0] - eye[0];
        const dy = at[1] - eye[1];
        const dz = at[2] - eye[2];
        if (Math.hypot(dx, dz) > (thing.reach ?? REACH)) continue; // standing too far away
        const ahead = dx * fx + dy * fy + dz * fz; // how far in front of the eye it is
        if (ahead <= 0) continue;
        // How far the line of sight passes from it.
        const off = Math.sqrt(Math.max(0, dx * dx + dy * dy + dz * dz - ahead * ahead));
        const score = off / (thing.look ?? LOOK);
        if (score >= best || off > ahead * WIDEST) continue; // not looking at it, or something else is nearer the middle
        if (behindWall(eye, at)) continue;
        best = score;
        current = thing;
        label = words;
      }
    }
    hud.prompt(label);
  }

  // Use whatever the player is looking at. Answers true if there was something.
  function use() {
    if (!current) return false;
    const thing = current;
    current = null;
    hud.prompt(null);
    thing.use();
    return true;
  }

  return {
    add,
    update,
    use,
    // While something is in the middle of happening (a door swinging), nothing can be used.
    freeze: (on) => { frozen = on; },
    looking: () => current,
  };
}
