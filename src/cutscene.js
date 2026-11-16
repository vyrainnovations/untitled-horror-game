// The cutscene: STORY.md, Part 4, beat 20. Where it clicks.
//
// The tape, on the whole screen, cut fast to the finale's music, with
// Hamza's words as subtitles. All of it is tape, because the tape shows
// what is really there: the man with the light switches it off and is only
// a man; one year ago tonight, the bolt, the chai, the flame going out, the
// headphones, the hammering, 3:07; every night since, the rubbish, the
// bolt, the chai; the figure on the tapes is you.
//
// Eshan asked for this in place of the thread of old messages, which he
// found hard to follow: "cinematics with subtitles for story telling ...
// where we make everything click", and "fast paced when its all ending".
//
// HOW TO CHANGE THINGS
//   SHOTS is the whole thing, in order. For each shot:
//     says     the subtitle. Keep them short: one thought, plain words.
//     beats    how long it lasts, in beats of the music (BEAT seconds each),
//              so that the cuts land on the beat. Or seconds, before the
//              music has started.
//     black    no picture
//     tape     a shot from one of the tapes in src/clips.js: [which clip
//              (0 is the first), which step into the past, from which
//              second of tape, to which]
//     camera, look   or a shot of its own: where the camera is, and what
//              the flat is like (the same things a step in src/clips.js says)
//     push     the camera moves across the shot, from where it is to here
//     clock    the time burnt into the corner as the shot starts: [h, m, s]
//     music    how many layers of the finale play from this shot on (1 to
//              3); 0 stops it
//     knocks   seconds into the shot when the front door is hammered on
//     torchOff how far through the shot (0 to 1) his torch goes out
//     walk     he walks from one spot to another across the shot
import { CLIPS, LAST_SHOT, flat } from './clips.js';

const BEAT = 60 / 138; // the finale's beat, in seconds (its tempo is in src/audio.js)
const CUT = 0.14; // seconds the picture rolls at each cut

// The flat tonight, a year on: emptied, dark, the camera's own lamp.
const tonight = (more = {}) => ({ date: 'NOV 16 2027', lights: 0, colour: 0, static: 0, shows: flat('NOV 16 2027'), ...more });
// And on the night itself: everything of his in it, the lights on, in colour.
const thatNight = (more = {}) => ({ date: 'NOV 16 2026', lights: 1, colour: 0.85, static: 0, shows: flat('NOV 16 2026'), ...more });
const still = { moment: { from: 0, to: 1 }, moves: [] }; // a shot in which nothing is moved

const UP_THE_CORRIDOR = { at: [4.95, 1.5, 10.8], look: [4.95, 1.3, 4], fov: 50 }; // from by the front door
const THE_STUDY = CLIPS[3].camera; // from the tripod
const AT_DESK = { pose: 'work', at: [2.5, 1.2], facing: Math.PI };

const SHOTS = [
  { seconds: 2.0, black: true, says: 'Saad.' },
  // The thing with the light, in the corridor. The light goes out. A man.
  { seconds: 3.8, says: "It's me. Hamza.", camera: UP_THE_CORRIDOR, look: tonight({ hamza: { pose: 'stand', at: [4.95, 7.7], facing: 0 } }), torchOff: 0.45, clock: [3, 7, 31] },
  { seconds: 3.6, says: 'We lived here together. Then I left.', camera: { at: [6.0, 1.55, 0.45], look: [8.4, 0.6, 2.7], fov: 56 }, look: thatNight(), clock: [0, 12, 4] },
  { seconds: 3.8, says: 'I was the client. It was the only way you would answer.', camera: { at: [2.78, 1.16, 1.1], look: [3.1, 0.76, 0.56], fov: 34 }, look: thatNight({ phone: true }), clock: [1, 4, 9] },
  // One year ago tonight. The music starts.
  { beats: 8, says: 'One year ago tonight, you bolted the door.', tape: [1, 3, 3.9, 6.9], music: 1 },
  { beats: 8, says: 'You put chai on the stove. You forgot it.', tape: [2, 3, 5.6, 9] },
  { beats: 8, says: 'The flame went out. The gas kept coming.', tape: [2, 3, 10.3, 13.6] },
  { beats: 7, says: 'You were working. Headphones on.', camera: THE_STUDY, look: thatNight({ saad: AT_DESK }), clock: [2, 14, 20], music: 2 },
  { beats: 8, says: 'I came back. I knocked. I shouted.', tape: [1, 3, 24, 24], clock: [3, 7, 2], knocks: [0.25, 0.55, 0.85, 1.5, 1.8, 2.1, 2.4, 3.0] },
  { beats: 6, says: 'You never heard me.', camera: THE_STUDY, look: thatNight({ saad: true }), clock: [3, 7, 20] },
  { beats: 8, says: 'You died at 3:07.', camera: THE_STUDY, push: { at: [1.3, 1.42, 1.98], look: [3.0, 0.95, 0.85] }, look: thatNight({ saad: true }), clock: [3, 7, 52] },
  // Every night since. Faster.
  { beats: 6, says: 'Every night since, you do it all again.', tape: [0, 0, 16.6, 19.4], music: 3 },
  { beats: 3, says: 'The rubbish.', tape: [0, 0, 20.4, 21.6] },
  { beats: 3, says: 'The bolt.', tape: [1, 0, 4.9, 6.2] },
  { beats: 3, says: 'The chai.', tape: [2, 0, 11.3, 12.7] },
  { beats: 4, says: 'The figure on the tapes', tape: [0, 1, 21, 22.6] },
  { beats: 5, says: 'is you.', tape: [3, 0, 2, 4] },
  { beats: 8, says: 'I was not hunting you. I was looking for you.', camera: UP_THE_CORRIDOR, look: tonight({ hamza: { pose: 'stand', at: [4.95, 5.2], facing: 0, torch: true } }), walk: [[4.95, 4.6], [4.95, 7.9]], clock: [3, 7, 44] },
  { beats: 6, says: 'It is still 3:07 in there.', camera: LAST_SHOT.camera, look: tonight(), clock: [3, 7, 57], music: 1 },
  { beats: 8, black: true, says: 'Turn off the gas. Open the door.' },
];

