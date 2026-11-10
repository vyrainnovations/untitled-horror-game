// The VHS screen treatment. The game is first drawn into an off-screen image,
// then that image is drawn to the screen through this filter, which adds:
// colour bleed, wobbling lines, a tracking band, scanlines, grain, a vignette
// and washed-out blacks.
import * as THREE from 'three';

const fragmentShader = /* glsl */ `
  uniform sampler2D tFrame;
  uniform vec2 uSize;   // size of the picture in pixels
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    float line = floor(uv.y * uSize.y);
    float tick = floor(uTime * 24.0); // noise changes 24 times a second

    // Each line of the picture is nudged sideways a tiny bit, like tape wobble.
    uv.x += (hash(vec2(line, tick)) - 0.5) * 0.0018;

    // A tracking band that slowly rolls up the screen.
    float bandPos = fract(uTime * 0.07);
    float band = smoothstep(0.035, 0.0, abs(uv.y - bandPos));
    uv.x += band * (hash(vec2(line, tick + 7.0)) - 0.5) * 0.02;

    // Colour bleed: red and blue are smeared sideways, away from green.
    float px = 1.0 / uSize.x;
    vec3 col;
    col.r = (texture2D(tFrame, uv + vec2(px * 1.5, 0.0)).r + texture2D(tFrame, uv + vec2(px * 3.0, 0.0)).r) * 0.5;
    col.g = texture2D(tFrame, uv).g;
    col.b = (texture2D(tFrame, uv - vec2(px * 1.5, 0.0)).b + texture2D(tFrame, uv - vec2(px * 3.0, 0.0)).b) * 0.5;

    // Linear light to screen brightness.
    col = pow(max(col, 0.0), vec3(1.0 / 2.2));

    // Slightly faded colour, and blacks that never go fully black.
    float grey = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(grey), col, 0.85);
    col = col * 0.94 + vec3(0.022, 0.022, 0.032);

    // Scanlines: every other line a little darker.
    col *= 1.0 - 0.1 * mod(line, 2.0);

    // Grain, plus extra snow inside the tracking band.
    float grain = hash(vUv * uSize + tick * 3.7) - 0.5;
    col += grain * 0.075;
    col += band * hash(vec2(vUv.x * uSize.x * 0.3 + tick, line)) * 0.12;

    // Dark corners.
    vec2 fromCentre = vUv - 0.5;
    col *= 1.0 - dot(fromCentre, fromCentre) * 0.9;

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
  // The off-screen image the game is drawn into. Nearest = hard pixels.
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.LinearFilter,
  });

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tFrame: { value: target.texture },
      uSize: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });

  // A single triangle that covers the whole screen.
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE.Camera();

  function setSize(width, height) {
    target.setSize(width, height);
    material.uniforms.uSize.value.set(width, height);
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
