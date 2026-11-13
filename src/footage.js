// The tapes: the flat as Hamza's camera filmed it. STORY.md, rule 2: the
// tape shows what is really there.
//
// The footage is not a video file. It is the flat itself, drawn by the same
// engine from where the camera stood, as it was on the date burnt into the
// corner: emptied a year on, or with Saad's things back in it. That is what
// lets it change each time the player scrubs back. The picture is drawn
// small (a camcorder's 4:3) and then given the camera's night look: black
// and white, lit only by the camera's own infra-red lamp, grain, and the
// static that hides the moment something goes wrong.
//
// The editing program (src/editor.js) puts that picture on the monitor.
import * as THREE from 'three';

const SIZE = [240, 180]; // the tape's picture, in pixels
const LAMP = 7; // how bright the camera's infra-red lamp is
const PALE = 0xbdbdbd; // the grey that black plastic shows up as under that lamp
const OSD = [480, 360]; // the writing burnt into the picture: date, time, PLAY

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D tRaw;   // the flat, as the tape camera sees it
  uniform sampler2D tOsd;   // the writing burnt into the picture
  uniform float uTime;
  uniform float uStatic;    // 1: the picture is lost in static
  uniform float uColour;    // 0: night picture, black and white. 1: colour
  uniform float uRewind;    // 1 while scrubbing back: the tape tears
  uniform float uJump;      // 1 for a moment when the tape jumps back in time
  uniform float uOn;        // 0: nothing loaded, a blue screen
  varying vec2 vUv;

  float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec2 uv = vUv;
    float frame = floor(uTime * 25.0);
    float row = floor(uv.y * 180.0);

    // Jumping back in time: the picture rolls once.
    uv.y = fract(uv.y - uJump * uJump * 0.7);
    // Scrubbing back: a band of tearing crawls down the picture, and every
    // line jitters sideways.
    float band = uRewind * smoothstep(0.08, 0.0, abs(uv.y - fract(1.0 - uTime * 0.8)));
    uv.x += (hash(vec3(row, frame, 1.0)) - 0.5) * (0.003 + 0.016 * uRewind);
    uv.x += band * (hash(vec3(row, frame, 2.0)) - 0.5) * 0.14;

    vec3 c = texture2D(tRaw, uv).rgb;
    c = 1.0 - exp(-c * 1.5);
    c = pow(c, vec3(1.0 / 2.2));
    float luma = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 night = vec3(0.84, 1.0, 0.88) * smoothstep(0.015, 0.9, luma);
    vec3 col = mix(night, c, uColour);

    col += (hash(vec3(floor(vUv * vec2(240.0, 180.0)), frame)) - 0.5) * 0.085;
    col += band * step(0.72, hash(vec3(floor(vUv.x * 90.0), row, frame + 9.0))) * 0.55;

    // Static: snow, with slow bright and dark bars rolling through it.
    float snow = hash(vec3(floor(vUv * vec2(240.0, 180.0)), frame + 50.0));
    float bars = 0.7 + 0.3 * sin(vUv.y * 23.0 + uTime * 21.0);
    col = mix(col, vec3(snow * bars), clamp(uStatic, 0.0, 1.0) * 0.94);

    // A blank tape is a flat blue, as a VCR shows it.
    col = mix(vec3(0.07, 0.12, 0.42), col, uOn);

    vec4 osd = texture2D(tOsd, vUv);
    col = mix(col, osd.rgb, osd.a);

    vec2 d = vUv - 0.5;
    col *= 1.0 - dot(d, d) * 0.9;
    gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), 1.0);
  }