const pad2 = (n) => String(Math.floor(n)).padStart(2, '0');

// show(on) puts the tape on the whole screen, or takes it off; picture(on)
// is whether there is a picture or only black.
export function createCutscene({ footage, audio, show, picture, onDone }) {
  // The subtitle: one line, low on the screen.
  const line = document.createElement('p');
  line.className = 'subtitle';
  line.hidden = true;
  document.body.appendChild(line);

  let index = -1; // the shot that is on. -1: not running
  let time = 0; // seconds into it
  let total = 0; // seconds into the whole thing: for the tape's grain
  let roll = 0; // the picture rolling, just after a cut
  let knocked = 0; // how many of the shot's knocks have sounded
  let shake = 0; // how hard the door is shaking

  const lengthOf = (shot) => (shot.beats ? shot.beats * BEAT : shot.seconds);

  function cutTo(i) {
    index = i;
    time = 0;
    knocked = 0;
    shake = 0;
    roll = CUT;
    const shot = SHOTS[i];
    if (!shot) return finish();
    line.textContent = shot.says || '';
    line.hidden = !shot.says;
    picture(!shot.black);
    if (shot.music !== undefined) audio.music(shot.music ? 'finale' : null, { level: shot.music, fade: 0.05 });
  }

  function start() {
    total = 0;
    footage.sharp(true);
    show(true);
    audio.setTension(0.25, 2);
    cutTo(0);
  }

  function finish() {
    index = -1;
    line.hidden = true;
    footage.sharp(false);
    show(false);
    onDone();
  }

  // What the flat is like at this moment of a shot: its own look, with
  // whoever is moving in it moved on.
  function lookNow(shot, k) {
    if (shot.tape) return CLIPS[shot.tape[0]].past[shot.tape[1]];
    if (!shot.torchOff && !shot.walk) return shot.look;
    const hamza = { ...shot.look.hamza };
    if (shot.torchOff) hamza.torch = k < shot.torchOff;
    if (shot.walk) {
      const [from, to] = shot.walk;
      hamza.at = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
      hamza.stride = (Math.hypot(to[0] - from[0], to[1] - from[1]) * k / 0.72) * Math.PI;
    }
    return { ...shot.look, hamza };
  }

  // Where the camera is: still, or part of the way through a push in.
  function cameraAt(shot, k) {
    if (!shot.push) return shot.camera;
    const e = k * k * (3 - 2 * k);
    const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * e);
    return { at: mix(shot.camera.at, shot.push.at), look: mix(shot.camera.look, shot.push.look), fov: shot.camera.fov };
  }

  // The second of tape a shot is at.
  const tapeAt = (shot, k) => (shot.tape ? shot.tape[2] + (shot.tape[3] - shot.tape[2]) * k : 0);

  // The time burnt into the corner: the shot's own clock, or the tape's.
  function clockAt(shot, k) {
    const clip = shot.tape ? CLIPS[shot.tape[0]] : null;
    const [h, m, s] = shot.clock || clip.clock;
    const total = h * 3600 + m * 60 + s + Math.floor(shot.clock ? time : tapeAt(shot, k));
    return `${pad2(total / 3600)}:${pad2((total / 60) % 60)}:${pad2(total % 60)}`;
  }

  function update(dt) {
    if (index < 0) return;
    time += dt;
    total += dt;
    roll = Math.max(0, roll - dt);
    let shot = SHOTS[index];
    if (time >= lengthOf(shot)) {
      cutTo(index + 1);
      if (index < 0) return;
      shot = SHOTS[index];
    }
    const k = Math.min(1, time / lengthOf(shot));
    // The front door, hammered on.
    while (shot.knocks && knocked < shot.knocks.length && time >= shot.knocks[knocked]) {
      audio.knock('tape');
      knocked += 1;
    }
    shake = 0;
    for (const at of shot.knocks || []) if (time >= at) shake += Math.exp(-(time - at) * 14);
    shake = Math.min(1, shake);
    if (shot.torchOff && time - dt < lengthOf(shot) * shot.torchOff && time >= lengthOf(shot) * shot.torchOff) audio.act('torch');
    if (shot.black) return;
    const look = lookNow(shot, k);
    footage.set({ time: total, colour: look.colour, jump: roll / CUT });
    footage.caption('PLAY', look.date, clockAt(shot, k));
  }

  // Draw the shot into the tape's picture.
  function film() {
    const shot = SHOTS[index];
    if (!shot || shot.black) return;
    const k = Math.min(1, time / lengthOf(shot));
    const clip = shot.tape ? CLIPS[shot.tape[0]] : { ...still, camera: cameraAt(shot, k) };
    footage.film(clip, tapeAt(shot, k), lookNow(shot, k), shake);
  }

  function reset() {
    if (index >= 0) {
      footage.sharp(false);
      show(false);
    }
    index = -1;
    line.hidden = true;
  }

  return {
    start,
    update,
    film,
    reset,
    isOn: () => index >= 0,
    // For tests.
    shots: SHOTS,
    state: () => ({ shot: index, of: SHOTS.length, time: +time.toFixed(2), says: index >= 0 ? SHOTS[index].says : null, black: index >= 0 ? !!SHOTS[index].black : null, subtitle: line.hidden ? null : line.textContent }),
  };
}
