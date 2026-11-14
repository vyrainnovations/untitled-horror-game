// The phone in his hand, and the messages on it.
//
//   tonight  STORY.md, Part 2, beat 6, "The unknown number": the job offer.
//   thread   STORY.md, Part 3, beat 15, "The thread": the phone lights up
//            and the thread scrolls up by itself through a year of messages,
//            every one sent at 3:07, back to the night itself and the name.
//
// HOW TO CHANGE THINGS
//   The messages are in TONIGHT, THE_NIGHT, THE_YEAR and LAST, just below,
//   in order. How long the thread lingers on each message is in READ. The
//   look of the screen (sizes, colours) is in LOOK. How long the phone takes
//   to come up and how big it is on the screen are in HAND.
//
// The screen is painted with ordinary 2D drawing onto a picture that is
// wrapped round the phone, so it goes through the same VHS filter as the
// rest of the flat. Everything runs on the game's clock, so it stops while
// the game is paused.
import * as THREE from 'three';
import { CLIPS } from './clips.js';

// --- Tonight's conversation ----------------------------------------------------------
// One line per message, in order.
//   from    'them' (the unknown number) or 'you' (the player)
//   text    the words
//   typing  for 'them': seconds of "typing..." before the message lands.
//           0 means it was already there when he picked the phone up.
//   files   for 'them': files arriving, instead of words
// A 'you' line waits until the player presses E to send it. There are no
// choices: one story, one ending (STORY.md, "The messages").
//
// The client does not sound like a person: short flat sentences, one
// thought each, no feeling, and the same pause before every one (TYPING).
// Each message then stays on its own long enough to be read twice (READ)
// before the next one starts.
const TYPING = 1.2;
const TONIGHT = [
  { from: 'them', text: 'Are you still up?', typing: 0 },
  { from: 'them', text: 'I have a job for you. Video editing. Tonight.', typing: 0 },
  { from: 'you', text: 'Who is this?' },
  { from: 'them', text: 'A client.', typing: TYPING },
  { from: 'them', text: 'There are three video files. In each one, something goes wrong.', typing: TYPING },
  { from: 'them', text: 'Find the moment it goes wrong. Mark it.', typing: TYPING },
  { from: 'them', text: 'Payment is 300,000 rupees. Half is sent now.', typing: TYPING },
  { from: 'you', text: 'Why so much?' }, // short: it has to fit in the box it is typed in
  { from: 'them', text: 'Do not ask questions. Do the work.', typing: TYPING },
  { from: 'them', text: 'Sending the files.', typing: TYPING },
  { from: 'them', files: ['clip_01.mov', 'clip_02.mov', 'clip_03.mov'], typing: TYPING },
];
const WHO = 'Unknown number'; // the name at the top of the thread, until it has one
const NAME = 'Hamza'; // the name it turns out to have
const TIME = '3:07'; // the clock on the phone, and the time on every message tonight

