// Every sound in the game is made here, by code. There are no sound files.
//
// Browsers do not let a page make a sound until the player has clicked or
// pressed a key, so nothing starts until start() is called from one of those.
//
// The sounds: a faint room tone; hums that grow as you walk towards what is
// making them (the fridge, the corridor bulb, the PC, the kitchen strip light,
// the street beyond the west windows); footsteps that change with the floor;
// and the clunks and ticks of the menu.

// Where each hum comes from, how far it carries (metres) and how loud it is
// when you stand right next to it.
const HUMS = {
  fridge: { at: [3.74, 11.57], carries: 1.7, loud: 0.15 },
  bulb: { at: [4.95, 8.4], carries: 1.5, loud: 0.04 },
  pc: { at: [1.9, 0.45], carries: 1.4, loud: 0.06 },
  strip: { at: [0.88, 11.52], carries: 1.2, loud: 0.03 },
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
  const hums = {};

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
    street = loopNoise(brown, 'bandpass', 140, 0.5, 0); // the street, through the glass
  }

  // Call every frame with where the listener is, and how brightly the
  // corridor bulb is burning (0 to 1), so its buzz cuts out when it does.
  function update(x, z, bulbLevel = 1) {
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const name of Object.keys(HUMS)) {
      const hum = HUMS[name];
      const distance = Math.hypot(x - hum.at[0], z - hum.at[1]);
      let level = hum.loud / (1 + (distance / hum.carries) ** 2);
      if (name === 'bulb') level *= bulbLevel;
      hums[name].gain.setTargetAtTime(level, now, 0.1);
    }
    const nearWindows = Math.max(0, Math.min(1, 1 - x / 4.2)); // the west rooms only
    street.gain.setTargetAtTime(0.09 * nearWindows * nearWindows, now, 0.2);
  }

  function setScene(name) {
    scene = name;
    if (ctx) world.gain.setTargetAtTime(SCENES[name], ctx.currentTime, 0.08);
  }

  function setVolume(value) {
    volume = value;
    if (ctx) master.gain.setTargetAtTime(value * value, ctx.currentTime, 0.03);
  }

  // A short burst of hiss through a filter: the body of a footstep or a clunk.
  function burst(bus, cutoff, seconds, level) {
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = stepNoise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
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

  // A tone that slides from one pitch to another and dies away.
  function slide(bus, from, to, seconds, level, shape = 'sine') {
    const now = ctx.currentTime;
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

  // One footstep. floor is 'mosaic', 'tile' or 'cement'.
  function step(floor, fast) {
    if (!ctx) return;
    burst(world, FLOORS[floor] * (0.85 + Math.random() * 0.3), 0.11, fast ? 0.34 : 0.24);
    slide(world, 95, 48, 0.08, fast ? 0.24 : 0.17); // the heel
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

  return { start, update, setScene, setVolume, step, click, level };
}
