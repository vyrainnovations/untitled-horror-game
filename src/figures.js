// People, built from boxes. Both are seen only on the last tape
// (STORY.md, beats 13 and 14), and only at the tape's 240 x 180, so they are
// rough on purpose:
//   Hamza, nearer each time the player scrubs back: sitting in the spare
//     room, standing in the doorways, then bending to look at the screen.
//   Saad, asleep at his desk in a grey hoodie, headphones on, head on his
//     arms. It is the only time the player sees him.
//
// A figure is a set of joints (hips, back, neck, shoulders, elbows, hips,
// knees), each a group that turns. pose() sets them all for one position.
// Its feet are at its own (0, 0, 0) and it faces its own +z.
import * as THREE from 'three';

const COLOURS = {
  hamza: { top: 0x2c3036, legs: 0x22242a, skin: 0x7a5c48, hair: 0x141210, shoes: 0x111111 },
  saad: { top: 0x6e7174, legs: 0x293040, skin: 0x7a5c48, hair: 0x141210, shoes: 0x1a1a1a },
};

// The poses: how far each joint is turned, in radians. "lean" is the back
// bending forward from the hips; "down" is the hips lowered to a seat.
const POSES = {
  stand: { seat: null, lean: 0, head: 0, arms: [[0, 0], [0, 0]], legs: [0, 0] },
  sit: { seat: 0.47, lean: 0.1, head: 0.05, arms: [[-0.45, -0.85], [-0.45, -0.85]], legs: [-Math.PI / 2, Math.PI / 2] },
  // Bent over, one hand on the desk, looking hard at a screen.
  bend: { seat: null, lean: 0.75, head: 0.3, arms: [[-1.45, -0.25], [-0.7, -0.15]], legs: [0, 0] },
  // Slumped forward onto a desk, arms folded under his head.
  asleep: { seat: 0.5, lean: 1.0, head: 0.35, tilt: 0.9, arms: [[-1.9, -0.67], [-1.9, -0.67]], fold: 1.0, legs: [-Math.PI / 2, Math.PI / 2] },
};

export function createFigure(who) {
  const colour = COLOURS[who];
  const material = (hex) => new THREE.MeshLambertMaterial({ color: hex });
  const top = material(colour.top);
  const legs = material(colour.legs);
  const skin = material(colour.skin);
  const hair = material(colour.hair);
  const shoes = material(colour.shoes);

  const joint = (parent, x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const box = (parent, w, h, d, mat, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();
  const hips = joint(root, 0, 0.92, 0);
  box(hips, 0.34, 0.14, 0.2, legs, 0, 0.02, 0);
  const back = joint(hips, 0, 0.06, 0);
  box(back, 0.37, 0.52, 0.21, top, 0, 0.26, 0);
  const neck = joint(back, 0, 0.56, 0);
  box(neck, 0.08, 0.08, 0.08, skin, 0, 0.02, 0);
  const head = joint(neck, 0, 0.06, 0);
  box(head, 0.17, 0.22, 0.2, skin, 0, 0.11, 0.01);
  box(head, 0.18, 0.07, 0.21, hair, 0, 0.215, -0.005);
  box(head, 0.18, 0.12, 0.05, hair, 0, 0.15, -0.09);
  if (who === 'saad') {
    box(back, 0.3, 0.12, 0.1, top, 0, 0.56, -0.13); // the hood, down
    box(head, 0.03, 0.03, 0.2, shoes, 0, 0.25, 0); // headphones: the band
    for (const side of [-1, 1]) box(head, 0.05, 0.09, 0.09, shoes, side * 0.105, 0.11, 0.01); // and the cups
  }
  const arms = [-1, 1].map((side) => {
    const shoulder = joint(back, side * 0.235, 0.48, 0);
    box(shoulder, 0.11, 0.3, 0.12, top, 0, -0.14, 0);
    const elbow = joint(shoulder, 0, -0.29, 0);
    elbow.rotation.order = 'YXZ'; // bend first, then fold inwards
    box(elbow, 0.1, 0.27, 0.11, top, 0, -0.13, 0);
    box(elbow, 0.08, 0.09, 0.09, skin, 0, -0.3, 0);
    return { shoulder, elbow, side };
  });
  const limbs = [-1, 1].map((side) => {
    const hip = joint(hips, side * 0.1, -0.02, 0);
    box(hip, 0.15, 0.45, 0.16, legs, 0, -0.22, 0);
    const knee = joint(hip, 0, -0.44, 0);
    box(knee, 0.13, 0.42, 0.14, legs, 0, -0.21, 0);
    box(knee, 0.11, 0.06, 0.25, shoes, 0, -0.44, 0.05);
    return { hip, knee };
  });

  root.traverse((part) => {
    if (part.isMesh) part.castShadow = false;
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

  return { root, pose };
}
