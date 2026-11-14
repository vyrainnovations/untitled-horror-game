// The front door, for real: STORY.md, Part 2, beat 10, the loud scare.
//
// Straight after the second tape, the same hammering comes from his own
// front door, down the corridor behind him. It keeps on until he walks up
// to it, and then stops. Through the peephole: an empty, black landing.
// Nobody. (It is Hamza, a year ago, the night he could not get in.)
//
// HOW TO CHANGE THINGS
//   The rhythm of the hammering is BURSTS and BETWEEN. How near the player
//   has to come before it stops is STOPS_AT. How long the look through the
//   peephole lasts is LOOKING.

// Each burst is a few blows, at these seconds from its first.
const BURSTS = [
  [0, 0.32, 0.62, 0.9],
  [0, 0.28, 0.55],
  [0, 0.3, 0.58, 0.86, 1.12],
];
const BETWEEN = 2.0; // seconds of quiet between bursts, at least
const STOPS_AT = 2.6; // metres from the door: come this close and it stops
const LOOKING = 2.8; // seconds with an eye to the peephole
const PEEPHOLE = [-0.4, 1.52, -0.034]; // where it is on the door, measured from the hinge
const OUTSIDE = [4.95, 1.52, 12.3]; // where the eye is, in effect, while looking through it
const WIDE = 100; // the peephole's lens sees wide: degrees

export function createDoor({ apartment, camera, player, settings, interact, audio, onLooked }) {
  const door = apartment.things.frontDoor;
  const home = { turn: door.rotation.y, z: door.position.z };
  const at = [door.position.x + PEEPHOLE[0], PEEPHOLE[1], door.position.z + PEEPHOLE[2]];

  let stage = 'quiet'; // 'quiet', 'hammering', 'stopped', 'looking', 'done'
  let burst = 0; // which burst
  let blow = 0; // which blow in it
  let wait = 0; // seconds until the next blow
  let shake = 0; // how hard the door is shaking: 0 to 1
  let looked = 0; // seconds spent looking through the peephole
  let hammered = 0; // seconds since the hammering began

  // What the eye sees round the lens: everything but a circle is black.
  const ring = document.createElement('div');
  ring.className = 'peephole';
  ring.hidden = true;
  document.body.appendChild(ring);

  interact.add({
    at,
    look: 0.2,
    prompt: () => (stage === 'stopped' ? 'Look through the peephole' : null),
    use: look,
  });

  function start() {
    stage = 'hammering';
    burst = 0;
    blow = 0;
    wait = 0.15;
    hammered = 0;
  }

  // How far the player stands from the door, on the plan. While sat at the
  // desk, that is a long way.
  const distance = () => Math.hypot(player.state.x - (door.position.x - 0.4), player.state.z - door.position.z);

  function update(dt, sitting) {
    if (stage === 'hammering') {
      hammered += dt;
      if (!sitting && distance() < STOPS_AT) {
        // He is at the door. It stops, mid-burst.
        stage = 'stopped';
      } else {
        wait -= dt;
        if (wait <= 0) {
          audio.knock('door', door.position.x - 0.4, door.position.z);
          apartment.cutBulb(0.09);
          shake = 1;
          const pattern = BURSTS[burst % BURSTS.length];
          blow += 1;
          if (blow < pattern.length) wait = pattern[blow] - pattern[blow - 1];
          else {
            burst += 1;
            blow = 0;
            wait = BETWEEN + Math.random() * 0.9;
          }
        }
      }
    }
    // Bolted, it can only rattle in its frame. (Only touched while it is
    // being hammered on: the rubbish chore swings this same door.)
    if (stage === 'hammering' || shake > 0) {
      shake = Math.max(0, shake - dt * 8);
      door.rotation.y = home.turn - shake * 0.011 * (0.4 + Math.random() * 0.6);
      door.position.z = home.z - shake * 0.005;
    }

    if (stage === 'looking') {
      looked += dt;
      camera.position.set(...OUTSIDE);
      camera.rotation.set(0, Math.PI, 0);
      if (looked >= LOOKING) {
        stage = 'done';
        ring.hidden = true;
        camera.fov = settings.get('fieldOfView');
        camera.updateProjectionMatrix();
        onLooked();
      }
    }
  }

  function look() {
    stage = 'looking';
    looked = 0;
    ring.hidden = false;
    camera.fov = WIDE;
    camera.updateProjectionMatrix();
    audio.act('phoneUp'); // a soft knock of the forehead against the door
  }

  function reset() {
    stage = 'quiet';
    shake = 0;
    door.rotation.y = home.turn;
    door.position.z = home.z;
    ring.hidden = true;
  }

  return {
    start,
    update,
    reset,
    isLooking: () => stage === 'looking',
    isHammering: () => stage === 'hammering',
    hammeredFor: () => hammered,
    state: () => ({ stage, burst, shake: +shake.toFixed(2), looked: +looked.toFixed(2), away: +distance().toFixed(2) }),
  };
}
