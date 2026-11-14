// What is on each tape: STORY.md, Part 2, beats 7 to 14.
//
// Every clip is a locked-off shot of the flat at night, filmed by Hamza's
// camera on its tripod a year after the night itself. Something goes wrong
// in it, but when the tape plays, that moment is lost in static. Scrubbing
// back over it takes the tape one step further into the past each time:
// the date in the corner is earlier, more of Saad's things are back, and
// the static thins. When the moment can be seen, the player marks it.
//
// HOW TO CHANGE THINGS
//   camera  where the camera stands, the spot it points at, and how wide it
//           sees (degrees, top to bottom). [x, y, z] on the plan in src/plan.js.
//   length  seconds of tape.
//   clock   the time burnt into the corner at the first frame: [h, m, s].
//   moment  when it goes wrong: from and to, in seconds of tape. A different
//           place on every tape, so that it has to be looked for.
//   dropouts  seconds of tape where the picture drops out for a moment: a
//           worn tape, nothing more. Nothing is hidden under these, and they
//           never clear. Keep them well away from the moment.
//   past    the steps back in time. The tape starts on the first; each time
//           the player scrubs back over the moment it moves on to the next.
//     date    the date burnt into the corner. What of his is in the flat on
//             that date comes from FLAT, below.
//     lights  how much of the flat's own lighting is on: 0 none, 1 all of it
//     colour  0 is the camera's black and white night picture, 1 full colour
//     static  how much of the moment is still lost in static when scrubbing
//             back over it: 1 all of it, 0 none. Playing forward, it is
//             always lost.
//     flame   what the gas ring does in the moment, if anything: 'lights'
//             (by itself) or 'dies' (the chai boils over and puts it out)
//     adds    more of his things, on top of what FLAT says for the date
//     hamza   where Hamza is, and how: a pose from src/figures.js, the spot
//             [x, z] on the plan, and the way he faces (radians: 0 faces
//             south, -1.57 west, 3.14 north). torch: his head torch is on.
//     saad    where Saad is, the same way: the pale figure a camera catches
//             when he stands still (STORY.md, rule 4). On each of the first
//             three tapes he is there on one pass and gone on the next.
//             true is short for the night itself: asleep at his desk.
//   moves   what else moves on the tape, during the moment.
//   jumpsOn after the moment is marked, the tape jumps on by itself to this
//           time and plays for so many seconds. knocks: when something
//           hammers on the door in it, in seconds from the jump.
//   reply   the messages that come in, one after another, once the moment
//           is marked (STORY.md, "Between clips"). Flat and exact: the
//           client does not sound like a person.
//   hiss    true if marking it puts the real ring out: the chai has boiled
//           over in the real kitchen too, and from then on the gas hisses.
//   live    the last tape: it is being filmed now. Its time runs whatever
//           the tape is doing, it never has static, and there is nothing to
//           mark: it ends by itself once it has gone all the way back.
//   torch   on the live tape, after the night: one more step, tonight
//           again. Hamza has straightened up and turned to the camera, and
//           his torch is on. The picture burns out to white.
//
// The dates a tape steps back through are the dates of Hamza's messages in
// the thread at the end (STORY.md), where there is one that fits, so that
// they click when the player reads it.

// What of Saad's is in the flat on each date. Every tape reads this, so they
// all agree (rule 2: the tape shows what is really there). The sets are
// named in src/footage.js.
const FLAT = {
  // The night itself: everything there, the pan of chai on the hob, the lights on.
  'NOV 16 2026': ['hallByDoor', 'hallWalls', 'study', 'rooms', 'kitchen', 'chaiPan', 'spareChair', 'bulb'],
  // A week on: everything still there except the pan, dark. The door frame was forced that night.
  'NOV 23 2026': ['splitWood', 'hallByDoor', 'hallWalls', 'study', 'rooms', 'kitchen', 'spareChair'],
  // Cleared, except the doormat and the shoe rack.
  'FEB 14 2027': ['splitWood', 'hallByDoor'],
  'APR 19 2027': ['splitWood', 'hallByDoor'],
  // Empty, from here on.
  'JUN 09 2027': ['splitWood'],
  'AUG 02 2027': ['splitWood'],
  'OCT 30 2027': ['splitWood'],
  // Tonight, a year on: empty, but for the chair in the spare room where Hamza sits.
  'NOV 16 2027': ['splitWood', 'spareChair'],
};

