// The VHS screen treatment.
//
// The game is drawn small (a few hundred lines) into an off-screen picture.
// That picture is then drawn onto the real screen through this filter. The
// filter works at the screen's full resolution, so the grain and tape damage
// stay fine and sharp instead of being blown up into big blocks along with
// the game picture.
//
// What it does, in order: tape wobble, a tracking band, torn lines at the
// bottom, soft edges, colour smear, grain, dropouts, scanlines, lifted blacks
// and dark corners. It can also look like a paused tape (the picture shivers
// and a bar of noise sits across it) and make a burst of static when the
// picture cuts from one shot to another.
import * as THREE from 'three';

const fragmentShader = /* glsl */ `
  uniform sampler2D tFrame;
  uniform vec2 uSrc;     // size of the game picture, in pixels
  uniform vec2 uOut;     // size of the screen, in pixels
  uniform float uGrain;  // size of one speck of grain, in screen pixels
  uniform float uTime;
  uniform float uBright; // the brightness setting: 1 is normal
  uniform float uWear;   // how worn the tape is: 1 is normal, 0 is clean
  uniform float uPause;  // 1 while the tape is paused
  uniform float uBurst;  // 1 for a moment when the picture cuts
  varying vec2 vUv;

  // A random number between 0 and 1 for any position. No visible pattern.
  float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  // A TV signal does not store red, green and blue. It stores brightness
  // ("luma") and two colour signals. These two functions convert.
  vec3 toSignal(vec3 c) {
    return vec3(
      dot(c, vec3(0.299, 0.587, 0.114)),
      dot(c, vec3(0.596, -0.274, -0.322)),
      dot(c, vec3(0.211, -0.523, 0.312)));
  }
  vec3 toColour(vec3 s) {
    return vec3(
      s.x + 0.956 * s.y + 0.621 * s.z,
      s.x - 0.272 * s.y - 0.647 * s.z,
      s.x - 1.106 * s.y + 1.703 * s.z);
  }

  // Read the game picture at one spot, as a TV signal.
  vec3 tap(vec2 uv) {
    // Keep every line of the picture the same height with a clean edge.
    // (Plain stretching makes some lines 2 pixels tall and others 3.)
    float y = uv.y * uSrc.y;
    float f = fract(y);
    float h = min(0.5, 0.5 * uSrc.y / uOut.y);
    float g = 0.5 + (max(0.0, f - (1.0 - h)) - max(0.0, h - f)) * (0.5 / h);
    uv.y = (floor(y) + g) / uSrc.y;
    // Sideways, blend neighbouring pixels over a little more than half their
    // width: soft like tape, but not smeared.
    float x = uv.x * uSrc.x;
    float fx = fract(x);
    float gx = 0.5 + (max(0.0, fx - 0.7) - max(0.0, 0.3 - fx)) * (0.5 / 0.3);
    uv.x = (floor(x) + gx) / uSrc.x;

    vec3 c = texture2D(tFrame, uv).rgb;
    c = 1.0 - exp(-c * 1.25 * uBright); // bright lights roll off softly instead of clipping
    c = pow(c, vec3(1.0 / 2.2));        // linear light to screen brightness
    return toSignal(c);
  }

  void main() {
    vec2 uv = vUv;
    float px = 1.0 / uSrc.x;                        // one game pixel, sideways
    float frame = mod(floor(uTime * 30.0), 600.0);  // the noise changes 30 times a second

    // A cut: for a moment the picture rolls upwards and tears sideways.
    uv.y = fract(uv.y + uBurst * uBurst * 0.22);
    // A paused tape: the whole picture shivers up and down a little.
    uv.y += uPause * (hash(vec3(frame, 5.0, 9.0)) - 0.5) * 0.004;

    float row = floor(uv.y * uSrc.y);               // which line of the picture this is

    // Tape wobble: every line sits a fraction of a pixel left or right.
    uv.x += (hash(vec3(row, frame, 1.0)) - 0.5) * (0.7 * uWear + 2.4 * uPause) * px;
    uv.x += (hash(vec3(row, frame, 7.0)) - 0.5) * 0.1 * uBurst;

    // Tracking band: a thin strip of tearing that drifts slowly up the screen.
    float band = uWear * smoothstep(0.012, 0.0, abs(uv.y - fract(uTime * 0.045)));
    uv.x += band * (hash(vec3(row, frame, 2.0)) - 0.5) * 8.0 * px;

    // Head switching: the bottom few lines of a VHS picture are always torn.
    float tear = min(uWear, 1.0) * smoothstep(0.018, 0.0, uv.y);
    uv.x += tear * (0.4 + hash(vec3(row, frame, 3.0))) * 9.0 * px;

    // A paused tape also has a bar of noise lying across it, drifting a little.
    float bar = uPause * smoothstep(0.04, 0.0, abs(vUv.y - (0.2 + 0.015 * sin(uTime * 0.7))));
    uv.x += bar * (hash(vec3(row, frame, 6.0)) - 0.5) * 34.0 * px;

    // Brightness: the centre plus a little of each neighbour, so edges are
    // slightly soft, the way tape is.
    vec3 mid = tap(uv);
    float luma = mid.x * 0.6
      + (tap(uv - vec2(0.7 * px, 0.0)).x + tap(uv + vec2(0.7 * px, 0.0)).x) * 0.2;

    // Colour: VHS stores colour with far less detail than brightness, and
    // late. So colour is smeared over several pixels and dragged to the right.
    vec2 chroma = mid.yz
      + tap(uv - vec2(1.5 * px, 0.0)).yz
      + tap(uv - vec2(3.0 * px, 0.0)).yz
      + tap(uv - vec2(4.5 * px, 0.0)).yz
      + tap(uv + vec2(1.5 * px, 0.0)).yz;
    chroma *= 0.2;

    // Grain: fine specks at screen resolution, plus short streaks along each line.
    float fine = hash(vec3(floor(vUv * uOut / uGrain), frame)) - 0.5;
    float streak = hash(vec3(floor(vUv.x * uSrc.x / 3.0), row, frame + 40.0)) - 0.5;
    luma += (fine * 0.034 + streak * 0.02) * uWear;

    // Colour noise: faint blotches of wrong colour, a VHS trademark.
    float cell = floor(vUv.x * uSrc.x / 9.0);
    chroma += (vec2(hash(vec3(cell, row, frame + 80.0)), hash(vec3(cell, row, frame + 120.0))) - 0.5) * 0.022 * uWear;

    // Dropouts: now and then the tape loses the signal and leaves a white dash.
    luma += step(1.0 - 0.00003 * uWear, hash(vec3(floor(vUv.x * uSrc.x / 20.0), row, frame + 160.0))) * 0.3;

    // A paused picture flickers slightly.
    luma *= 1.0 - uPause * 0.05 * hash(vec3(frame, 1.0, 2.0));

    vec3 col = toColour(vec3(luma, chroma * 0.92));

    // Scanlines: a faint dark gap between the lines of the picture. Faded
    // out when the lines are too thin to show it cleanly.
    float lineHeight = uOut.y / uSrc.y;
    float gap = 0.5 + 0.5 * cos(fract(vUv.y * uSrc.y) * 6.2831853);
    col *= 1.0 - 0.09 * gap * smoothstep(2.0, 3.0, lineHeight);

    // Snow: in the tracking band, the torn bottom lines, the pause bar, and
    // all over the picture during a cut.
    float snow = step(0.8, hash(vec3(floor(vUv.x * uSrc.x / 2.0), row, frame + 200.0)));
    col += (band * 0.5 + tear * 0.6) * snow * 0.12;
    float fuzz = hash(vec3(floor(vUv.x * uSrc.x / 2.0), floor(vUv.y * uSrc.y), frame + 240.0));
    col = mix(col, vec3(fuzz * 0.55), max(bar * 0.5, uBurst * 0.75));

    // Blacks that never go fully black, with a slight cool tint.
    col = col * 0.95 + vec3(0.016, 0.017, 0.024);

    // Dark corners.
    vec2 fromCentre = vUv - 0.5;
    col *= 1.0 - dot(fromCentre, fromCentre) * 0.75;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function createVhs(renderer) {
  // The off-screen picture the game is drawn into.
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const uniforms = {
    tFrame: { value: target.texture },
    uSrc: { value: new THREE.Vector2(1, 1) },
    uOut: { value: new THREE.Vector2(1, 1) },
    uGrain: { value: 1 },
    uTime: { value: 0 },
    uBright: { value: 1 },
    uWear: { value: 1 },
    uPause: { value: 0 },
    uBurst: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false });

  // A flat sheet that covers the whole screen.
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE.Camera();

  // gameWidth x gameHeight is the small picture, screenWidth x screenHeight
  // is what the filter draws onto.
  function setSize(gameWidth, gameHeight, screenWidth, screenHeight) {
    target.setSize(gameWidth, gameHeight);
    uniforms.uSrc.value.set(gameWidth, gameHeight);
    uniforms.uOut.value.set(screenWidth, screenHeight);
    // About 1.5 pixels per speck on a 1080-line screen, never less than 1.
    uniforms.uGrain.value = Math.max(1, screenHeight / 720);
  }

  // time is in seconds and keeps running while the game is paused, so that a
  // paused picture still crawls with noise.
  let lastTime = 0;
  let burst = 0;
  function render(scene, camera, time) {
    const dt = Math.min(0.1, Math.max(0, time - lastTime));
    lastTime = time;
    burst = Math.max(0, burst - dt * 3.2); // a cut's static dies away in a third of a second
    uniforms.uBurst.value = burst;
    uniforms.uTime.value = time;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
  }

  return {
    setSize,
    render,
    setBrightness: (value) => { uniforms.uBright.value = value; },
    setWear: (value) => { uniforms.uWear.value = value; },
    setPaused: (on) => { uniforms.uPause.value = on ? 1 : 0; },
    cut: () => { burst = 1; },
  };
}
