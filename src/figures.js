// People, built from boxes. There are two, and neither has a face worth
// the name: they are seen on tapes 240 pixels wide, through a peephole, or
// in the dark with a light in your eyes. So they are rough on purpose.
//
//   Saad   the player. A grey hoodie and headphones. Only ever seen on a
//          tape: standing dead still in an empty flat, sitting at his desk,
//          and at the very end asleep on it (STORY.md, rule 4).
//   Hamza  his friend. A dark jacket, and for tonight a head torch. On the
//          tapes; at the peephole; and, once the lights go out, walking
//          through the flat itself (src/hunt.js).
//
// A figure is a set of joints (hips, back, neck, shoulders, elbows, hips,
// knees), each a group that turns. pose() sets them all for one position;
// stride() swings the arms and legs for walking. Its feet are at its own
// (0, 0, 0) and it faces its own +z.
//
// Every piece is marked with what it is (userData.role: 'top', 'legs',
// 'skin', 'hair', 'shoes', 'gear'), so that a tape can give it the look it
// has under an infra-red lamp (src/footage.js).
import * as THREE from 'three';

const COLOURS = {
  hamza: { top: 0x2c3036, legs: 0x22242a, skin: 0x7a5c48, hair: 0x141210, shoes: 0x111111, gear: 0x17181a },
  saad: { top: 0x6e7174, legs: 0x293040, skin: 0x7a5c48, hair: 0x141210, shoes: 0x1a1a1a, gear: 0x141414 },
};

// The poses: how far each joint is turned, in radians. "lean" is the back
// bending forward from the hips; "seat" is the hips lowered to a seat.
const POSES = {
  stand: { seat: null, lean: 0, head: 0, arms: [[0, 0], [0, 0]], legs: [0, 0] },
  sit: { seat: 0.47, lean: 0.1, head: 0.05, arms: [[-0.45, -0.85], [-0.45, -0.85]], legs: [-Math.PI / 2, Math.PI / 2] },
  // Sat at a desk, working: leaning in a little, both hands out on the keys.
  work: { seat: 0.47, lean: 0.22, head: 0.12, arms: [[-0.75, -0.75], [-0.75, -0.75]], legs: [-Math.PI / 2, Math.PI / 2] },
  // Bent over, one hand on the desk, looking hard at a screen.
  bend: { seat: null, lean: 0.75, head: 0.3, arms: [[-1.45, -0.25], [-0.7, -0.15]], legs: [0, 0] },
  // Stooped to put an eye to something at chest height.
  stoop: { seat: null, lean: 0.34, head: -0.2, arms: [[-0.2, -0.3], [-0.9, -1.2]], legs: [0, 0] },
  // Slumped forward onto a desk, arms folded under his head.
  asleep: { seat: 0.5, lean: 1.0, head: 0.35, tilt: 0.9, arms: [[-1.9, -0.67], [-1.9, -0.67]], fold: 1.0, legs: [-Math.PI / 2, Math.PI / 2] },
};

