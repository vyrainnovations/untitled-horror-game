// Every sound in the game is made here, by code. There are no sound files.
//
// Browsers do not let a page make a sound until the player has clicked or
// pressed a key, so nothing starts until start() is called from one of those.
//
// The sounds: a faint room tone; hums that grow as you walk towards what is
// making them (the fridge, the corridor bulb, the PC, the kitchen strip light,
// the street beyond the west windows); footsteps that change with the floor;
// the sounds of the player's hands (a bag, a door, a bolt); the clunks and
// ticks of the menu; and the score, which is not in the flat at all: a drone
// that rises with the dread, risers, hits, a heartbeat, and two pieces of
// music (see "The music", below, and "The score", near the end).

// Where each hum comes from, how far it carries (metres) and how loud it is
// when you stand right next to it.
const HUMS = {
  fridge: { at: [3.74, 11.57], carries: 1.7, loud: 0.15 },
  bulb: { at: [4.95, 8.4], carries: 1.5, loud: 0.04 },
  pc: { at: [1.9, 0.45], carries: 1.4, loud: 0.06 },
  strip: { at: [0.88, 11.52], carries: 1.2, loud: 0.03 },
  ring: { at: [1.47, 11.65], carries: 1.3, loud: 0.07 }, // the gas ring on the hob: silent until it is lit
  gas: { at: [1.47, 11.55], carries: 1.5, loud: 0.11 }, // gas escaping from a ring that has gone out: silent until it does
};
// How bright a footstep sounds on each kind of floor (a filter frequency).
const FLOORS = { mosaic: 720, tile: 1500, cement: 1000 };
// How loud the flat is in each state of the game. The menu's own sounds are
// not affected.
const SCENES = { playing: 1, title: 0.55, paused: 0.2 };
// And how loud the score is: the drone, the hits and the music.
const SCORE = { playing: 1, title: 1, paused: 0.15 };

// --- The music -------------------------------------------------------------------
// Two pieces, played by a little sequencer a step at a time. Notes are
// numbered the way a keyboard is (60 is middle C, 69 the A above it).
//
//   theme   the title screen and the credits: slow and sad, in D minor.
//           A step is half a beat; four bars of eight steps go round.
//   finale  the cutscene and the last two jobs: fast, restless, in E minor.
//           Eshan asked for "a music like L's theme A from death note or
//           something similar". This is an original piece in that spirit (a
//           running figure over a pumping bass, built up a layer at a time),
//           not that tune. A step is a quarter of a beat; eight bars of
//           sixteen go round. Its layers come in with its level: 1 the bass
//           and the pulse, 2 the running figure, 3 the ticking and the tune.
const THEME = {
  tempo: 56,
  chords: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]], // D minor, B flat, G minor, A
  tune: { '0:0': 69, '0:4': 74, '1:0': 77, '1:4': 74, '2:0': 70, '2:2': 74, '2:4': 79, '3:0': 76, '3:4': 73 }, // 'bar:step': note
};
const FINALE = {
  tempo: 138,
  // Each bar: the bass note, whether the chord is minor, and the long note of the tune over it.
  bars: [[40, true, 83], [36, false, 84], [43, false, 86], [38, false, 81], [40, true, 79], [36, false, 88], [45, true, 84], [47, false, 87]],
  // The running figure: sixteen notes, as steps above the chord's own note. 'T' is its third.
  figure: [0, 7, 12, 7, 'T', 7, 12, 7, 0, 7, 12, 7, 'T', 12, 19, 12],
  bass: [0, 0, 12, 0], // one a beat: the note, or the one an octave up
};
const pitch = (note) => 440 * 2 ** ((note - 69) / 12);

