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
//   moves   what moves on the tape, and when. Only the bag, so far.
//   reply   the message that comes in once the moment is marked (STORY.md,
//           "Between clips").
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
      { date: 'AUG 02 2027', shows: [], lights: 0, colour: 0, static: 1 },
      { date: 'APR 19 2027', shows: ['hallByDoor'], lights: 0, colour: 0.06, static: 0.72 },
      { date: 'JAN 07 2027', shows: ['hallByDoor', 'hallWalls', 'rooms'], lights: 0, colour: 0.2, static: 0.42 },
      { date: 'NOV 16 2026', shows: ['hallByDoor', 'hallWalls', 'rooms', 'bulb'], lights: 1, colour: 0.85, static: 0 },
    ],
    // The bag comes out of the kitchen on its own and slides down the
    // corridor to the front door. [x, z, turn] at the start, the bend and the end.
    moves: [{ thing: 'bag', from: [3.85, 10.2, 0.5], bend: [4.5, 9.75], to: [4.74, 11.62, 1.3] }],
    reply: "That's it. That's exactly it. Keep going.",
  },
];