// who: 'saad' or 'hamza'. torch: he wears a head torch (its lamp is handed
// back, to be lit).
export function createFigure(who, { torch = false } = {}) {
  const colour = COLOURS[who];
  const materials = {};
  for (const role of Object.keys(colour)) materials[role] = new THREE.MeshLambertMaterial({ color: colour[role] });

  const joint = (parent, x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const box = (parent, w, h, d, role, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials[role]);
    mesh.position.set(x, y, z);
    mesh.userData.role = role;
    mesh.castShadow = false; // it moves, and shadows are drawn once
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();
  const hips = joint(root, 0, 0.92, 0);
  box(hips, 0.34, 0.14, 0.2, 'legs', 0, 0.02, 0);
  const back = joint(hips, 0, 0.06, 0);
  box(back, 0.37, 0.52, 0.21, 'top', 0, 0.26, 0);
  const neck = joint(back, 0, 0.56, 0);
  box(neck, 0.08, 0.08, 0.08, 'skin', 0, 0.02, 0);
  const head = joint(neck, 0, 0.06, 0);
  box(head, 0.17, 0.22, 0.2, 'skin', 0, 0.11, 0.01);
  box(head, 0.18, 0.07, 0.21, 'hair', 0, 0.215, -0.005);
  box(head, 0.18, 0.12, 0.05, 'hair', 0, 0.15, -0.09);
  if (who === 'saad') {
    box(back, 0.3, 0.12, 0.1, 'top', 0, 0.56, -0.13); // the hood, down
    box(head, 0.03, 0.03, 0.2, 'gear', 0, 0.25, 0); // headphones: the band
    for (const side of [-1, 1]) box(head, 0.05, 0.09, 0.09, 'gear', side * 0.105, 0.11, 0.01); // and the cups
  }
  // A head torch: a strap round the head and a lamp on the forehead. The
  // lamp glows by itself; whoever made the figure switches it on and off.
  let lamp = null;
  if (torch) {
    box(head, 0.19, 0.035, 0.215, 'gear', 0, 0.165, 0.005);
    lamp = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.046, 0.03), new THREE.MeshBasicMaterial({ color: 0x1c1c1c, fog: false }));
    lamp.position.set(0, 0.165, 0.122);
    lamp.userData.role = 'lamp';
    head.add(lamp);
  }
  const arms = [-1, 1].map((side) => {
    const shoulder = joint(back, side * 0.235, 0.48, 0);
    box(shoulder, 0.11, 0.3, 0.12, 'top', 0, -0.14, 0);
    const elbow = joint(shoulder, 0, -0.29, 0);
    elbow.rotation.order = 'YXZ'; // bend first, then fold inwards
    box(elbow, 0.1, 0.27, 0.11, 'top', 0, -0.13, 0);
    box(elbow, 0.08, 0.09, 0.09, 'skin', 0, -0.3, 0);
    return { shoulder, elbow, side };
  });
  const limbs = [-1, 1].map((side) => {
    const hip = joint(hips, side * 0.1, -0.02, 0);
    box(hip, 0.15, 0.45, 0.16, 'legs', 0, -0.22, 0);
    const knee = joint(hip, 0, -0.44, 0);
    box(knee, 0.13, 0.42, 0.14, 'legs', 0, -0.21, 0);
    box(knee, 0.11, 0.06, 0.25, 'shoes', 0, -0.44, 0.05);
    return { hip, knee, side };
  });

  function pose(name) {
    const p = POSES[name];
    hips.position.y = p.seat === null ? 0.92 : p.seat;
    back.rotation.x = p.lean;
    head.rotation.set(p.head, 0, p.tilt || 0);
    arms.forEach(({ shoulder, elbow, side }, i) => {
      shoulder.rotation.set(p.arms[i][0], 0, p.seat === null && !p.lean ? side * 0.06 : 0);
      elbow.rotation.set(p.arms[i][1], p.fold ? -side * p.fold : 0, 0);
    });
    limbs.forEach(({ hip, knee }) => {
      hip.rotation.x = p.legs[0];
      knee.rotation.x = p.legs[1];
    });
  }
  pose('stand');

  // Walking. phase goes up by 2 pi for every two steps; how far is how long
  // the stride is, from 0 (standing) to 1. The arms hang a little stiff:
  // it should not look quite like a man walking.
  function stride(phase, far = 1) {
    const swing = Math.sin(phase);
    hips.position.y = 0.92 - 0.018 * far * Math.abs(Math.cos(phase));
    back.rotation.x = 0.05 * far;
    limbs.forEach(({ hip, knee, side }) => {
      const s = swing * side;
      hip.rotation.x = -s * 0.46 * far;
      knee.rotation.x = Math.max(0, s) * 0.7 * far; // the back leg bends
    });
    arms.forEach(({ shoulder, elbow, side }) => {
      shoulder.rotation.set(swing * side * 0.2 * far, 0, side * 0.05);
      elbow.rotation.set(-0.12 * far, 0, 0);
    });
  }

  return {
    root,
    pose,
    stride,
    head, // the joint the head turns on: head.rotation.y looks left and right
    lamp, // the torch's lamp, if he has one
    materials, // by role, for anyone who wants to repaint him
  };
}
