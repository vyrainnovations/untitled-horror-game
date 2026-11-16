// The phone in his hand, and the messages on it: STORY.md, Part 2, beat 6,
// "The unknown number". The job offer.
//
// (It used to show a second thing as well: at the end of the game, a thread
// of a year's old messages scrolling up by itself. Eshan found it hard to
// follow, and it was replaced by the cutscene: src/cutscene.js.)
//
// HOW TO CHANGE THINGS
//   The messages are in TONIGHT, just below, in order. How long each one is
//   left to be read is in READ. The look of the screen (sizes, colours) is
//   in LOOK. How long the phone takes to come up and how big it is on the
//   screen are in HAND.
//
// The screen is painted with ordinary 2D drawing onto a picture that is
// wrapped round the phone, so it goes through the same VHS filter as the
// rest of the flat. Everything runs on the game's clock, so it stops while
// the game is paused.
import * as THREE from 'three';

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
const WHO = 'Unknown number'; // the name at the top of the screen
const TIME = '3:07'; // the clock on the phone, and the time on every message tonight
// Seconds a message is left to be read before the next one starts, for
// every character in it, with a floor and a ceiling. Slow on purpose: Eshan
// found the chats hard to follow at the first speed (0.045 a letter).
const READ = { perLetter: 0.075, least: 2.4, most: 6, afterYours: 0.8 };

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
  const shown = []; // the messages on the screen: { from, text | files, age }
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

  const waitingFor = () => TONIGHT[next];
  const yourTurn = () => up && !leaving && waitingFor() && waitingFor().from === 'you';
  const readFor = (item) => Math.max(READ.least, Math.min(READ.most, (item.text || '').length * READ.perLetter));

  // --- Move the conversation on as far as it can go without the player ---------------------
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

  // Lay the messages out from the top down: where each thing goes, and how tall it is.
  function layout() {
    let y = 0;
    const placed = [];
    let previous = null;
    paint.font = `${LOOK.text}px ${LOOK.words}`;
    for (const m of shown) {
      if (previous && previous !== m.from) y += 14;
      previous = m.from;
      if (m.files) {
        for (const name of m.files) {
          placed.push({ kind: 'file', name, y, m });
          y += 72;
        }
        placed.push({ kind: 'stamp', m, y: y - 8 });
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
    want = Math.max(0, height - area); // the newest message is always in sight

    paint.save();
    paint.beginPath();
    paint.rect(0, TOP, W, area);
    paint.clip();
    for (const p of placed) {
      const at = TOP + p.y - scroll;
      if (at > BOTTOM || at < TOP - 300) continue;
      const fresh = p.m ? Math.min(1, p.m.age / 0.25) : 1; // a new message rises into place
      paint.globalAlpha = fresh;
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
    paint.fillText('?', 46, 85);
    paint.textAlign = 'left';
    paint.fillStyle = LOOK.themText;
    paint.font = `${LOOK.text}px ${LOOK.words}`;
    paint.fillText(WHO, 80, 86);
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
    paint.font = `${LOOK.small}px ${LOOK.words}`;
    paint.fillStyle = LOOK.dim;
    const width = paint.measureText(TIME).width;
    paint.fillText(TIME, m.from === 'you' ? LOOK.width - 20 - width : 22, y + LOOK.small + 2);
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

  // Pick the phone up: tonight's conversation, from the start.
  function open() {
    reset();
    up = true;
    phone.visible = true;
    hud.prompt(null);
    advance(0);
  }

  function update(dt) {
    if (!up) return;
    clock += dt;
    raised = leaving ? Math.max(0, raised - dt / HAND.raise) : Math.min(1, raised + dt / HAND.raise);
    if (leaving && raised === 0) {
      up = false;
      phone.visible = false;
      hud.prompt(null);
      onDone();
      return;
    }
    hold();
    for (const m of shown) m.age += dt;
    if (raised === 1 && !leaving) advance(dt);
    hud.prompt(leaving || raised < 1 ? null : yourTurn() ? 'Send' : finished ? 'Put the phone away' : null);
    draw();
    // Scroll towards where the messages should be, a little at a time.
    scroll += (want - scroll) * Math.min(1, dt * 5);
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
    phone.visible = false;
  }

  return {
    open,
    update,
    use,
    reset,
    isUp: () => up,
    // For tests: where the conversation has got to.
    state: () => ({ up, raised, line: next, of: TONIGHT.length, yourTurn: !!yourTurn(), finished, typing: +typing.toFixed(2) }),
  };
}
