// What you see out of the west windows: a lane two floors down, the buildings
// across it, a street lamp and overhead wires.
//
// None of it is lit by the game's lights. The buildings and the lane are
// painted backdrops; the lamp and the wires stand in front of them, so things
// slide past each other when you move, which makes it read as real depth.
//
// The lane runs on for 39 metres each way, three times as far as its
// painted pictures are long (they repeat, mirrored), and all of it fades
// into the night's haze well before it ends (HAZE in src/materials.js).
// Before that it stopped dead 13 metres either side of the lamp, and Eshan
// saw it: "the city ends in a box".
import { STREET_LAMP } from './plan.js';

const LANE = [-33, 45]; // how far the lane runs, north to south

export function buildOutside(b, M) {
  const middle = (LANE[0] + LANE[1]) / 2;
  const length = LANE[1] - LANE[0];
  b.panel(-9, 0, middle, length, 14, '+x', M.facade); // the buildings opposite
  b.panel(-4.5, -6.5, middle, 9, length, '+y', M.lane); // the lane below
  b.panel(-9.6, 22, middle, 190, 64, '+x', M.nightSky); // the night behind and above them

  // The lamp post stands across the lane and reaches out over it.
  const [x, y, z] = STREET_LAMP;
  b.box(x - 0.75, x - 0.63, -6.5, y + 0.25, z - 0.06, z + 0.06, M.silhouette);
  b.box(x - 0.7, x + 0.1, y + 0.17, y + 0.25, z - 0.04, z + 0.04, M.silhouette);
  b.box(x - 0.18, x + 0.18, y + 0.02, y + 0.17, z - 0.1, z + 0.1, M.silhouette);
  b.box(x - 0.14, x + 0.14, y - 0.02, y + 0.02, z - 0.08, z + 0.08, M.lampHead);
  b.glow(x, y, z, 1.8, M.hazeOrange);

  // Overhead wires running along the lane.
  for (const [wx, wy] of [[-3.2, 2.5], [-3.0, 2.2], [-2.6, 0.9]]) {
    b.rod([wx, wy, LANE[0]], [wx, wy - 0.25, LANE[1]], 0.012, M.silhouette, { sides: 3 });
  }
}
