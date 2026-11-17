// The loading screen, and what the game does behind it.
//
// The game has nothing to fetch but its own code: the flat is built, and
// every texture painted, by that code when the page opens. So there are no
// files to wait for. What there is to wait for is the graphics card.
//
// A browser puts off the expensive part of drawing a thing until the first
// time the thing is on the screen. Only then does it work out how to draw
// that kind of surface, and hand the thing's shape and its texture over to
// the graphics card. Left alone, that would happen in the middle of the
// game: the first look into each room, the first tape, the first sight of a
// figure would each make the picture catch for a moment, and on a slow
// computer for a long moment, right when it matters most.
//
// So all of it is done here, once, before the title screen, behind the
// loading screen:
//   1. work out how to draw every kind of surface in the flat;
//   2. draw one real frame, which is when the shadows are drawn;
//   3. draw every tape once, at every step back into the past;
//   4. draw every single thing in the flat once, shown or hidden, in view or
//      not, into a scrap of picture nobody sees.
// After that there is nothing left to prepare while the game is played.
// tools/warm-test.js checks that this stays true.
//
// The screen itself is written in index.html, so that it is up before any of
// this code has arrived. It looks like the menu and has the title in the
// same place: when it lifts, the menu is underneath.
import * as THREE from 'three';

const AT_LEAST = 900; // ms the screen is up at the least, so that it never just flickers past
const SETTLE = 450; // ms the menu is given to settle into place underneath, before the screen lifts
const FADE = 700; // ms the screen takes to fade (the same as in loading.css)
const NEEDS_KEYS = 'This game needs a keyboard and a mouse. Open it on a computer.';

const wait = (ms) => new Promise((go) => setTimeout(go, ms));
// Let the page draw what has changed on it (the bar, the words) before going
// on. A browser only draws between two pieces of work, so this ends one. In
// a tab that is not being looked at, nothing is drawn at all: there, it only
// waits a moment, so that the game still gets ready in the background.
const breathe = () => new Promise((go) => {
  const anyway = setTimeout(go, 120);
  requestAnimationFrame(() => setTimeout(() => {
    clearTimeout(anyway);
    go();
  }, 0));
});

// The screen: its bar, its words, and taking it away.
export function createLoading(title) {
  const root = document.getElementById('loading');
  const words = root.querySelector('.loading__words');
  const percent = root.querySelector('.loading__percent');
  const hint = root.querySelector('.loading__hint');
  const titleEl = root.querySelector('.menu__title');
  // The name of the game is written in the page so that it shows at once.
  // Should it ever differ from the real one, the real one wins.
  titleEl.textContent = title;
  titleEl.dataset.text = title;

  // A phone or a tablet has no keyboard and no mouse to capture, and the game
  // cannot be played without them. Say so, rather than let it look broken.
  const touchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (touchOnly) hint.textContent = NEEDS_KEYS;

  // Something that cannot be measured is going on: the bar runs.
  function busy(text) {
    root.classList.add('is-fetching');
    words.textContent = text;
    percent.textContent = '';
  }

  // This much is done, from 0 to 1: the bar fills.
  function say(fraction, text) {
    root.classList.remove('is-fetching');
    root.style.setProperty('--done', fraction.toFixed(3));
    percent.textContent = `${Math.round(fraction * 100)}%`;
    if (text) words.textContent = text;
  }

  // Everything is ready. begin() starts the game underneath (the menu, the
  // picture); then the screen fades away and is gone.
  async function finish(begin) {
    say(1, 'Ready');
    const upFor = performance.now(); // since the page was opened
    if (upFor < AT_LEAST) await wait(AT_LEAST - upFor);
    if (touchOnly) {
      // Nothing to play it with. Let them through to look, if they ask.
      root.classList.add('is-waiting');
      words.textContent = 'Tap to look anyway';
      percent.textContent = '';
      await new Promise((go) => root.addEventListener('pointerup', go, { once: true }));
    }
    begin();
    await wait(SETTLE);
    root.classList.add('is-ready');
    setTimeout(() => root.remove(), FADE + 100);
  }

  return { busy, say, finish };
}

// Get everything ready to be drawn. drawFrame() draws one real frame of the
// game; tapes are the clips in src/clips.js; loading is the screen above.
export async function prepare({ renderer, scene, camera, footage, tapes, drawFrame, loading }) {
  // A scrap of picture to draw into. Nothing drawn into it is ever shown.
  // (It is the same kind of picture as the game's own, so that what is
  // worked out for it holds for the game.)
  const scrap = new THREE.WebGLRenderTarget(8, 8, { type: THREE.HalfFloatType });
  // Shadows are drawn once, for the flat as it really is. Nothing drawn off
  // stage may be the picture they get drawn from. (src/footage.js takes the
  // same care with the tapes.)
  const offStage = (draw) => {
    const pending = renderer.shadowMap.needsUpdate;
    renderer.shadowMap.needsUpdate = false;
    renderer.setRenderTarget(scrap);
    draw();
    renderer.setRenderTarget(null);
    renderer.shadowMap.needsUpdate = pending;
  };

  // 1. How to draw every kind of surface. On a slow computer this is the long
  //    one, and there is no telling how long. The browser can do it without
  //    the page freezing, so the bar keeps running meanwhile.
  loading.busy('Lighting the flat');
  await breathe();
  let worked;
  offStage(() => { worked = renderer.compileAsync(scene, camera); });
  await worked;

  // 2. One real frame. This is when the shadows are drawn.
  loading.say(0.05, 'Drawing the shadows');
  await breathe();
  drawFrame();

  // 3. Every tape, at every step back into the past, in the middle of its
  //    moment (when whatever moves on it is in the picture). The tapes show
  //    people, and things in their night colours, that nothing else does.
  const shots = [];
  for (const tape of tapes) {
    const middle = (tape.moment.from + tape.moment.to) / 2;
    tape.past.forEach((step, depth) => shots.push([tape, middle, depth]));
    if (tape.torch) shots.push([tape, middle, tape.torch]);
  }
  loading.say(0.2, 'Winding the tapes');
  await breathe();
  for (const [i, shot] of shots.entries()) {
    footage.film(...shot);
    if (i % 3 === 2) {
      loading.say(0.2 + (0.55 * (i + 1)) / shots.length);
      await breathe();
    }
  }

  // 4. Everything in the flat, once: what is hidden for now (the people, the
  //    phone, what the chores bring out) and what is out of sight, as well
  //    as what is in view. Each thing's shape and texture goes to the
  //    graphics card as it is drawn. Everything is put back as it was.
  loading.say(0.78, 'Opening every room');
  await breathe();
  //    (A hidden thing with a light in it is left hidden: showing a light
  //    changes how everything else has to be drawn. There are none today.)
  const holdsLight = (thing) => {
    let found = false;
    thing.traverse((part) => { found = found || !!part.isLight; });
    return found;
  };
  offStage(() => {
    const hidden = [];
    const onlyInView = [];
    scene.traverse((thing) => {
      if (!thing.visible && !holdsLight(thing)) {
        hidden.push(thing);
        thing.visible = true;
      }
      if (thing.frustumCulled) {
        onlyInView.push(thing);
        thing.frustumCulled = false;
      }
    });
    renderer.render(scene, camera);
    for (const thing of hidden) thing.visible = false;
    for (const thing of onlyInView) thing.frustumCulled = true;
  });
  scrap.dispose();

  // 5. And a real frame again, so the picture that is waiting under the
  //    loading screen is the right one.
  loading.say(0.96);
  await breathe();
  drawFrame();
}