export function createAudio() {
  let ctx = null;
  let master;
  let world; // everything in the flat
  let ui; // the menu
  let score; // the drone, the hits and the music: not part of the flat, so hush() leaves it alone
  let musicBus; // the music alone, so that it can fade or cut
  let echo; // a short echo that single notes ring in
  let dread; // the drone under Part 2: { low, lowFilter, high }
  let tension = 0; // how far up the drone is: 0 to 1
  let power = 1; // 1 while the flat has electricity; 0 when the lights have gone
  let song = null; // the piece that is playing: { name, step, next, level }
  let meter; // lets a test measure how loud the output is
  let volume = 0.8;
  let scene = 'title';
  let stepNoise = null;
  let street = null;
  let lastTick = 0;
  let ringLit = false; // is the gas ring burning
  let gasOn = 0; // is gas escaping, and how loudly: 0 to 1
  const ears = [0, 0]; // where the listener stands on the plan
  const hums = {};
  const tapeLoops = {}; // the tape in the editing program: its motor, the rewind whirr, static
  const tapeWants = { motor: 0, rewind: 0, snow: 0 };

  // A stretch of hiss. Brown noise is the deep, soft kind (wind, distant
  // traffic); white is the bright kind (a fan, a footstep).
  function noiseBuffer(seconds, brown) {
    const fade = Math.floor(ctx.sampleRate * 0.2);
    const length = Math.floor(ctx.sampleRate * seconds) + fade;
    const data = new Float32Array(length);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    // Blend the end into the start, so it can repeat without a click.
    for (let i = 0; i < fade; i++) data[i] = data[i] * (i / fade) + data[length - fade + i] * (1 - i / fade);
    const buffer = ctx.createBuffer(1, length - fade, ctx.sampleRate);
    buffer.copyToChannel(data.subarray(0, length - fade), 0);
    return buffer;
  }

  // Hiss played round and round through a filter. Returns its volume control.
  function loopNoise(buffer, filterType, frequency, q, level) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = level;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(world);
    source.start();
    return gain;
  }

  // A steady hum built from a few pure tones: [frequency, shape, level].
  // Returns its volume control, which starts silent.
  function drone(tones, highpass) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    let out = gain;
    if (highpass) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = highpass;
      gain.connect(filter);
      out = filter;
    }
    out.connect(world);
    for (const [frequency, shape, level] of tones) {
      const osc = ctx.createOscillator();
      osc.type = shape;
      osc.frequency.value = frequency;
      const part = ctx.createGain();
      part.gain.value = level;
      osc.connect(part);
      part.connect(gain);
      osc.start();
    }
    return gain;
  }

  // Call from a click or a key press. Safe to call again and again.
  function start() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    ctx = new Context();

    master = ctx.createGain();
    master.gain.value = volume * volume;
    const limiter = ctx.createDynamicsCompressor(); // stops anything from distorting
    limiter.threshold.value = -12;
    limiter.ratio.value = 8;
    meter = ctx.createAnalyser();
    meter.fftSize = 2048;
    master.connect(limiter);
    limiter.connect(meter);
    meter.connect(ctx.destination);
    world = ctx.createGain();
    world.gain.value = SCENES[scene];
    world.connect(master);
    ui = ctx.createGain();
    ui.connect(master);
    score = ctx.createGain();
    score.gain.value = SCORE[scene];
    score.connect(master);
    musicBus = ctx.createGain();
    musicBus.connect(score);
    // The echo: a note goes round again a third of a second later, duller and quieter.
    echo = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.326;
    const dull = ctx.createBiquadFilter();
    dull.type = 'lowpass';
    dull.frequency.value = 2200;
    const again = ctx.createGain();
    again.gain.value = 0.4;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    echo.connect(delay);
    delay.connect(dull);
    dull.connect(again);
    again.connect(delay);
    dull.connect(wet);
    wet.connect(musicBus);
    // The drone: a low note, another a semitone off it (the slow beating
    // between the two is what feels wrong), and a thin high pair that only
    // comes in when the dread is well up.
    const voices = (tones, out) => {
      for (const [frequency, shape, level] of tones) {
        const osc = ctx.createOscillator();
        osc.type = shape;
        osc.frequency.value = frequency;
        const part = ctx.createGain();
        part.gain.value = level;
        osc.connect(part);
        part.connect(out);
        osc.start();
      }
    };
    dread = { low: ctx.createGain(), lowFilter: ctx.createBiquadFilter(), high: ctx.createGain() };
    dread.low.gain.value = 0;
    dread.high.gain.value = 0;
    dread.lowFilter.type = 'lowpass';
    dread.lowFilter.frequency.value = 160;
    dread.low.connect(dread.lowFilter);
    dread.lowFilter.connect(score);
    dread.high.connect(score);
    voices([[55, 'sine', 0.5], [110, 'sine', 0.2], [116.5, 'sine', 0.2], [164.8, 'triangle', 0.07], [233.1, 'sawtooth', 0.03]], dread.low);
    voices([[1975.5, 'sine', 0.5], [2093, 'sine', 0.5]], dread.high);
    setTension(tension, 0.01);
    setInterval(pump, 70); // the music's sequencer

    const brown = noiseBuffer(4, true);
    const white = noiseBuffer(2, false);
    stepNoise = noiseBuffer(0.2, false);
    loopNoise(brown, 'lowpass', 320, 0.7, 0.085); // room tone: the sound of an empty flat
    hums.fridge = drone([[50, 'sine', 1], [100, 'sine', 0.45], [150, 'sine', 0.12]]);
    hums.bulb = drone([[100, 'square', 1]], 900); // a filament buzzing
    hums.strip = drone([[100, 'sine', 1], [200, 'sine', 0.5]]);
    hums.pc = loopNoise(white, 'bandpass', 900, 0.6, 0); // the PC's fans
    hums.ring = loopNoise(white, 'bandpass', 2300, 0.9, 0); // gas burning: a thin hiss
    hums.gas = loopNoise(white, 'highpass', 4300, 0.6, 0); // gas escaping, unburnt: thinner, higher
    street = loopNoise(brown, 'bandpass', 140, 0.5, 0); // the street, through the glass
    tapeLoops.motor = drone([[60, 'sine', 1], [120, 'sine', 0.35]]); // the tape turning
    tapeLoops.rewind = loopNoise(white, 'bandpass', 1900, 3, 0); // the whirr of scrubbing back
    tapeLoops.snow = loopNoise(white, 'highpass', 2600, 0.7, 0); // the hiss of static
    setTape(tapeWants);
  }

  // Call every frame with where the listener is, and how brightly the
  // corridor bulb is burning (0 to 1), so its buzz cuts out when it does.
  function update(x, z, bulbLevel = 1) {
    ears[0] = x;
    ears[1] = z;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const name of Object.keys(HUMS)) {
      const hum = HUMS[name];
      const distance = Math.hypot(x - hum.at[0], z - hum.at[1]);
      let level = hum.loud / (1 + (distance / hum.carries) ** 2);
      if (name !== 'ring' && name !== 'gas') level *= power; // with the electricity gone, only the gas is left
      if (name === 'bulb') level *= bulbLevel;
      if (name === 'ring' && !ringLit) level = 0;
      if (name === 'gas') level *= gasOn;
      hums[name].gain.setTargetAtTime(level, now, 0.1);
    }
    const nearWindows = Math.max(0, Math.min(1, 1 - x / 4.2)); // the west rooms only
    street.gain.setTargetAtTime(0.09 * nearWindows * nearWindows, now, 0.2);
  }

  // Everything in the flat goes almost silent, for a moment, then comes
  // back: the hiss has stopped.
  function hush(seconds) {
    if (!ctx) return;
    const now = ctx.currentTime;
    world.gain.cancelScheduledValues(now);
    world.gain.setValueAtTime(world.gain.value, now);
    world.gain.linearRampToValueAtTime(0.08 * SCENES[scene], now + 0.25);
    world.gain.setValueAtTime(0.08 * SCENES[scene], now + seconds);
    world.gain.linearRampToValueAtTime(SCENES[scene], now + seconds + 2.5);
  }

  function setScene(name) {
    scene = name;
    if (ctx) {
      world.gain.cancelScheduledValues(ctx.currentTime); // a hush that was under way is over
      world.gain.setTargetAtTime(SCENES[name], ctx.currentTime, 0.08);
      score.gain.setTargetAtTime(SCORE[name], ctx.currentTime, 0.08);
    }
    if (name !== 'playing') setTape({ motor: 0, rewind: 0, snow: 0 }); // a paused game stops the tape too
  }

  // The tape in the editing program. motor: 1 while it plays. rewind: 1
  // while scrubbing back, less scrubbing forward. snow: how much static is
  // on the screen. Each from 0 to 1.
  function setTape({ motor = 0, rewind = 0, snow = 0 }) {
    Object.assign(tapeWants, { motor, rewind, snow });
    if (!ctx || !tapeLoops.motor) return;
    const now = ctx.currentTime;
    tapeLoops.motor.gain.setTargetAtTime(0.025 * motor, now, 0.05);
    tapeLoops.rewind.gain.setTargetAtTime(0.06 * rewind, now, 0.04);
    tapeLoops.snow.gain.setTargetAtTime(0.075 * snow, now, 0.03);
  }

  function setVolume(value) {
    volume = value;
    if (ctx) master.gain.setTargetAtTime(value * value, ctx.currentTime, 0.03);
  }

  // A short burst of hiss through a filter: the body of a footstep or a clunk.
  // kind is which part of the hiss is kept: 'lowpass' keeps the dull part
  // below the cutoff (a thud), 'highpass' the bright part above it (a rustle),
  // 'bandpass' a narrow part round it (a scrape). delay is seconds from now.
  function burst(bus, cutoff, seconds, level, kind = 'lowpass', delay = 0) {
    const now = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = stepNoise;
    source.loop = true; // the stretch of hiss is short: go round again for a long burst
    const filter = ctx.createBiquadFilter();
    filter.type = kind;
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + seconds);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    source.start(now, Math.random() * 0.05);
    source.stop(now + seconds + 0.03);
  }

  // A tone that slides from one pitch to another and dies away. delay is
  // seconds from now.
  function slide(bus, from, to, seconds, level, shape = 'sine', delay = 0) {
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = shape;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(to, now + seconds);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + seconds);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(now);
    osc.stop(now + seconds + 0.03);
  }

  // A steady tone that starts and stops cleanly: something buzzing. It is
  // dulled a little, as if heard through a table top.
  function buzzTone(bus, frequency, seconds, level, delay = 0) {
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.015);
    gain.gain.setValueAtTime(level, now + seconds - 0.04);
    gain.gain.linearRampToValueAtTime(0.0001, now + seconds);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    osc.start(now);
    osc.stop(now + seconds + 0.03);
  }

  // One footstep. floor is 'mosaic', 'tile' or 'cement'.
  function step(floor, fast) {
    if (!ctx) return;
    burst(world, FLOORS[floor] * (0.85 + Math.random() * 0.3), 0.11, fast ? 0.34 : 0.24);
    slide(world, 95, 48, 0.08, fast ? 0.24 : 0.17); // the heel
  }

  // The sounds of the player's hands: act('bag'), act('doorShut') and so on.
  // Each is put together from the same two pieces as a footstep: bursts of
  // hiss, and tones that slide.
  const ACTS = {
    // A full bin bag picked up: plastic rustling.
    bag() {
      burst(world, 3200, 0.09, 0.11, 'highpass');
      burst(world, 2600, 0.12, 0.09, 'highpass', 0.08);
      burst(world, 380, 0.07, 0.1);
    },
    // The front door opening: the latch, then the hinges.
    doorOpen() {
      slide(world, 1900, 1300, 0.025, 0.07, 'square');
      burst(world, 700, 0.05, 0.12);
      slide(world, 230, 170, 0.42, 0.03, 'sawtooth', 0.06);
    },
    // The bag set down on the landing.
    bagDown() {
      burst(world, 320, 0.13, 0.2);
      burst(world, 2800, 0.1, 0.07, 'highpass', 0.03);
    },
    // A heavy door pulled shut.
    doorShut() {
      burst(world, 420, 0.15, 0.34);
      slide(world, 85, 45, 0.17, 0.3);
      slide(world, 1700, 1100, 0.03, 0.06, 'square', 0.03);
    },
    // The bolt on the front door: a scrape of steel, then it hits home.
    bolt() {
      burst(world, 2600, 0.15, 0.1, 'bandpass');
      burst(world, 1700, 0.05, 0.3, 'lowpass', 0.14);
      slide(world, 330, 200, 0.06, 0.16, 'triangle', 0.14);
    },
    // A gas ring being lit: the lighter ticks three times, then the gas catches.
    ignite() {
      for (const at of [0, 0.11, 0.22]) slide(world, 3400, 2600, 0.012, 0.07, 'square', at);
      burst(world, 480, 0.3, 0.2, 'lowpass', 0.34);
      slide(world, 130, 70, 0.22, 0.1, 'sine', 0.34);
    },
    // A phone lifted off a desk.
    phoneUp() {
      burst(world, 1500, 0.04, 0.08);
      slide(world, 620, 500, 0.03, 0.04, 'triangle');
    },
    // The gas knob turned off: a hard click.
    knob() {
      slide(world, 1500, 900, 0.035, 0.11, 'square');
      burst(world, 950, 0.05, 0.12);
    },
    // The microwave's clock moving on: one small beep. It sounds inside the
    // silence after the hiss stops, so it does not go through the flat's
    // own volume, which is held right down just then (hush).
    beep() {
      slide(ui, 2093, 2090, 0.16, 0.045, 'sine');
    },
    // The front door swinging wide: the latch, then a long creak.
    doorWide() {
      slide(world, 1900, 1300, 0.025, 0.07, 'square');
      burst(world, 700, 0.05, 0.12);
      slide(world, 250, 120, 2.8, 0.035, 'sawtooth', 0.08);
      slide(world, 380, 210, 1.6, 0.02, 'triangle', 0.5);
    },
    // A pan boiling over onto a lit ring, at the other end of the flat: a
    // long angry hiss and the flame spitting out. Loud enough to be heard
    // from the study, which is the point.
    boilOver() {
      burst(world, 3600, 1.5, 0.17, 'highpass');
      burst(world, 1100, 0.9, 0.12, 'bandpass', 0.05);
      for (const at of [0.25, 0.5, 0.68, 0.8]) burst(world, 500, 0.08, 0.1, 'lowpass', at);
    },
    // A torch switched on, or off: a small hard click.
    torch() {
      slide(score, 2300, 1500, 0.02, 0.12, 'square');
      burst(score, 1800, 0.03, 0.14, 'bandpass');
    },
    // Every light and every motor in the flat dying at once: fans and the
    // fridge winding down, and one heavy clunk.
    powerDown() {
      slide(score, 240, 38, 1.1, 0.16, 'sawtooth');
      slide(score, 120, 30, 1.4, 0.3, 'sine');
      burst(score, 300, 0.25, 0.5);
    },
    // And coming back: a clunk, and the hum climbing up again.
    powerUp() {
      burst(score, 400, 0.12, 0.3);
      slide(score, 45, 110, 0.7, 0.12, 'sine');
    },
  };
  function act(kind) {
    if (ctx && ACTS[kind]) ACTS[kind]();
  }

  // The phone in his hand: message('in'), 'out' (one sent), 'files', and
  // 'pocket' (a message arriving while it is in his pocket).
  const MESSAGES = {
    in() {
      buzzTone(world, 158, 0.16, 0.07);
      slide(world, 1320, 1290, 0.1, 0.05, 'sine', 0.02);
      slide(world, 1760, 1730, 0.14, 0.045, 'sine', 0.13);
    },
    out() {
      burst(world, 2300, 0.09, 0.05, 'bandpass');
      slide(world, 700, 1500, 0.08, 0.03, 'sine', 0.01);
    },
    files() {
      buzzTone(world, 158, 0.16, 0.07);
      for (const [at, pitch] of [[0.02, 1180], [0.14, 1320], [0.26, 1580]]) slide(world, pitch, pitch - 20, 0.1, 0.045, 'sine', at);
    },
    pocket() {
      for (const at of [0, 0.42]) buzzTone(world, 150, 0.28, 0.12, at);
    },
  };
  function message(kind) {
    if (ctx && MESSAGES[kind]) MESSAGES[kind]();
  }

  // A fist hammering on the front door. knock('door', x, z) is the real
  // door at (x, z): loud from anywhere in the flat, louder near it.
  // knock('tape') is the same on a tape, small and thin, out of the PC's
  // speakers.
  function knock(kind, x = 4.95, z = 11.95) {
    if (!ctx) return;
    if (kind === 'tape') {
      burst(world, 1100, 0.15, 0.2, 'bandpass');
      slide(world, 260, 150, 0.12, 0.14, 'triangle');
      return;
    }
    const distance = Math.hypot(x - ears[0], z - ears[1]);
    const level = 0.55 + 0.45 / (1 + (distance / 5) ** 2); // a door hammered on carries through the whole flat
    burst(world, 170, 0.3, 0.85 * level); // the blow
    slide(world, 72, 36, 0.28, 0.7 * level); // the whole door booming
    burst(world, 1300, 0.07, 0.2 * level, 'bandpass', 0.005); // rattling in its frame
    slide(world, 2500, 1900, 0.03, 0.05 * level, 'square', 0.01); // the bolt jumping in its loops
  }

  // The tape's buttons and what it does: tape('load'), 'play', 'stop',
  // 'jump' (back a step in time), 'mark' and 'no' (nothing to mark there).
  const TAPE = {
    load() {
      burst(world, 900, 0.05, 0.12);
      slide(world, 140, 70, 0.09, 0.12, 'sine', 0.04);
    },
    play() {
      burst(world, 700, 0.04, 0.1);
      slide(world, 110, 80, 0.06, 0.1);
    },
    stop() {
      burst(world, 600, 0.04, 0.09);
    },
    jump() {
      burst(world, 3200, 0.32, 0.08, 'highpass');
      slide(world, 320, 55, 0.38, 0.07, 'sawtooth');
    },
    mark() {
      slide(world, 1000, 1000, 0.13, 0.05, 'square');
      burst(world, 800, 0.05, 0.12);
    },
    no() {
      slide(world, 230, 190, 0.13, 0.07, 'triangle');
    },
  };
  function tape(kind) {
    if (ctx && TAPE[kind]) TAPE[kind]();
  }

  // The gas ring on the hob, lit or out. Lit, it hisses when you stand near.
  function setRing(on) {
    ringLit = on;
  }

  // Gas escaping from the ring after the flame has gone out: true, false,
  // or how loud (1 is true). It is faint, and only near the hob.
  function setGas(on) {
    gasOn = on === true ? 1 : on || 0;
  }

  // A phone buzzing on a wooden desk at (x, z): two short buzzes. It is
  // louder the nearer the listener stands, but it carries a long way.
  function buzz(x, z) {
    if (!ctx) return;
    const distance = Math.hypot(x - ears[0], z - ears[1]);
    const level = 0.05 + 0.28 / (1 + (distance / 6) ** 2);
    for (const at of [0, 0.5]) {
      buzzTone(world, 158, 0.36, level, at); // the motor
      burst(world, 900, 0.36, level * 0.5, 'lowpass', at); // the desk rattling under it
    }
  }

  // The menu's sounds: 'move' (onto another option), 'tick' (dragging a
  // slider), 'back', and 'select' (a deck button going down).
  function click(kind) {
    if (!ctx) return;
    if (kind === 'move') {
      slide(ui, 1500, 1100, 0.03, 0.05, 'triangle');
    } else if (kind === 'tick') {
      if (ctx.currentTime - lastTick < 0.045) return;
      lastTick = ctx.currentTime;
      slide(ui, 900, 800, 0.02, 0.03, 'square');
    } else if (kind === 'back') {
      burst(ui, 500, 0.05, 0.16);
      slide(ui, 70, 50, 0.07, 0.2);
    } else {
      burst(ui, 700, 0.06, 0.22);
      slide(ui, 90, 52, 0.1, 0.26);
    }
  }

  // --- The score ------------------------------------------------------------------------
  // Everything below is not a sound in the flat: the drone, the risers, the
  // hits, the heartbeat and the music. It is here to frighten. It goes
  // through its own volume, so the silence after the gas (hush) does not
  // touch it, and it drops with everything else while the game is paused.

  // How near (x, z) is to the listener, from 1 (right there) towards 0: reach
  // is the distance in metres at which it has fallen to a half.
  const near = (x, z, reach) => 1 / (1 + (Math.hypot(x - ears[0], z - ears[1]) / reach) ** 2);

  // The drone under the game: 0 is none, 1 is as much dread as there is.
  // seconds is how long it takes to get there.
  function setTension(level, seconds = 3) {
    tension = level;
    if (!ctx || !dread) return;
    const now = ctx.currentTime;
    dread.low.gain.setTargetAtTime(0.17 * level, now, seconds / 3);
    dread.lowFilter.frequency.setTargetAtTime(150 + 520 * level * level, now, seconds / 3);
    dread.high.gain.setTargetAtTime(0.011 * Math.max(0, level - 0.45) * 2, now, seconds / 3);
  }

  // The lights going out (false) or coming back (true): the fridge, the
  // PC's fans and both buzzing lamps stop, or start again.
  function setPower(on) {
    power = on ? 1 : 0;
  }

  // A riser: a rush of hiss and a cluster of notes sliding up, getting
  // louder all the way, and then cut dead. The silence after it is the scare.
  // peak: how loud it gets, 0 to 1.
  function riser(seconds, peak = 1) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const end = now + seconds;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(peak, end);
    out.gain.setValueAtTime(peak, end);
    out.gain.linearRampToValueAtTime(0.0001, end + 0.03);
    out.connect(score);
    const hiss = ctx.createBufferSource();
    hiss.buffer = stepNoise;
    hiss.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(5200, end);
    const hissLevel = ctx.createGain();
    hissLevel.gain.value = 0.3;
    hiss.connect(filter);
    filter.connect(hissLevel);
    hissLevel.connect(out);
    hiss.start(now);
    hiss.stop(end + 0.05);
    for (const from of [110, 164.8, 233.1, 311.1]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(from * 2.2, end);
      const part = ctx.createGain();
      part.gain.value = 0.05;
      osc.connect(part);
      part.connect(out);
      osc.start(now);
      osc.stop(end + 0.05);
    }
  }

  // A hit: sting('hit') is the jump scare, as loud as the game gets.
  // 'cold' is a quiet chill (something is on the tape that should not be).
  // 'thud' is one low blow. 'white' is the light finding him.
  const STINGS = {
    hit() {
      burst(score, 1400, 0.55, 0.75);
      burst(score, 5000, 0.2, 0.3, 'highpass');
      slide(score, 96, 30, 1.0, 0.8);
      // A fistful of notes that do not belong together, sagging as they die.
      for (const f of [233.1, 247, 349.2, 370, 523.3, 554.4]) {
        slide(score, f * 2, f * 1.86, 2.2, 0.05, 'sawtooth');
        slide(score, f * 4.02, f * 3.7, 1.3, 0.016, 'square');
      }
    },
    cold() {
      const now = ctx.currentTime;
      for (const [f, level] of [[73.4, 0.055], [880, 0.02], [932.3, 0.02], [1396.9, 0.008]]) {
        const osc = ctx.createOscillator();
        osc.frequency.value = f;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(level, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.6);
        osc.connect(gain);
        gain.connect(score);
        osc.start(now);
        osc.stop(now + 3.7);
      }
    },
    thud() {
      burst(score, 220, 0.4, 0.55);
      slide(score, 74, 32, 0.7, 0.6);
    },
    white() {
      burst(score, 2600, 0.9, 0.5, 'highpass');
      burst(score, 900, 0.6, 0.5);
      slide(score, 110, 28, 1.2, 0.8);
      for (const f of [466.2, 493.9, 698.5, 740]) slide(score, f * 2, f * 1.7, 1.6, 0.05, 'sawtooth');
    },
  };
  function sting(kind) {
    if (ctx && STINGS[kind]) STINGS[kind]();
  }

  // One heartbeat, in the ears: two soft thumps. strength: 0 to 1.
  function beat(strength = 1) {
    if (!ctx) return;
    slide(score, 64, 40, 0.13, 0.2 * strength);
    slide(score, 58, 38, 0.12, 0.14 * strength, 'sine', 0.19);
  }

  // The landline at (x, z) ringing once: the two short trills of an old
  // phone's bell. It carries a long way down the corridor.
  function ring(x, z) {
    if (!ctx) return;
    const level = 0.035 + 0.12 * near(x, z, 6);
    for (const at of [0, 0.56]) {
      const now = ctx.currentTime + at;
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, now);
      out.gain.linearRampToValueAtTime(level, now + 0.01);
      out.gain.setValueAtTime(level, now + 0.36);
      out.gain.exponentialRampToValueAtTime(0.0005, now + 0.5);
      out.connect(world);
      // The clapper strikes the bell twenty-odd times a second.
      const trill = ctx.createOscillator();
      trill.type = 'square';
      trill.frequency.value = 23;
      const depth = ctx.createGain();
      depth.gain.value = 0.45;
      const strike = ctx.createGain();
      strike.gain.value = 0.55;
      trill.connect(depth);
      depth.connect(strike.gain);
      strike.connect(out);
      for (const f of [1318.5, 1661.2, 2637]) {
        const osc = ctx.createOscillator();
        osc.frequency.value = f;
        const part = ctx.createGain();
        part.gain.value = f > 2000 ? 0.18 : 0.5;
        osc.connect(part);
        part.connect(strike);
        osc.start(now);
        osc.stop(now + 0.55);
      }
      trill.start(now);
      trill.stop(now + 0.55);
    }
  }

  // A footstep that is not the player's, at (x, z): heavier, and heard
  // through walls. It is how he knows where it is.
  function stepAt(x, z, floor) {
    if (!ctx) return;
    const level = 0.035 + 0.5 * near(x, z, 2.6);
    burst(world, FLOORS[floor] * 0.62, 0.15, 0.55 * level);
    slide(world, 82, 40, 0.11, 0.6 * level);
  }

  // --- The music's sequencer ---
  // One note. kind: 'pad' (slow in, slow out), 'bell' (struck, ringing on),
  // 'pluck' (struck and short), 'bass', or 'lead' (held, a little unsteady).
  // when is on the sound card's own clock.
  function note(kind, frequency, when, seconds, level) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    let out = gain;
    let send = 0; // how much of it goes round the echo
    if (kind === 'pad') {
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level, when + seconds * 0.4);
      gain.gain.linearRampToValueAtTime(0.0001, when + seconds * 1.15);
      seconds *= 1.15;
    } else if (kind === 'bass') {
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, when);
      filter.frequency.exponentialRampToValueAtTime(140, when + seconds);
      gain.connect(filter);
      out = filter;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level, when + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, when + seconds);
    } else if (kind === 'lead') {
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1900;
      gain.connect(filter);
      out = filter;
      const wobble = ctx.createOscillator();
      wobble.frequency.value = 5.6;
      const depth = ctx.createGain();
      depth.gain.value = frequency * 0.006;
      wobble.connect(depth);
      depth.connect(osc.frequency);
      wobble.start(when);
      wobble.stop(when + seconds + 0.05);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level, when + 0.05);
      gain.gain.setValueAtTime(level, when + seconds * 0.7);
      gain.gain.linearRampToValueAtTime(0.0001, when + seconds);
      send = 0.5;
    } else {
      // Struck: a bell rings on, a pluck is over at once.
      osc.type = kind === 'bell' ? 'sine' : 'triangle';
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level, when + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0008, when + seconds);
      send = kind === 'bell' ? 0.7 : 0.25;
      // A second, higher voice gives it an edge.
      const over = ctx.createOscillator();
      over.type = 'sine';
      over.frequency.value = frequency * (kind === 'bell' ? 3 : 2);
      const overLevel = ctx.createGain();
      overLevel.gain.setValueAtTime(level * (kind === 'bell' ? 0.12 : 0.35), when);
      overLevel.gain.exponentialRampToValueAtTime(0.0008, when + seconds * 0.5);
      over.connect(overLevel);
      overLevel.connect(out);
      over.start(when);
      over.stop(when + seconds + 0.05);
    }
    osc.frequency.setValueAtTime(frequency, when);
    osc.connect(gain);
    out.connect(musicBus);
    if (send) {
      const toEcho = ctx.createGain();
      toEcho.gain.value = send;
      out.connect(toEcho);
      toEcho.connect(echo);
    }
    osc.start(when);
    osc.stop(when + seconds + 0.05);
  }

  // A drum made of hiss: a tick (high) or a thump (a low tone), at a time
  // on the sound card's clock.
  function drum(kind, when, level) {
    if (kind === 'thump') {
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(130, when);
      osc.frequency.exponentialRampToValueAtTime(44, when + 0.11);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(level, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
      osc.connect(gain);
      gain.connect(musicBus);
      osc.start(when);
      osc.stop(when + 0.2);
      return;
    }
    const source = ctx.createBufferSource();
    source.buffer = stepNoise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.04);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(musicBus);
    source.start(when, Math.random() * 0.1);
    source.stop(when + 0.06);
  }

  // One step of a piece, at a time on the sound card's clock.
  function playStep(name, step, when, level) {
    if (name === 'theme') {
      const beat = 60 / THEME.tempo / 2; // a step is half a beat
      const bar = Math.floor(step / 8) % THEME.chords.length;
      const at = step % 8;
      if (at === 0) for (const n of THEME.chords[bar]) note('pad', pitch(n), when, beat * 8, 0.03);
      const tune = THEME.tune[`${bar}:${at}`];
      if (tune) note('bell', pitch(tune), when, 2.6, 0.055);
      return beat;
    }
    const beat = 60 / FINALE.tempo / 4; // a step is a quarter of a beat
    const [root, minor, tune] = FINALE.bars[Math.floor(step / 16) % FINALE.bars.length];
    const at = step % 16;
    if (at % 4 === 0) {
      note('bass', pitch(root + FINALE.bass[at / 4]), when, beat * 3.4, 0.16);
      drum('thump', when, 0.22);
    }
    if (level >= 2) {
      // The running figure sits in the octave above middle C, whatever the chord.
      const base = 64 + ((root - 40 + 120) % 12);
      const up = FINALE.figure[at];
      note('pluck', pitch(base + (up === 'T' ? (minor ? 15 : 16) : up)), when, 0.26, at % 4 === 0 ? 0.13 : 0.095);
    }
    if (level >= 3) {
      if (at % 2 === 0) drum('tick', when, at % 4 === 2 ? 0.1 : 0.045);
      if (at === 0) note('lead', pitch(tune), when, beat * 13, 0.06);
    }
    return beat;
  }

  // Called many times a second: plays whatever notes fall in the next
  // quarter of a second. Nothing is played while the game is paused.
  function pump() {
    if (!ctx || !song || scene === 'paused' || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (song.next < now) song.next = now + 0.06; // it fell behind (a pause, a hidden tab): carry on from here
    while (song.next < now + 0.28) {
      song.next += playStep(song.name, song.step, song.next, song.level);
      song.step += 1;
    }
  }

  // Start a piece ('theme' or 'finale'), or stop the music (null). level is
  // how many of the finale's layers play (1 to 3). fade: seconds to fade
  // the old piece out, or the new one in; 0 cuts dead.
  function music(name, { level = 3, fade = 1.5 } = {}) {
    if (name && song && song.name === name) {
      song.level = level;
      return;
    }
    song = name ? { name, step: 0, next: 0, level } : null;
    if (!ctx) return;
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    if (!name) {
      musicBus.gain.setTargetAtTime(0, now, Math.max(0.01, fade / 4));
      return;
    }
    musicBus.gain.setValueAtTime(fade > 0 ? 0.0001 : 1, now);
    if (fade > 0) musicBus.gain.linearRampToValueAtTime(1, now + fade);
    song.next = now + 0.08;
  }
  // The piece that is playing, for tests: its name and level, or null.
  const playing = () => (song ? { name: song.name, level: song.level, step: song.step } : null);

  // For tests: how loud the output is right now. 1 would be distortion.
  function level() {
    if (!ctx) return { running: false, peak: 0, average: 0 };
    const samples = new Float32Array(meter.fftSize);
    meter.getFloatTimeDomainData(samples);
    let peak = 0;
    let sum = 0;
    for (const s of samples) {
      peak = Math.max(peak, Math.abs(s));
      sum += s * s;
    }
    return { running: ctx.state === 'running', peak, average: Math.sqrt(sum / samples.length) };
  }

  return {
    start, update, setScene, setVolume, step, act, setRing, setGas, hush, buzz, message, knock, tape, setTape, click, level,
    // The score.
    setTension, setPower, riser, sting, beat, ring, stepAt, music, playing,
    state: () => ({ tension, power, song: playing() }),
  };
}
