// Every sound in the game is made here, by code. There are no sound files.
//
// Browsers do not let a page make a sound until the player has clicked or
// pressed a key, so nothing starts until start() is called from one of those.
//
// The sounds: a faint room tone; hums that grow as you walk towards what is
// making them (the fridge, the corridor bulb, the PC, the kitchen strip light,
// the street beyond the west windows); footsteps that change with the floor;
// the sounds of the player's hands (a bag, a door, a bolt); and the clunks
// and ticks of the menu.

// Where each hum comes from, how far it carries (metres) and how loud it is
// when you stand right next to it.
const HUMS = {
  fridge: { at: [3.74, 11.57], carries: 1.7, loud: 0.15 },
  bulb: { at: [4.95, 8.4], carries: 1.5, loud: 0.04 },
  pc: { at: [1.9, 0.45], carries: 1.4, loud: 0.06 },
  strip: { at: [0.88, 11.52], carries: 1.2, loud: 0.03 },
  ring: { at: [1.47, 11.65], carries: 1.3, loud: 0.07 }, // the gas ring on the hob: silent until it is lit
};
// How bright a footstep sounds on each kind of floor (a filter frequency).
const FLOORS = { mosaic: 720, tile: 1500, cement: 1000 };
// How loud the flat is in each state of the game. The menu's own sounds are
// not affected.
const SCENES = { playing: 1, title: 0.55, paused: 0.2 };

export function createAudio() {
  let ctx = null;
  let master;
  let world; // everything in the flat
  let ui; // the menu
  let meter; // lets a test measure how loud the output is
  let volume = 0.8;
  let scene = 'title';
  let stepNoise = null;
  let street = null;
  let lastTick = 0;
  let ringLit = false; // is the gas ring burning
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

    const brown = noiseBuffer(4, true);
    const white = noiseBuffer(2, false);
    stepNoise = noiseBuffer(0.2, false);
    loopNoise(brown, 'lowpass', 320, 0.7, 0.085); // room tone: the sound of an empty flat
    hums.fridge = drone([[50, 'sine', 1], [100, 'sine', 0.45], [150, 'sine', 0.12]]);
    hums.bulb = drone([[100, 'square', 1]], 900); // a filament buzzing
    hums.strip = drone([[100, 'sine', 1], [200, 'sine', 0.5]]);
    hums.pc = loopNoise(white, 'bandpass', 900, 0.6, 0); // the PC's fans
    hums.ring = loopNoise(white, 'bandpass', 2300, 0.9, 0); // gas burning: a thin hiss
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
      if (name === 'bulb') level *= bulbLevel;
      if (name === 'ring' && !ringLit) level = 0;
      hums[name].gain.setTargetAtTime(level, now, 0.1);
    }
    const nearWindows = Math.max(0, Math.min(1, 1 - x / 4.2)); // the west rooms only
    street.gain.setTargetAtTime(0.09 * nearWindows * nearWindows, now, 0.2);
  }

  function setScene(name) {
    scene = name;
    if (ctx) world.gain.setTargetAtTime(SCENES[name], ctx.currentTime, 0.08);
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

  return { start, update, setScene, setVolume, step, act, setRing, buzz, message, tape, setTape, click, level };
}
