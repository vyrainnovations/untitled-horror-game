// What is on each tape: STORY.md, Part 2, beats 7 and 8 (and, later, 9 to 14).
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
//   moment  when it goes wrong: from and to, in seconds of tape.
//   past    the steps back in time. The tape starts on the first; each time
//           the player scrubs back over the moment it moves on to the next.
//     date    the date burnt into the corner
//     shows   which of his things are back (the sets are named in src/footage.js)
//     lights  how much of the flat's own lighting is on: 0 none, 1 all of it
//     colour  0 is the camera's black and white night picture, 1 full colour
//     static  how much of the moment is still lost in static when scrubbing
//             back over it: 1 all of it, 0 none. Playing forward, it is
//             always lost.
//   moves   what moves on the tape, during the moment.
//   jumpsOn after the moment is marked, the tape jumps on by itself to this
//           time and plays for so many seconds. knocks: when something
//           hammers on the door in it, in seconds from the jump.
//   reply   the message that comes in once the moment is marked (STORY.md,
//           "Between clips").
//
// The dates a tape steps back through are the dates of Hamza's messages in
// the thread at the end (STORY.md), where there is one that fits, so that
// they click when the player reads it. All the tapes agree about the flat
// on each date (rule 2: the tape shows what is really there):
//   NOV 16 2026  the night: everything there, the lights on
//   NOV 23 2026  everything there, dark; the door frame split
//   FEB 14 2027  cleared, except the doormat and the shoe rack
//   APR 19 2027  the same
//   JUN 09 2027  empty, and from then on
export const CLIPS = [
  {
    file: 'clip_01.mov',
    // In the corridor, between the bathroom and store room doors, looking
    // down to the front door. The kitchen archway is on the right.
    camera: { at: [5.36, 1.52, 6.3], look: [4.86, 0.78, 11.9], fov: 46 },
    length: 24,
    clock: [0, 39, 58],
    moment: { from: 11.6, to: 14.2 },
    past: [
      { date: 'AUG 02 2027', shows: ['splitWood'], lights: 0, colour: 0, static: 1 },
      { date: 'APR 19 2027', shows: ['splitWood', 'hallByDoor'], lights: 0, colour: 0.06, static: 0.72 },
      { date: 'NOV 23 2026', shows: ['splitWood', 'hallByDoor', 'hallWalls', 'rooms'], lights: 0, colour: 0.2, static: 0.42 },
      { date: 'NOV 16 2026', shows: ['hallByDoor', 'hallWalls', 'rooms', 'bulb'], lights: 1, colour: 0.85, static: 0 },
    ],
    // The bag comes out of the kitchen on its own and slides down the
    // corridor to the front door. [x, z, turn] at the start, the bend and the end.
    moves: [{ thing: 'bag', from: [3.85, 10.2, 0.5], bend: [4.5, 9.75], to: [4.74, 11.62, 1.3] }],
    reply: "That's it. That's exactly it. Keep going.",
  },
  {
    file: 'clip_02.mov',
    // Close on the front door, from the lock side, looking up at the bolt.
    camera: { at: [5.05, 1.72, 10.55], look: [4.82, 1.55, 11.97], fov: 44 },
    length: 24,
    clock: [0, 40, 47],
    moment: { from: 12.6, to: 14.0 },
    // The frame round the lock was split the night it was forced: on every
    // tape after it, whole again only on the night itself.
    past: [
      { date: 'JUN 09 2027', shows: ['splitWood'], lights: 0, colour: 0, static: 1 },
      { date: 'FEB 14 2027', shows: ['splitWood', 'hallByDoor'], lights: 0, colour: 0.06, static: 0.72 },
      { date: 'NOV 23 2026', shows: ['splitWood', 'hallByDoor', 'hallWalls', 'rooms'], lights: 0, colour: 0.2, static: 0.42 },
      { date: 'NOV 16 2026', shows: ['hallByDoor', 'hallWalls', 'rooms', 'bulb'], lights: 1, colour: 0.85, static: 0 },
    ],
    // The bolt slides across by itself, into the frame: from open to shut, in metres.
    moves: [{ thing: 'bolt', from: 0, to: -0.085 }],
    // Then the tape jumps on to 3:07 and something hammers on the door from outside.
    jumpsOn: { clock: [3, 7, 2], seconds: 5.5, knocks: [0.7, 1.0, 1.3, 2.7, 3.0, 3.3, 3.6, 4.6] },
    reply: 'That bolt. I have thought about that bolt every day.',
  },
];