`;

export function createFootage({ renderer, scene, apartment }) {
  const { rooms, things, lights, bulbLook } = apartment;

  const raw = new THREE.WebGLRenderTarget(SIZE[0], SIZE[1], {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
  const camera = new THREE.PerspectiveCamera(46, SIZE[0] / SIZE[1], 0.05, 30);

  // The camera's own lamp: in the emptied flat, the only light there is.
  // It is in the flat from the start, turned down to nothing, because adding
  // a light later makes the game stop for a moment.
  const lamp = new THREE.PointLight(0xffffff, 0, 16, 1.1);
  scene.add(lamp);

  // The things that move on the tapes are copies, seen only on the tapes, so
  // the real ones can stay where the player left them.
  // Under an infra-red lamp, black plastic shows up pale, so on the night
  // picture each copy wears a lighter version of its materials.
  const props = {};
  const nightLook = new Map(); // part of a copy -> [its own material, its night material]
  const pale = new THREE.MeshLambertMaterial({ color: PALE });
  const copy = (name, original) => {
    const twin = original.clone(true);
    twin.traverse((part) => {
      if (!part.isMesh) return;
      part.castShadow = false;
      nightLook.set(part, [part.material, pale]);
    });
    twin.visible = false;
    scene.add(twin);
    props[name] = twin;
  };
  copy('bag', things.rubbishBag);
  const wearNight = (on) => {
    for (const [part, [own, night]] of nightLook) part.material = on ? night : own;
  };

  // Which of his things a tape can show, by name (see "shows" in src/clips.js).
  const otherRooms = Object.keys(rooms).filter((name) => name !== 'corridor').map((name) => rooms[name]);
  const SETS = {
    hallByDoor: things.hallByDoor,
    hallWalls: things.hallWalls,
    rooms: otherRooms,
  };
  // The flat's own lights: off in the emptied flat. The street lamp outside,
  // and the neighbours' lights, still shine in.
  const OWN_LIGHTS = [lights.bulb, lights.strip, lights.screen, lights.screenFill, lights.ring];

  // The writing burnt into the picture.
  const osdCanvas = document.createElement('canvas');
  osdCanvas.width = OSD[0];
  osdCanvas.height = OSD[1];
  const osd = osdCanvas.getContext('2d');
  const osdTexture = new THREE.CanvasTexture(osdCanvas);
  let osdSaid = '';

  const uniforms = {
    tRaw: { value: raw.texture },
    tOsd: { value: osdTexture },
    uTime: { value: 0 },
    uStatic: { value: 0 },
    uColour: { value: 0 },
    uRewind: { value: 0 },
    uJump: { value: 0 },
    uOn: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, fog: false });

  // Where the moving things are at a moment of the tape.
  const smooth = (k) => k * k * (3 - 2 * k);
  function stage(clip, t) {
    for (const move of clip.moves) {
      const thing = props[move.thing];
      thing.visible = true;
      const u = Math.max(0, Math.min(1, (t - clip.moment.from) / (clip.moment.to - clip.moment.from)));
      // Dragged, not carried: it starts, catches, and goes on again.
      const k = u < 0.45 ? smooth(u / 0.45) * 0.42 : 0.42 + smooth((u - 0.45) / 0.55) * 0.58;
      const a = (1 - k) * (1 - k);
      const b = 2 * (1 - k) * k;
      const c = k * k;
      thing.position.set(
        a * move.from[0] + b * move.bend[0] + c * move.to[0],
        0,
        a * move.from[1] + b * move.bend[1] + c * move.to[1],
      );
      thing.rotation.set(0, move.from[2] + (move.to[2] - move.from[2]) * k, Math.sin(u * Math.PI) * 0.06);
    }
  }

  // Draw one frame of a tape: clip at t seconds, the past at step `depth`.
  // Everything changed for it is put back straight afterwards.
  const unlit = new THREE.Color();
  function film(clip, t, depth) {
    const look = clip.past[depth];
    const shows = new Set(look.shows);
    const undo = [];
    const set = (object, key, value) => {
      undo.push([object, key, object[key]]);
      object[key] = value;
    };

    for (const [name, groups] of Object.entries(SETS)) for (const g of groups) set(g, 'visible', shows.has(name));
    set(things.ringFlame, 'visible', false); // nobody has lit a ring on these tapes, yet
    for (const light of OWN_LIGHTS) set(light, 'intensity', light.intensity * look.lights);
    set(lights.sky, 'intensity', lights.sky.intensity * (0.25 + 0.75 * look.lights));
    if (!shows.has('bulb')) {
      set(bulbLook.haze, 'visible', false);
      unlit.copy(bulbLook.material.color);
      bulbLook.material.color.copy(bulbLook.dead);
    }
    set(lamp, 'intensity', LAMP * (1 - 0.7 * look.lights));
    set(scene.fog, 'near', 4);
    set(scene.fog, 'far', 18);
    lamp.position.set(...clip.camera.at);
    camera.position.set(...clip.camera.at);
    camera.lookAt(...clip.camera.look);
    if (camera.fov !== clip.camera.fov) {
      camera.fov = clip.camera.fov;
      camera.updateProjectionMatrix();
    }
    stage(clip, t);
    wearNight(look.colour < 0.5);

    // Shadows are drawn once, for the flat as it is now. Never let a tape
    // be the picture they get drawn from.
    const pending = renderer.shadowMap.needsUpdate;
    renderer.shadowMap.needsUpdate = false;
    renderer.setRenderTarget(raw);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.shadowMap.needsUpdate = pending;

    for (const [object, key, value] of undo.reverse()) object[key] = value;
    if (!shows.has('bulb')) bulbLook.material.color.copy(unlit);
    for (const thing of Object.values(props)) thing.visible = false;
  }

  // The writing in the corners of the picture. state is 'PLAY', 'PAUSE',
  // 'REW' or 'FWD'. Only redrawn when it changes.
  function caption(state, date, time) {
    const said = `${state}|${date}|${time}`;
    if (said === osdSaid) return;
    osdSaid = said;
    const [W, H] = OSD;
    osd.clearRect(0, 0, W, H);
    osd.font = '600 30px "Cascadia Mono", Consolas, "Courier New", monospace';
    osd.textBaseline = 'alphabetic';
    osd.lineWidth = 5;
    osd.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    osd.fillStyle = '#f2f2ea';
    const write = (text, x, y, align = 'left') => {
      osd.textAlign = align;
      osd.strokeText(text, x, y);
      osd.fillText(text, x, y);
    };
    if (state) {
      write(state, 26, 46);
      const x = 26 + osd.measureText(state).width + 16;
      osd.beginPath();
      if (state === 'PLAY') {
        osd.moveTo(x, 22); osd.lineTo(x + 20, 34); osd.lineTo(x, 46);
      } else if (state === 'PAUSE') {
        osd.rect(x, 23, 7, 23); osd.rect(x + 12, 23, 7, 23);
      } else {
        const back = state === 'REW' ? -1 : 1;
        for (const dx of [0, 17]) {
          const tip = back < 0 ? x + dx : x + dx + 17;
          const tail = back < 0 ? x + dx + 17 : x + dx;
          osd.moveTo(tail, 23); osd.lineTo(tip, 34.5); osd.lineTo(tail, 46);
        }
      }
      osd.closePath();
      osd.stroke();
      osd.fill();
    }
    if (date) write(date, 26, H - 26);
    if (time) write(time, W - 26, H - 26, 'right');
    osdTexture.needsUpdate = true;
  }

  return {
    material, // for the monitor: the footage, with the night look
    film,
    caption,
    // The look on top: how much static, colour, tearing and jumping.
    set({ time, static: snow = 0, colour = 0, rewind = 0, jump = 0, on = 1 }) {
      uniforms.uTime.value = time;
      uniforms.uStatic.value = snow;
      uniforms.uColour.value = colour;
      uniforms.uRewind.value = rewind;
      uniforms.uJump.value = jump;
      uniforms.uOn.value = on;
    },
    // For tests.
    camera,
    props,
    target: raw,
  };
}
