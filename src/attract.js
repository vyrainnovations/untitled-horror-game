// The camera behind the title screen. It drifts slowly through the flat, one
// shot after another, with a burst of static on each cut.
//
// Each shot goes from one camera position to another: [x, y, z, turn, tilt].
// The thing worth looking at is kept right of centre, because the menu
// covers the left of the screen.
const SHOTS = [
  { from: [2.2, 1.45, 2.6, 0.22, -0.08], to: [2.25, 1.43, 2.05, 0.22, -0.08], seconds: 11 }, // the desk
  { from: [4.75, 1.5, 11.5, 0.12, -0.02], to: [4.75, 1.5, 10.3, 0.12, -0.02], seconds: 10 }, // the corridor, from the front door
  { from: [3.3, 1.5, 2.15, -1.32, -0.03], to: [3.95, 1.5, 2.15, -1.32, -0.03], seconds: 10 }, // across to the spare room
  { from: [0.9, 1.5, 4.9, -1.37, -0.02], to: [1.6, 1.5, 4.9, -1.37, -0.02], seconds: 10 }, // the bedroom, through to the bathroom mirror
  { from: [3.3, 1.5, 9.9, 1.4, -0.03], to: [3.0, 1.5, 9.5, 1.34, -0.03], seconds: 10 }, // the dining window
];

export function createAttract(camera, onCut) {
  let index = 0;
  let elapsed = 0;

  function update(dt) {
    elapsed += dt;
    if (elapsed > SHOTS[index].seconds) {
      elapsed = 0;
      index = (index + 1) % SHOTS.length;
      onCut();
    }
    const { from, to, seconds } = SHOTS[index];
    const t = elapsed / seconds;
    const at = from.map((value, i) => value + (to[i] - value) * t);
    camera.position.set(at[0], at[1], at[2]);
    camera.rotation.set(at[4], at[3], 0);
  }

  function restart() {
    index = 0;
    elapsed = 0;
  }

  return { update, restart };
}
