// The editing program on the PC in the study: STORY.md, Part 2, beat 7,
// "How the edit works".
//
// The monitor shows the program: the list of files, the tape in the
// middle, the timecode and a timeline underneath. The tape itself comes from
// src/footage.js; what is on each one is in src/clips.js.
//
// The controls, while sat at the desk looking at the screen:
//   Space   play or pause
//   A / D   hold to scrub back or forward (the arrow keys work too)
//   E       mark the frame on the screen
//
// The rule that makes the game: playing forward, the moment something goes
// wrong is lost in static. Scrubbing back over it takes the tape one step
// further into the past (see "past" in src/clips.js), and the static thins,
// until the moment can be seen and marked.
import * as THREE from 'three';
import { CLIPS } from './clips.js';

const FPS = 25; // frames in a second of tape
const SCRUB = { slow: 0.6, fast: 4, ramp: 1.2 }; // scrubbing speed, from a tap to a long hold (times normal), and seconds to get there
const JUMP = 0.45; // seconds the picture takes to roll when the tape jumps back in time
const PAD = 0.35; // seconds of static either side of the moment
const CLEAR = 0.3; // the static has to be thinner than this for the moment to be marked

// The monitor in the study (src/rooms/study.js): its middle and its size.
const MONITOR = { x: 2.5, y: 1.05, z: 0.257, w: 0.6, h: 0.34 };
// The program's picture, and where on it the tape is shown. Pixels.
const UI = [1020, 578];
const VIEWER = { x: 243, y: 42, w: 534, h: 400 };

const COLOURS = {
  back: '#0e1218',
  panel: '#151a22',
  line: '#232a35',
  words: '#c9ccd2',
  dim: '#6d7480',
  lamp: '#e8943a',
  damage: '#7a2b25',
};
const WORDS = '"Bahnschrift", "Arial Narrow", "Liberation Sans Narrow", sans-serif';
const DIGITS = '"Cascadia Mono", Consolas, "Courier New", monospace';

const pad2 = (n) => String(Math.floor(n)).padStart(2, '0');