// --- The thread at the end (STORY.md, "The thread at the end") -------------------------
// Oldest first. day: a date across the thread. time: when it was sent.
const THE_NIGHT = [
  { day: '16 Nov 2026' },
  { from: 'them', time: '01:04', text: 'Are you still up?' },
  { from: 'them', time: '01:04', text: "It's Hamza. New number.", named: true },
  { from: 'them', time: '01:07', text: "I'm in town till Thursday. I don't want to leave it the way we left it." },
  { from: 'them', time: '02:31', text: "I know you've seen these. I'm coming over." },
  { from: 'them', time: '03:07', text: "I'm outside." },
  { from: 'them', time: '03:07', text: 'My key still turns. Why is the bolt on' },
  { from: 'them', time: '03:08', text: 'I can hear the landline ringing in there. Pick up' },
  { from: 'them', time: '03:09', text: 'Saad I can smell gas' },
  { from: 'them', time: '03:09', text: 'OPEN THE DOOR' },
  { missed: '9 missed calls' },
];
const THE_YEAR = [
  ['23 Nov 2026', "They gave me your phone today. I don't know why I'm texting it."],
  ['14 Feb 2027', "The landlord wants to let the flat. I told him I'd pay."],
  ['2 Jun 2027', 'The woman downstairs says she hears somebody walking about up here at night.'],
  ['9 Jun 2027', 'I found the bolt on. From the inside. In an empty flat.'],
  ['2 Aug 2027', 'The rubbish bag I left by the bin was at the front door this morning.'],
  ['30 Oct 2027', 'A ring on the hob was lit tonight. Nobody has a key but me.'],
  ['15 Nov 2027', "Tomorrow is a year. I'll be there. I'll bring the footage."],
];
// The last messages, tonight. The first comes in as the phone lights up;
// the rest after the thread has scrolled back to the night and down again.
const LAST = [
  "It's me. It was always me. You only ever answered clients.",
  '1:10. I had not even set off. I needed to know that.',
  'You left the chai on, yaar.',
  'Turn it off. Then open the door.',
];
// Seconds a message is left to be read, for every character in it (with a
// floor and a ceiling): tonight, before the next one starts; in the thread,
// as it scrolls up. And on the name. Slow on purpose: Eshan found the chats
// hard to follow at the first speed (0.045 a letter).
const READ = { perLetter: 0.075, least: 2.4, most: 6, onTheName: 4, arrive: 2.2, afterYours: 0.8 };

// --- How it looks ------------------------------------------------------------------
const LOOK = {
  width: 360, // the picture of the screen, in pixels (half as wide as it is tall)
  height: 720,
  text: 31, // size of the words in a message: big, because the picture is only 360 lines tall
  small: 18, // size of the times under them
  line: 37, // the gap from one line of words to the next
  bubble: 290, // the widest a message gets
  them: '#2b2f37', // their messages
  themText: '#e2ded3',
  you: '#e8943a', // the player's messages: the menu's lamp colour
  youText: '#1c1209',
  dim: '#8b887f',
  missed: '#c05a4e',
  back: '#090b10', // the screen behind the messages
  words: '"Bahnschrift", "Arial Narrow", "Liberation Sans Narrow", sans-serif',
};

// --- The phone in the hand -----------------------------------------------------------
const HAND = {
  raise: 0.35, // seconds for the phone to come up, or go down
  fill: 0.78, // how much of the height of the view it fills
  lift: 0.09, // how far above the middle of the view it sits (part of the view's height)
  tilt: -0.1, // tipped back a little, the way a phone is held
};
const BODY = [0.072, 0.146, 0.009]; // width, height, depth in metres
const SCREEN = [0.064, 0.128];
const TOP = 112; // where the messages start on the screen, below the name
const BOTTOM = LOOK.height - 86; // and where they end, above the box you type in