// Saad at his desk, working: where the player is sitting.
const AT_DESK = { pose: 'work', at: [2.5, 1.2], facing: Math.PI };

export const CLIPS = [
  {
    file: 'clip_01.mov',
    // In the corridor, between the bathroom and store room doors, looking
    // down to the front door. The kitchen archway is on the right.
    camera: { at: [5.36, 1.52, 6.3], look: [4.86, 0.78, 11.9], fov: 46 },
    length: 24,
    clock: [0, 39, 50],
    moment: { from: 17.0, to: 19.6 }, // late in the tape
    dropouts: [4.3, 11.2],
    past: [
      { date: 'AUG 02 2027', lights: 0, colour: 0, static: 1 },
      // On this pass he is standing at the far end, by the front door,
      // dead still, facing the camera. On the next he is gone.
      { date: 'APR 19 2027', lights: 0, colour: 0.06, static: 0.72, saad: { pose: 'stand', at: [4.95, 11.2], facing: Math.PI } },
      { date: 'NOV 23 2026', lights: 0, colour: 0.2, static: 0.42 },
      { date: 'NOV 16 2026', lights: 1, colour: 0.85, static: 0 },
    ],
    // The bag comes out of the kitchen on its own and slides down the
    // corridor to the front door. [x, z, turn] at the start, the bend and the end.
    moves: [{ thing: 'bag', from: [3.85, 10.2, 0.5], bend: [4.5, 9.75], to: [4.74, 11.62, 1.3] }],
    reply: ['Correct. Next file.'],
  },
  {
    file: 'clip_02.mov',
    // Close on the front door, from the lock side, looking up at the bolt.
    camera: { at: [5.05, 1.72, 10.55], look: [4.82, 1.55, 11.97], fov: 44 },
    length: 24,
    clock: [0, 40, 55],
    moment: { from: 4.8, to: 6.2 }, // near the start
    dropouts: [11.6, 19.3],
    // The frame round the lock was split the night it was forced: on every
    // tape after it, whole again only on the night itself.
    past: [
      { date: 'JUN 09 2027', lights: 0, colour: 0, static: 1 },
      { date: 'FEB 14 2027', lights: 0, colour: 0.06, static: 0.72 },
      // On this pass he is right there, a metre from the lens, his back to
      // the camera, facing the door.
      { date: 'NOV 23 2026', lights: 0, colour: 0.2, static: 0.42, saad: { pose: 'stand', at: [4.76, 11.68], facing: 0 } },
      { date: 'NOV 16 2026', lights: 1, colour: 0.85, static: 0 },
    ],
    // The bolt slides across by itself, into the frame: from open to shut, in metres.
    moves: [{ thing: 'bolt', from: 0, to: -0.085 }],
    // Then the tape jumps on to 3:07 and something hammers on the door from outside.
    jumpsOn: { clock: [3, 7, 2], seconds: 5.5, knocks: [0.7, 1.0, 1.3, 2.7, 3.0, 3.3, 3.6, 4.6] },
    reply: ['Correct. I heard you go to the door.'],
  },
  {
    file: 'clip_03.mov',
    // In the kitchen, on the far side of the worktop, looking down at the hob.
    camera: { at: [2.25, 1.6, 10.5], look: [1.52, 0.98, 11.66], fov: 46 },
    length: 24,
    clock: [1, 9, 49],
    moment: { from: 10.4, to: 12.8 }, // in the middle
    dropouts: [3.2, 18.6],
    // A year on, a ring lights by itself on an empty hob. On the night, the
    // pan of chai has been on it since 01:00: it boils over, and the flame dies.
    past: [
      { date: 'OCT 30 2027', lights: 0, colour: 0, static: 1, flame: 'lights' },
      // On this pass he is at the hob, bent over it, looking down at the
      // ring: waiting for it to boil, as he has been for a year.
      { date: 'FEB 14 2027', lights: 0, colour: 0.06, static: 0.72, flame: 'lights', saad: { pose: 'bend', at: [1.12, 11.05], facing: 0.3 } },
      { date: 'NOV 23 2026', lights: 0, colour: 0.2, static: 0.42, flame: 'lights' },
      { date: 'NOV 16 2026', lights: 1, colour: 0.85, static: 0, flame: 'dies' },
    ],
    moves: [],
    reply: ['1:10. Correct.', 'One more file. This one is live.'],
    hiss: true,
  },
  {
    file: 'clip_04.mov',
    // From the tripod by the study window, east through the study door and
    // the spare room door opposite, with the desk and its monitor on the left.
    camera: { at: [0.6, 1.5, 2.3], look: [3.6, 1.05, 1.1], fov: 60 },
    length: 24,
    clock: [3, 7, 0], // for the last step only: before it, the time is tonight's, live
    live: true,
    moment: { from: 1.5, to: 24 }, // every scrub back after the first second and a half is a step
    // Tonight, live: an empty room, and in it somebody sitting at a desk
    // that is not there, hands out in front of him: the player, as the
    // camera sees him. Far off, through two doorways, someone else in the
    // chair in the spare room. Each scrub back, his things are back in the
    // study and Hamza is nearer, until he is bending to look at the screen.
    // Then all the way back: the night, and Saad asleep.
    past: [
      { date: 'NOV 16 2027', lights: 0, colour: 0, static: 0, saad: AT_DESK, hamza: { pose: 'sit', at: [7.62, 2.05], facing: -1.57 } },
      { date: 'NOV 16 2027', adds: ['study'], lights: 0, colour: 0, static: 0, saad: AT_DESK, hamza: { pose: 'stand', at: [5.95, 2.15], facing: -1.57 } },
      { date: 'NOV 16 2027', adds: ['study'], lights: 0, colour: 0, static: 0, saad: AT_DESK, hamza: { pose: 'stand', at: [4.95, 2.15], facing: -1.57 } },
      { date: 'NOV 16 2027', adds: ['study'], lights: 0, colour: 0, static: 0, saad: AT_DESK, hamza: { pose: 'stand', at: [4.05, 2.15], facing: -1.57 } },
      { date: 'NOV 16 2027', adds: ['study'], lights: 0, colour: 0, static: 0, saad: AT_DESK, hamza: { pose: 'bend', at: [3.05, 0.98], facing: -2.49 } },
      { date: 'NOV 16 2026', lights: 1, colour: 0.85, static: 0, saad: true },
    ],
    // And then, tonight again: he has straightened up and turned to the
    // camera, and his torch is on.
    torch: { date: 'NOV 16 2027', adds: ['study'], lights: 0, colour: 0, static: 0, saad: AT_DESK, hamza: { pose: 'stand', at: [3.1, 1.15], facing: -1.14, torch: true } },
    moves: [],
    reply: [],
  },
];

// The last shot (STORY.md, beat 18), played full screen by src/ending.js
// once the front door is open: the empty flat tonight, the door standing
// open with light coming through it, and Hamza in the corridor looking at
// it, a figure against a lit doorway. Its camera's own lamp is turned down
// (lamp), so that he stands dark against the light.
export const LAST_SHOT = {
  file: 'the last shot',
  camera: { at: [5.3, 1.55, 6.0], look: [4.93, 1.05, 11.95], fov: 44 },
  length: 10,
  clock: [3, 7, 52],
  moment: { from: 0, to: 1 },
  past: [{ date: 'NOV 16 2027', lights: 0, lamp: 0.18, colour: 0.6, static: 0, hamza: { pose: 'stand', at: [4.93, 10.2], facing: 0 } }],
  moves: [],
};

for (const clip of [...CLIPS, LAST_SHOT]) {
  for (const step of [...clip.past, ...(clip.torch ? [clip.torch] : [])]) step.shows = FLAT[step.date].concat(step.adds || []);
}