export function createEditor({ scene, footage, audio, hud, onMarked, onTapeEnd }) {
  // --- The program on the monitor ----------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.width = UI[0];
  canvas.height = UI[1];
  const paint = canvas.getContext('2d');
  const picture = new THREE.CanvasTexture(canvas);
  picture.colorSpace = THREE.SRGBColorSpace;
  picture.anisotropy = 4;

  const screen = new THREE.Group();
  screen.position.set(MONITOR.x, MONITOR.y, MONITOR.z + 0.0006);
  const program = new THREE.Mesh(new THREE.PlaneGeometry(MONITOR.w, MONITOR.h), new THREE.MeshBasicMaterial({ map: picture, fog: false }));
  const perPixel = MONITOR.w / UI[0];
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(VIEWER.w * perPixel, VIEWER.h * perPixel), footage.material);
  tape.position.set((VIEWER.x + VIEWER.w / 2 - UI[0] / 2) * perPixel, (UI[1] / 2 - VIEWER.y - VIEWER.h / 2) * perPixel, 0.0004);
  screen.add(program, tape);
  screen.visible = false;
  scene.add(screen);

  // --- Where the edit has got to ---------------------------------------------------------
  let clip = null; // the clip that is loaded
  let index = -1;
  let t = 0; // seconds into the tape
  let playing = false;
  let scrub = 0; // -1 scrubbing back, 1 forward, 0 not
  let held = 0; // seconds the scrub key has been held
  let depth = 0; // how many steps into the past the tape has gone
  let lastWay = 1; // the way the tape last moved: 1 forward, -1 back
  let jump = 0; // the picture rolling, after a jump back in time
  let marked = null; // the second of tape that was marked
  let damageSeen = false; // has the static been seen yet: then the timeline shows where it is
  let clock = 0; // seconds since the program was opened: for the grain
  let drawn = ''; // what the program's picture last showed
  let active = false; // is the player sat at it, looking at it
  let jumped = null; // after a mark, a tape that jumps on by itself: { time, knocked }
  let ended = false; // the tape has run out: the screen shows a blank blue
  const marks = []; // every file marked so far

  function load(i) {
    index = i;
    clip = CLIPS[i];
    t = 0;
    playing = false;
    scrub = 0;
    held = 0;
    depth = 0;
    lastWay = 1;
    jump = 0;
    marked = null;
    damageSeen = false;
    hintTime = 0;
    say = 0;
    jumped = null;
    ended = false;
    screen.visible = true;
    audio.tape('load');
  }

  const moment = () => clip.moment;
  const inMoment = (pad = 0) => t >= moment().from - pad && t <= moment().to + pad;
  // How much static is on the screen right now.
  function staticNow() {
    if (!clip || !inMoment(PAD)) return 0;
    const edge = Math.min(t - (moment().from - PAD), moment().to + PAD - t);
    const fade = Math.min(1, edge / PAD);
    return (lastWay > 0 ? 1 : clip.past[depth].static) * fade;
  }

  // --- The keys -------------------------------------------------------------------------
  const BACK = ['KeyA', 'ArrowLeft'];
  const FORWARD = ['KeyD', 'ArrowRight'];
  const down = new Set();

  function press(code) {
    if (!clip || !active || marked !== null) return false;
    if (code === 'Space') {
      if (t >= clip.length - 0.01) t = 0;
      playing = !playing;
      lastWay = 1;
      audio.tape(playing ? 'play' : 'stop');
      return true;
    }
    if (BACK.includes(code) || FORWARD.includes(code)) {
      down.add(code);
      const way = BACK.includes(code) ? -1 : 1;
      if (scrub !== way) {
        scrub = way;
        held = 0;
        playing = false;
        // Scrubbing back over the moment, or from after it: one step further into the past.
        if (way < 0 && t > moment().from && depth < clip.past.length - 1) {
          depth += 1;
          jump = JUMP;
          audio.tape('jump');
        }
      }
      return true;
    }
    if (code === 'KeyE') {
      mark();
      return true;
    }
    return false;
  }

  function release(code) {
    down.delete(code);
    const back = BACK.some((c) => down.has(c));
    const forward = FORWARD.some((c) => down.has(c));
    if (scrub < 0 && !back) scrub = forward ? 1 : 0;
    else if (scrub > 0 && !forward) scrub = back ? -1 : 0;
  }

  let say = 0; // seconds left that a "not this frame" answer stays up
  function mark() {
    if (!clip || marked !== null) return;
    if (!inMoment()) {
      hud.hint('Nothing goes wrong in this frame.');
      audio.tape('no');
      say = 2.5;
    } else if (staticNow() > CLEAR) {
      hud.hint('Whatever happens here is lost in the static.');
      audio.tape('no');
      say = 2.5;
    } else {
      marked = t;
      playing = false;
      scrub = 0;
      down.clear();
      marks[index] = t;
      hud.hint(null);
      audio.tape('mark');
      onMarked(index, clip);
      if (clip.jumpsOn) {
        // The tape jumps on by itself, past its end.
        jumped = { time: -0.8, knocked: 0 };
      }
    }
  }

  // After a mark: the tape that jumps on by itself, and something hammering
  // on the door in it. Answers how hard the door is shaking (0 to 1).
  function runOn(dt) {
    const after = clip.jumpsOn;
    const before = jumped.time;
    jumped.time += dt;
    if (before < 0 && jumped.time >= 0) {
      t = clip.length;
      jump = JUMP;
      audio.tape('jump');
      playing = true;
    }
    while (jumped.knocked < after.knocks.length && jumped.time >= after.knocks[jumped.knocked]) {
      audio.knock('tape');
      jumped.knocked += 1;
    }
    if (jumped.time >= after.seconds && !ended) {
      ended = true;
      playing = false;
      audio.tape('stop');
      onTapeEnd(index, clip);
    }
    let shake = 0;
    for (const k of after.knocks) if (jumped.time >= k) shake += Math.exp(-(jumped.time - k) * 14);
    return Math.min(1, shake);
  }

  // --- Moving the tape on -----------------------------------------------------------------
  let hintTime = 0;
  function update(dt) {
    if (!clip) return;
    clock += dt;
    jump = Math.max(0, jump - dt);
    const before = t;
    shaking = 0;
    if (jumped) {
      shaking = runOn(dt);
    } else if (scrub !== 0 && marked === null) {
      held += dt;
      const speed = SCRUB.slow + (SCRUB.fast - SCRUB.slow) * Math.min(1, held / SCRUB.ramp) ** 2;
      t = Math.max(0, Math.min(clip.length, t + scrub * speed * dt));
      lastWay = scrub;
    } else if (playing) {
      t = Math.min(clip.length, t + dt);
      lastWay = 1;
      if (t >= clip.length) {
        playing = false;
        audio.tape('stop');
      }
    }
    if (staticNow() > 0.5) damageSeen = true;

    // Hints, for a player who has not worked it out.
    hintTime += dt;
    say = Math.max(0, say - dt);
    if (active && marked === null && say === 0) {
      if (!damageSeen && hintTime > 20) hud.hint('Press Space to play the clip.');
      else if (damageSeen && depth === 0 && t > moment().to && !playing && scrub === 0) hud.hint('Hold A to scrub back over the static.');
      else if (depth > 0 && depth < clip.past.length - 1 && t < moment().from - PAD && !playing && scrub === 0) hud.hint('Go past it, and scrub back over it again.');
      else if (depth === clip.past.length - 1 && inMoment() && staticNow() < CLEAR && scrub === 0) hud.hint('Press E to mark this frame.');
      else if (scrub !== 0 || playing) hud.hint(null);
    }

    const moving = t !== before;
    const snow = staticNow();
    audio.setTape({ motor: playing ? 1 : 0, rewind: scrub < 0 && moving ? 1 : scrub > 0 && moving ? 0.6 : 0, snow: moving ? snow : snow * 0.3 });
    const look = clip.past[depth];
    footage.set({ time: clock, static: snow, colour: look.colour, rewind: scrub < 0 && moving ? 1 : 0, jump: jump / JUMP, on: ended ? 0 : 1 });
    if (ended) footage.caption('', '', '');
    else if (jumped && jumped.time >= 0) footage.caption('PLAY', look.date, timeOnTape(jumped.time, clip.jumpsOn.clock));
    else footage.caption(scrub < 0 ? 'REW' : scrub > 0 ? 'FWD' : playing ? 'PLAY' : 'PAUSE', look.date, timeOnTape(t));
    draw();
  }

  // The time burnt into the corner: the clock at the first frame, plus the tape so far.
  function timeOnTape(seconds, start = clip.clock) {
    const [h, m, s] = start;
    const total = h * 3600 + m * 60 + s + Math.floor(seconds);
    return `${pad2(total / 3600)}:${pad2((total / 60) % 60)}:${pad2(total % 60)}`;
  }
  const timecode = (seconds) => `00:00:${pad2(seconds)}:${pad2((seconds * FPS) % FPS)}`;

  // --- Painting the program ------------------------------------------------------------------
  function draw() {
    const frame = Math.floor(t * FPS);
    const said = [index, frame, playing, scrub, depth, marked, damageSeen].join('|');
    if (said === drawn) return;
    drawn = said;
    const [W, H] = UI;
    const p = paint;
    p.fillStyle = COLOURS.back;
    p.fillRect(0, 0, W, H);
    p.textBaseline = 'alphabetic';

    // The bar along the top.
    p.fillStyle = COLOURS.panel;
    p.fillRect(0, 0, W, 30);
    p.font = `20px ${WORDS}`;
    p.fillStyle = COLOURS.words;
    p.fillText(clip.file, 14, 22);
    p.fillStyle = COLOURS.dim;
    p.textAlign = 'right';
    p.fillText(`clip ${index + 1} of 3`, W - 14, 22);
    p.textAlign = 'left';

    // The files, on the left.
    p.fillStyle = COLOURS.panel;
    p.fillRect(12, VIEWER.y, VIEWER.x - 26, VIEWER.h);
    p.font = `600 18px ${WORDS}`;
    p.fillStyle = COLOURS.dim;
    p.fillText('FILES', 26, VIEWER.y + 30);
    p.font = `21px ${WORDS}`;
    for (let i = 0; i < 3; i++) {
      const y = VIEWER.y + 66 + i * 38;
      if (i === index) {
        p.fillStyle = COLOURS.line;
        p.fillRect(18, y - 25, VIEWER.x - 38, 34);
      }
      p.fillStyle = i === index ? COLOURS.lamp : COLOURS.words;
      p.fillText(`clip_0${i + 1}.mov`, 30, y);
      if (marks[i] !== undefined) {
        p.fillStyle = COLOURS.lamp;
        p.fillText('marked', VIEWER.x - 96, y);
      }
    }

    // The mark, on the right.
    const right = VIEWER.x + VIEWER.w + 14;
    p.fillStyle = COLOURS.panel;
    p.fillRect(right, VIEWER.y, W - right - 12, VIEWER.h);
    p.font = `600 18px ${WORDS}`;
    p.fillStyle = COLOURS.dim;
    p.fillText('MARK', right + 14, VIEWER.y + 30);
    p.font = `24px ${DIGITS}`;
    p.fillStyle = marked !== null ? COLOURS.lamp : COLOURS.dim;
    p.fillText(marked !== null ? timecode(marked).slice(3) : '--:--:--', right + 14, VIEWER.y + 68);

    // Behind the tape.
    p.fillStyle = '#000';
    p.fillRect(VIEWER.x - 2, VIEWER.y - 2, VIEWER.w + 4, VIEWER.h + 4);

    // Under the tape: what the tape is doing, and the timecode.
    const y = VIEWER.y + VIEWER.h + 40;
    p.font = `30px ${DIGITS}`;
    p.fillStyle = COLOURS.words;
    p.textAlign = 'center';
    p.fillText(timecode(t), W / 2, y);
    p.textAlign = 'left';
    p.fillStyle = scrub || playing ? COLOURS.lamp : COLOURS.dim;
    const ix = W / 2 - 150;
    p.beginPath();
    if (playing && !scrub) {
      p.moveTo(ix, y - 22); p.lineTo(ix + 18, y - 11); p.lineTo(ix, y);
    } else if (scrub) {
      for (const dx of [0, 15]) {
        const tip = scrub < 0 ? ix + dx : ix + dx + 15;
        const tail = scrub < 0 ? ix + dx + 15 : ix + dx;
        p.moveTo(tail, y - 22); p.lineTo(tip, y - 11); p.lineTo(tail, y);
      }
    } else {
      p.rect(ix, y - 22, 6, 22);
      p.rect(ix + 11, y - 22, 6, 22);
    }
    p.fill();
    p.fillStyle = COLOURS.dim;
    p.font = `20px ${DIGITS}`;
    p.fillText(`/ ${timecode(clip.length)}`, W / 2 + 128, y - 2);

    // The timeline.
    const left = 40;
    const width = W - 80;
    const top = y + 20;
    const at = (s) => left + (s / clip.length) * width;
    p.fillStyle = COLOURS.panel;
    p.fillRect(left, top, width, 44);
    if (damageSeen) {
      // Once the static has been seen, the timeline shows where the tape is damaged.
      p.fillStyle = COLOURS.damage;
      p.fillRect(at(moment().from - PAD), top + 4, at(moment().to + PAD) - at(moment().from - PAD), 36);
    }
    p.fillStyle = COLOURS.line;
    for (let s = 0; s <= clip.length; s++) p.fillRect(at(s), top + (s % 5 === 0 ? 30 : 36), 2, s % 5 === 0 ? 14 : 8);
    if (marked !== null) {
      p.fillStyle = COLOURS.lamp;
      p.fillRect(at(marked) - 1, top - 10, 3, 54);
      p.fillRect(at(marked), top - 10, 16, 10);
    }
    p.fillStyle = COLOURS.words;
    const head = at(t);
    p.fillRect(head - 1, top - 4, 3, 52);
    p.beginPath();
    p.moveTo(head - 8, top - 12); p.lineTo(head + 9, top - 12); p.lineTo(head + 0.5, top - 3);
    p.fill();
    picture.needsUpdate = true;
  }

  // Draw the tape into its picture. Only needed while someone can see it,
  // and not once the tape has run out.
  let shaking = 0; // how hard the door on the tape is shaking just now
  function film() {
    if (clip && !ended) footage.film(clip, t, depth, shaking);
  }

  function reset() {
    clip = null;
    index = -1;
    t = 0;
    playing = false;
    scrub = 0;
    down.clear();
    marked = null;
    marks.length = 0;
    drawn = '';
    active = false;
    jumped = null;
    ended = false;
    screen.visible = false;
    footage.set({ time: 0, on: 0 });
    audio.setTape({ motor: 0, rewind: 0, snow: 0 });
  }

  return {
    load,
    update,
    film,
    press,
    release,
    reset,
    // The player is sat at the desk looking at the screen (or is not).
    setActive(on) {
      active = on;
      if (!on) {
        down.clear();
        scrub = 0;
      }
    },
    isOn: () => !!clip,
    // For tests: where the edit has got to.
    state: () => ({ clip: index, t: +t.toFixed(2), playing, scrub, depth, marked, damageSeen, static: +staticNow().toFixed(2), active, jumpedOn: jumped ? +jumped.time.toFixed(2) : null, ended }),
  };
}