export function createPhone({ camera, audio, hud, onDone }) {
  // --- The phone itself -------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.width = LOOK.width;
  canvas.height = LOOK.height;
  const paint = canvas.getContext('2d');
  const picture = new THREE.CanvasTexture(canvas);
  picture.colorSpace = THREE.SRGBColorSpace;
  picture.anisotropy = 4;

  const phone = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(...BODY),
    new THREE.MeshPhongMaterial({ color: 0x15161a, shininess: 40, specular: 0x2a2a2a }),
  );
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(...SCREEN), new THREE.MeshBasicMaterial({ map: picture, fog: false }));
  screen.position.z = BODY[2] / 2 + 0.0004;
  phone.add(body, screen);
  phone.visible = false;
  camera.add(phone);

  // --- Where it has got to ---------------------------------------------------------------
  const shown = []; // what is on the screen: messages { from, text | files, time, age }, days { day }, { missed }
  let mode = 'tonight'; // 'tonight' or 'thread'
  let next = 0; // the next line of TONIGHT
  let typing = 0; // seconds of "typing..." left, while they are typing
  let rest = 0; // seconds left for reading the last message before they start the next
  let up = false; // is the phone in his hand
  let raised = 0; // 0 down, 1 up
  let leaving = false; // going back down
  let scroll = 0; // how far the messages have moved up, in pixels
  let want = 0; // and how far they should have
  let clock = 0; // seconds the phone has been up: for the typing dots
  let finished = false; // every line has been shown
  let who = WHO; // the name at the top
  let steps = []; // the thread's script, one step at a time
  let stepTime = 0; // seconds into the current step
  let focus = null; // the message the thread is holding in the middle of the screen
  let then = onDone; // what to do once the phone is put away
  let snap = false; // jump straight to where the thread should be, next time it is drawn

  const waitingFor = () => TONIGHT[next];
  const yourTurn = () => up && !leaving && mode === 'tonight' && waitingFor() && waitingFor().from === 'you';

  const readFor = (item) => Math.max(READ.least, Math.min(READ.most, (item.text || item.missed || '').length * READ.perLetter));

  // --- Tonight: move the conversation on as far as it can go without the player -----------
  function advance(dt) {
    while (next < TONIGHT.length) {
      const line = TONIGHT[next];
      if (line.from === 'you') return; // waiting for E
      if (rest > 0) {
        rest -= dt;
        dt = 0;
        if (rest > 0) return;
      }
      if (typing <= 0 && line.typing > 0 && !line.started) {
        line.started = true;
        typing = line.typing;
      }
      if (typing > 0) {
        typing -= dt;
        dt = 0;
        if (typing > 0) return;
      }
      line.started = false;
      shown.push({ ...line, age: 0 });
      next += 1;
      if (line.typing > 0) {
        audio.message(line.files ? 'files' : 'in');
        // Time to read it, unless the next move is the player's: then they take their own.
        const after = TONIGHT[next];
        rest = after && after.from === 'them' ? readFor(line) : 0;
      }
    }
    finished = true;
  }

  // --- The thread: a script of steps, played out one after another -------------------------
  //   { arrive: text }  they type, and the message lands at the bottom
  //   { hold: item }    the thread holds that message in the middle of the screen
  //   { bottom: true }  back down to the newest
  //   { done: true }    finished: the phone can be put away
  function buildThread() {
    shown.length = 0;
    const old = (item) => ({ ...item, age: 99 });
    for (const item of THE_NIGHT) shown.push(old(item));
    const yearFrom = shown.length;
    for (const [day, text] of THE_YEAR) {
      shown.push(old({ day }));
      shown.push(old({ from: 'them', time: '03:07', text }));
    }
    const yearTo = shown.length;
    shown.push(old({ day: 'Today' }));
    for (const line of TONIGHT) shown.push(old(line));
    for (const clip of CLIPS) for (const text of clip.reply) shown.push(old({ from: 'them', text }));
    shown.push(old({ from: 'them', files: [CLIPS[CLIPS.length - 1].file] }));

    // Up from tonight, through the year, to the night and the name; then down again.
    const messages = (from, to) => shown.slice(from, to).filter((item) => item.text || item.missed).reverse();
    const year = messages(yearFrom, yearTo);
    const night = messages(0, THE_NIGHT.length);
    steps = [
      { arrive: LAST[0] },
      ...year.map((item) => ({ hold: item, seconds: readFor(item) })),
      ...night.map((item) => ({ hold: item, seconds: item.named ? READ.onTheName : readFor(item), naming: item.named })),
      { bottom: true, seconds: 1.2 },
      ...LAST.slice(1).map((text) => ({ arrive: text })),
      { done: true },
    ];
  }

  function runThread(dt) {
    const step = steps[0];
    if (!step || step.done) {
      finished = true;
      focus = null;
      return;
    }
    stepTime += dt;
    if (step.arrive) {
      focus = null;
      if (stepTime < READ.arrive) {
        typing = READ.arrive - stepTime;
        return;
      }
      typing = 0;
      shown.push({ from: 'them', text: step.arrive, age: 0 });
      audio.message('in');
    } else if (step.hold) {
      focus = step.hold;
      if (step.naming && stepTime > 0.6 && who !== NAME) who = NAME; // the thread has a name now
      if (stepTime < step.seconds) return;
    } else if (step.bottom) {
      focus = null;
      if (stepTime < step.seconds) return;
    }
    steps.shift();
    stepTime = 0;
  }

  // --- Painting the screen ---------------------------------------------------------------
  // Break the words into lines no wider than the bubble allows.
  function wrap(text, width) {
    const lines = [];
    let current = '';
    for (const word of text.split(' ')) {
      const tryLine = current ? `${current} ${word}` : word;
      if (paint.measureText(tryLine).width > width && current) {
        lines.push(current);
        current = word;
      } else current = tryLine;
    }
    if (current) lines.push(current);
    return lines;
  }

  function rounded(x, y, w, h, r) {
    paint.beginPath();
    paint.roundRect(x, y, w, h, r);
    paint.fill();
  }

  // A file: a strip of film, the name, and how long it is.
  function fileBubble(name, top) {
    const w = LOOK.bubble;
    paint.fillStyle = LOOK.them;
    rounded(16, top, w, 64, 16);
    paint.fillStyle = '#11141a';
    paint.fillRect(28, top + 12, 40, 40);
    paint.fillStyle = LOOK.dim;
    for (let i = 0; i < 4; i++) {
      paint.fillRect(31, top + 15 + i * 9, 5, 5);
      paint.fillRect(60, top + 15 + i * 9, 5, 5);
    }
    paint.fillStyle = LOOK.themText;
    paint.font = `${LOOK.text - 2}px ${LOOK.words}`;
    paint.fillText(name, 82, top + 30);
    paint.fillStyle = LOOK.dim;
    paint.font = `${LOOK.small}px ${LOOK.words}`;
    paint.fillText('Video  0:24', 82, top + 52);
    return 64;
  }

  // Lay the thread out from the top down: where each thing goes, and how tall it is.
  function layout() {
    let y = 0;
    const placed = [];
    let previous = null;
    paint.font = `${LOOK.text}px ${LOOK.words}`;
    for (const m of shown) {
      if (m.day || m.missed) {
        y += 10;
        placed.push({ kind: m.day ? 'day' : 'missed', m, y, height: 30 });
        y += 40;
        previous = null;
        continue;
      }
      if (previous && previous !== m.from) y += 14;
      previous = m.from;
      if (m.files) {
        const first = y;
        for (const name of m.files) {
          placed.push({ kind: 'file', name, y, m });
          y += 72;
        }
        placed.push({ kind: 'stamp', m, y: y - 8, height: 0, first });
      } else {
        const lines = wrap(m.text, LOOK.bubble - 30);
        const width = Math.max(...lines.map((l) => paint.measureText(l).width)) + 30;
        const height = lines.length * LOOK.line + 18;
        placed.push({ kind: 'words', lines, width, height, y, m });
        y += height + 6;
      }
      y += LOOK.small + 6; // room for the time under it
    }
    if (typing > 0) {
      placed.push({ kind: 'typing', y });
      y += 50;
    }
    return { placed, height: y };
  }

  function draw() {
    const W = LOOK.width;
    const H = LOOK.height;
    paint.fillStyle = LOOK.back;
    paint.fillRect(0, 0, W, H);
    paint.textBaseline = 'alphabetic';

    const { placed, height } = layout();
    const area = BOTTOM - TOP;
    const most = Math.max(0, height - area);
    const held = focus && placed.find((p) => p.m === focus);
    want = held ? Math.max(0, Math.min(most, held.y + (held.height || 40) / 2 - area / 2)) : most;

    paint.save();
    paint.beginPath();
    paint.rect(0, TOP, W, area);
    paint.clip();
    for (const p of placed) {
      const at = TOP + p.y - scroll;
      if (at > BOTTOM || at < TOP - 300) continue;
      const fresh = p.m ? Math.min(1, p.m.age / 0.25) : 1; // a new message rises into place
      paint.globalAlpha = fresh * (held && p.m !== focus && (p.kind === 'words' || p.kind === 'missed') ? 0.55 : 1);
      const rise = (1 - fresh) * 18;
      if (p.kind === 'typing') {
        paint.globalAlpha = 1;
        paint.fillStyle = LOOK.them;
        rounded(16, at, 86, 40, 18);
        for (let i = 0; i < 3; i++) {
          paint.globalAlpha = 0.35 + 0.65 * Math.max(0, Math.sin(clock * 6 - i * 0.9));
          paint.fillStyle = LOOK.themText;
          paint.beginPath();
          paint.arc(38 + i * 21, at + 20, 5, 0, Math.PI * 2);
          paint.fill();
        }
        continue;
      }
      if (p.kind === 'day') {
        paint.font = `600 ${LOOK.small}px ${LOOK.words}`;
        const label = p.m.day;
        const w = paint.measureText(label).width + 26;
        paint.fillStyle = '#181b22';
        rounded(W / 2 - w / 2, at, w, 28, 14);
        paint.fillStyle = LOOK.dim;
        paint.textAlign = 'center';
        paint.fillText(label, W / 2, at + 20);
        paint.textAlign = 'left';
        continue;
      }
      if (p.kind === 'missed') {
        paint.font = `600 ${LOOK.small + 2}px ${LOOK.words}`;
        paint.fillStyle = LOOK.missed;
        paint.textAlign = 'center';
        paint.fillText(p.m.missed, W / 2, at + 20);
        paint.textAlign = 'left';
        continue;
      }
      if (p.kind === 'file') {
        fileBubble(p.name, at + rise);
        continue;
      }
      if (p.kind === 'stamp') {
        stamp(p.m, at + rise);
        continue;
      }
      const mine = p.m.from === 'you';
      const x = mine ? W - 16 - p.width : 16;
      paint.fillStyle = mine ? LOOK.you : LOOK.them;
      rounded(x, at + rise, p.width, p.height, 18);
      paint.fillStyle = mine ? LOOK.youText : LOOK.themText;
      paint.font = `${LOOK.text}px ${LOOK.words}`;
      p.lines.forEach((l, i) => paint.fillText(l, x + 15, at + rise + 9 + LOOK.line * (i + 1) - 7));
      stamp(p.m, at + rise + p.height);
    }
    paint.restore();
    paint.globalAlpha = 1;

    // The top: the clock, the signal, and who you are talking to.
    paint.fillStyle = LOOK.themText;
    paint.font = `600 ${LOOK.small + 2}px ${LOOK.words}`;
    paint.fillText(TIME, 22, 30);
    for (let i = 0; i < 4; i++) paint.fillRect(W - 92 + i * 9, 30 - 5 - i * 4, 6, 5 + i * 4);
    paint.strokeStyle = LOOK.themText;
    paint.lineWidth = 2;
    paint.strokeRect(W - 46, 16, 26, 14);
    paint.fillRect(W - 44, 18, 9, 10); // the battery, low
    paint.fillRect(W - 19, 20, 3, 6);
    paint.fillStyle = '#1d2028';
    paint.beginPath();
    paint.arc(46, 76, 20, 0, Math.PI * 2);
    paint.fill();
    paint.fillStyle = LOOK.dim;
    paint.font = `600 ${LOOK.text}px ${LOOK.words}`;
    paint.textAlign = 'center';
    paint.fillText(who === WHO ? '?' : who[0], 46, 85);
    paint.textAlign = 'left';
    paint.fillStyle = LOOK.themText;
    paint.font = `${LOOK.text}px ${LOOK.words}`;
    paint.fillText(who, 80, 86);
    paint.fillStyle = '#1a1d24';
    paint.fillRect(0, 108, W, 2);

    // The box you type in. It holds the reply, ready to send, when it is your turn.
    const waiting = yourTurn() ? waitingFor().text : null;
    paint.fillStyle = '#1a1d24';
    rounded(14, H - 70, W - 84, 50, 25);
    paint.font = `${LOOK.text - 2}px ${LOOK.words}`;
    paint.fillStyle = waiting ? LOOK.themText : LOOK.dim;
    paint.fillText(waiting || 'Message', 32, H - 37);
    paint.fillStyle = waiting ? LOOK.you : '#1a1d24';
    paint.beginPath();
    paint.arc(W - 40, H - 45, 24, 0, Math.PI * 2);
    paint.fill();
    paint.fillStyle = waiting ? LOOK.youText : LOOK.dim;
    paint.beginPath(); // the send arrow
    paint.moveTo(W - 50, H - 56);
    paint.lineTo(W - 28, H - 45);
    paint.lineTo(W - 50, H - 34);
    paint.closePath();
    paint.fill();
    picture.needsUpdate = true;
  }

  // The time under a message: when it was sent (tonight, always 3:07).
  function stamp(m, y) {
    const time = m.time || TIME;
    paint.font = `${LOOK.small}px ${LOOK.words}`;
    paint.fillStyle = LOOK.dim;
    const width = paint.measureText(time).width;
    paint.fillText(time, m.from === 'you' ? LOOK.width - 20 - width : 22, y + LOOK.small + 2);
  }

  // --- Holding it ---------------------------------------------------------------------
  // Work out where the phone sits so that it fills the same part of the
  // view whatever field of view the player has chosen.
  function hold() {
    const spread = Math.tan((camera.fov * Math.PI) / 360);
    const distance = BODY[1] / 2 / (HAND.fill * spread);
    const lower = (1 - raised) * (1 - raised) * 1.1; // below the view while coming up
    phone.position.set(0, (HAND.lift - lower) * 2 * spread * distance, -distance);
    phone.rotation.set(HAND.tilt, 0, 0);
  }

  function raise() {
    up = true;
    phone.visible = true;
    hud.prompt(null);
  }

  // Tonight's conversation, from the start.
  function open() {
    reset();
    mode = 'tonight';
    then = onDone;
    raise();
    advance(0);
  }

  // The thread at the end. whenDone is called once it has been put away.
  function openThread(whenDone) {
    reset();
    mode = 'thread';
    then = whenDone;
    buildThread();
    snap = true; // it starts at the bottom: tonight
    raise();
  }

  function update(dt) {
    if (!up) return;
    clock += dt;
    raised = leaving ? Math.max(0, raised - dt / HAND.raise) : Math.min(1, raised + dt / HAND.raise);
    if (leaving && raised === 0) {
      up = false;
      phone.visible = false;
      hud.prompt(null);
      then();
      return;
    }
    hold();
    for (const m of shown) m.age += dt;
    if (raised === 1 && !leaving) {
      if (mode === 'tonight') advance(dt);
      else runThread(dt);
    }
    hud.prompt(leaving || raised < 1 ? null : yourTurn() ? 'Send' : finished ? 'Put the phone away' : null);
    draw();
    // Scroll towards where the thread should be, a little at a time; a long
    // way, it jumps most of it.
    if (snap) {
      scroll = want;
      snap = false;
    }
    scroll = Math.max(want - 400, Math.min(want + 400, scroll));
    scroll += (want - scroll) * Math.min(1, dt * (focus ? 2.4 : 5));
    if (Math.abs(want - scroll) < 0.5) scroll = want;
  }

  // E: send the reply, or put the phone away once it is all there.
  function use() {
    if (!up || leaving || raised < 1) return;
    if (yourTurn()) {
      shown.push({ ...waitingFor(), age: 0 });
      next += 1;
      rest = READ.afterYours; // a beat before they answer
      audio.message('out');
    } else if (finished) {
      leaving = true;
      audio.act('phoneUp');
    }
  }

  function reset() {
    shown.length = 0;
    for (const line of TONIGHT) line.started = false;
    next = 0;
    typing = 0;
    rest = 0;
    up = false;
    raised = 0;
    leaving = false;
    scroll = 0;
    want = 0;
    clock = 0;
    finished = false;
    who = WHO;
    steps = [];
    stepTime = 0;
    focus = null;
    phone.visible = false;
  }

  return {
    open,
    openThread,
    update,
    use,
    reset,
    isUp: () => up,
    // For tests: where the conversation has got to.
    state: () => ({
      up,
      mode,
      raised,
      line: next,
      of: TONIGHT.length,
      yourTurn: !!yourTurn(),
      finished,
      typing: +typing.toFixed(2),
      who,
      steps: steps.length,
      focus: focus ? focus.text || focus.missed : null,
    }),
  };
}
