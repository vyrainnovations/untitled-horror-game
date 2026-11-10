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
// and dark corners.
import * as THREE from 'three';

const fragmentShader = /* glsl */ `
  uniform sampler2D tFrame;
  uniform vec2 uSrc;     // size of the game picture, in pixels
  uniform vec2 uOut;     // size of the screen, in pixels
  uniform float uGrain;  // size of one speck of grain, in screen pixels
  uniform float uTime;
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

    vec3 c = texture2D(tFrame, uv).rgb;
    c = 1.0 - exp(-c * 1.25);      // bright lights roll off softly instead of clipping
    c = pow(c, vec3(1.0 / 2.2));   // linear light to screen brightness
    return toSignal(c);
  }

  void main() {
    vec2 uv = vUv;
    float px = 1.0 / uSrc.x;                        // one game pixel, sideways
    float row = floor(uv.y * uSrc.y);               // which line of the picture this is
    float frame = mod(floor(uTime * 30.0), 600.0);  // the noise changes 30 times a second

    // Tape wobble: every line sits a fraction of a pixel left or right.
    uv.x += (hash(vec3(row, frame, 1.0)) - 0.5) * 0.7 * px;

    // Tracking band: a thin strip of tearing that drifts slowly up the screen.
    float band = smoothstep(0.012, 0.0, abs(uv.y - fract(uTime * 0.045)));
    uv.x += band * (hash(vec3(row, frame, 2.0)) - 0.5) * 8.0 * px;

    // Head switching: the bottom few lines of a VHS picture are always torn.
    float tear = smoothstep(0.018, 0.0, uv.y);
    uv.x += tear * (0.4 + hash(vec3(row, frame, 3.0))) * 9.0 * px;

    // Brightness: the centre plus a little of each neighbour, so edges are
    // slightly soft, the way tape is.
    vec3 mid = tap(uv);
    float luma = mid.x * 0.5
      + (tap(uv - vec2(0.8 * px, 0.0)).x + tap(uv + vec2(0.8 * px, 0.0)).x) * 0.25;

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
    luma += fine * 0.034 + streak * 0.02;

    // Colour noise: faint blotches of wrong colour, a VHS trademark.
    float cell = floor(vUv.x * uSrc.x / 9.0);
    chroma += (vec2(hash(vec3(cell, row, frame + 80.0)), hash(vec3(cell, row, frame + 120.0))) - 0.5) * 0.022;

    // Dropouts: now and then the tape loses the signal and leaves a white dash.
    luma += step(0.99997, hash(vec3(floor(vUv.x * uSrc.x / 20.0), row, frame + 160.0))) * 0.3;

    vec3 col = toColour(vec3(luma, chroma * 0.92));

    // Scanlines: a faint dark gap between the lines of the picture. Faded
    // out when the lines are too thin to show it cleanly.
    float lineHeight = uOut.y / uSrc.y;
    float gap = 0.5 + 0.5 * cos(fract(vUv.y * uSrc.y) * 6.2831853);
    col *= 1.0 - 0.09 * gap * smoothstep(2.0, 3.0, lineHeight);

    // Snow inside the tracking band and the torn bottom lines.
    float snow = step(0.8, hash(vec3(floor(vUv.x * uSrc.x / 2.0), row, frame + 200.0)));
    col += (band * 0.5 + tear * 0.6) * snow * 0.12;

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

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tFrame: { value: target.texture },
      uSrc: { value: new THREE.Vector2(1, 1) },
      uOut: { value: new THREE.Vector2(1, 1) },
      uGrain: { value: 1 },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });

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
    material.uniforms.uSrc.value.set(gameWidth, gameHeight);
    material.uniforms.uOut.value.set(screenWidth, screenHeight);
    // About 1.5 pixels per speck on a 1080-line screen, never less than 1.
    material.uniforms.uGrain.value = Math.max(1, screenHeight / 720);
  }

  function render(scene, camera, time) {
    material.uniforms.uTime.value = time;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
  }

  return { setSize, render };
}
