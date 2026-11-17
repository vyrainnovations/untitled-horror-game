// The warm-up test: checks the promise the loading screen makes.
//
// src/loading.js prepares everything the game will ever draw before the
// title screen comes up, so that nothing is left to prepare (and make the
// picture catch) once the game is being played. This checks that it is
// still true.
//
// With the game running in dev (npm run dev), type this in the browser's
// console:
//   (await import('/tools/warm-test.js')).run()
// It answers true if everything passed, and prints what it found. Reload
// the page afterwards.
//
// It plays the whole game by the play test (tools/play-test.js), drawing the
// picture as it goes, and watches three counts the engine keeps:
//   programs  the ways of drawing a kind of surface it has worked out
//   textures  the textures it has handed to the graphics card
//   shapes    the shapes it has handed to the graphics card
// If one of them grows after the loading screen has lifted, something was
// prepared in the middle of the game, and the loading screen missed it. It
// also asks the graphics card, after every picture, whether it refused to
// draw anything.
//
// It cannot tell how long anything takes on a slow computer, or whether a
// texture was redrawn (the phone's screen is, every message): only that
// nothing new had to be made.

import { run as playTest } from '/tools/play-test.js';

const EVERY = 3; // draw the picture every so many ticks of the game's clock

export async function run() {
  const game = window.__game;
  await game.ready;
  const info = game.renderer.info;
  const gl = game.renderer.getContext();
  const count = () => ({ programs: info.programs.length, textures: info.memory.textures, shapes: info.memory.geometries });
  const where = () => {
    const job = game.job.state();
    return `job ${job.stage}, clip ${job.clip + 1}, hunt ${job.hunt.stage}, ending ${game.ending.state().stage}`;
  };

  const start = count();
  const high = { ...start };
  const grew = [];
  const refused = [];
  const tick = game.tick;
  let ticks = 0;
  let pictures = 0;
  while (gl.getError() !== gl.NO_ERROR); // forget anything refused before the test began
  game.tick = (seconds) => {
    tick(seconds);
    ticks += 1;
    if (ticks % EVERY) return;
    game.draw();
    pictures += 1;
    const now = count();
    for (const what of Object.keys(now)) {
      if (now[what] <= high[what]) continue;
      grew.push(`${what}: ${high[what]} to ${now[what]} (${where()})`);
      high[what] = now[what];
    }
    const error = gl.getError();
    if (error !== gl.NO_ERROR && refused.length < 20) refused.push(`error ${error} (${where()})`);
  };

  let played = false;
  try {
    played = await playTest();
  } finally {
    game.tick = tick;
  }

  const passed = played && grew.length === 0 && refused.length === 0;
  console.log(
    passed
      ? `Warm-up test passed: ${pictures} pictures drawn, and nothing new was made after the loading screen (${start.programs} programs, ${start.textures} textures, ${start.shapes} shapes).`
      : 'Warm-up test FAILED:',
    { playTestPassed: played, madeInTheMiddleOfTheGame: grew, refusedByTheGraphicsCard: refused },
  );
  return passed;
}
