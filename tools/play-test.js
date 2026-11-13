// The play test: plays the game so far from the title screen, by the test
// hooks, as fast as the computer can, and checks each step on the way.
//
// With the game running in dev (npm run dev), type this in the browser's
// console:
//   (await import('/tools/play-test.js')).run()
// It answers true if everything passed, and prints what it found. Reload
// the page afterwards.
//
// It does what a player would do, by standing the player in the right spot,
// looking at the right thing and pressing the right key. It cannot tell
// whether anything looks or sounds right: that still needs a person.
//
// Other helpers, for poking about by hand:
//   toEditor()   plays up to sitting at the PC with the first clip loaded
//   key(code)    presses and lets go of a key, e.g. key('Space')

const STEP = 0.05; // seconds of game time per tick

const g = () => window.__game;
export function tick(seconds) {
  for (let i = 0; i < Math.round(seconds / STEP); i++) g().tick(STEP);
}
export function key(code, hold = 0) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
  if (hold) tick(hold);
  window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
}
// Stand at (x, z) on the plan and look at the point (tx, ty, tz).
// Answers what the prompt says.
export function stand(x, z, tx, ty, tz) {
  const yaw = Math.atan2(-(tx - x), -(tz - z));
  const pitch = Math.atan2(ty - 1.5, Math.hypot(tx - x, tz - z));
  g().player.reset({ x, z, yaw, pitch });
  tick(STEP);
  return g().hud.says().prompt;
}

const problems = [];
let checks = 0;
function expect(what, actual, wanted) {
  checks += 1;
  const ok = typeof wanted === 'function' ? wanted(actual) : actual === wanted;
  if (!ok) problems.push(`${what}: got ${JSON.stringify(actual)}, wanted ${typeof wanted === 'function' ? 'something else' : JSON.stringify(wanted)}`);
  return ok;
}

// Part 1: the chores.
export function doChores() {
  expect('prompt at the bag', stand(3.2, 10.3, 3.84, 0.22, 10.7), 'Pick up the rubbish');
  key('KeyE');
  tick(1);
  expect('prompt at the front door', stand(4.9, 10.9, 4.95, 1.25, 11.95), 'Put the rubbish out');
  key('KeyE');
  tick(3);
  expect('prompt at the bolt', stand(4.9, 11.2, 4.69, 1.87, 11.92), 'Slide the bolt');
  key('KeyE');
  tick(1);
  expect('prompt at the hob', stand(1.47, 11.05, 1.466, 1.0, 11.62), 'Light the ring');
  key('KeyE');
  tick(7);
  expect('prompt at the phone', stand(3.1, 1.06, 3.095, 0.77, 0.57), 'Pick up the phone');
  key('KeyE');
  tick(1);
}

// Part 2, beat 6: the phone.
export function doPhone() {
  const phone = () => g().job.parts.phone.state();
  expect('the phone is up', phone().up, true);
  for (let reply = 0; reply < 2; reply++) {
    for (let i = 0; i < 200 && !phone().yourTurn; i++) tick(STEP);
    expect(`reply ${reply + 1} is waiting`, g().hud.says().prompt, 'Send');
    key('KeyE');
  }
  for (let i = 0; i < 400 && !phone().finished; i++) tick(STEP);
  expect('the files have come', phone().finished, true);
  tick(0.5);
  expect('prompt when the files are in', g().hud.says().prompt, 'Put the phone away');
  key('KeyE');
  tick(1);
  expect('the phone is down', phone().up, false);
  tick(1.5);
  expect('task after the phone', g().hud.says().task, 'Sit down at the PC');
}

// Part 2: sitting down at the PC.
export function doSit() {
  expect('prompt at the monitor', stand(2.5, 1.9, 2.5, 1.05, 0.26), 'Sit down');
  key('KeyE');
  tick(1.2);
  expect('sat down', g().job.parts.seat.state().seated, true);
  tick(2);
  expect('task at the PC', g().hud.says().task, 'Find the frame where it goes wrong');
}

export async function toEditor() {
  if (g().mode() !== 'title') g().toTitle();
  await g().play();
  g().hold(true);
  doChores();
  doPhone();
  doSit();
  return problems.length === 0;
}

// Part 2, beats 7 and 8: the first clip.
export function doClipOne() {
  const ed = () => g().job.parts.editor.state();
  key('Space');
  tick(12.4); // to the middle of the moment
  expect('static while playing over the moment', ed().static, (s) => s > 0.9);
  key('KeyE');
  expect('cannot mark through the static', ed().marked, null);
  tick(12);
  expect('the tape played to the end', ed().t, 24);
  expect('the timeline shows the damage', ed().damageSeen, true);
  // Each scrub back from after the moment takes the tape a step further into the past.
  for (let pass = 1; pass <= 3; pass++) {
    key('KeyA', 1.6);
    expect(`one step further back on scrub ${pass}`, ed().depth, pass);
    tick(0.2);
    if (pass < 3) key('KeyD', 2.5); // forward again
  }
  key('KeyA', 0.5);
  expect('no further back than the night itself', ed().depth, 3);
  // Now at the night itself. Come back into the moment from after it, and stop in it.
  key('KeyD', 3);
  const t0 = ed().t;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  for (let i = 0; i < 400 && ed().t > 13.2; i++) tick(STEP);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }));
  expect('stopped inside the moment', ed().t, (t) => t > 11.6 && t < 14.2);
  expect('the static has gone, this far back', ed().static, (s) => s < 0.3);
  expect('the moment was reached from after it', t0, (t) => t > 14.2);
  key('KeyE');
  expect('the frame is marked', ed().marked, (m) => m !== null);
  tick(2.5);
  expect('the answer comes in', g().hud.says().banner, (b) => !!b && b.includes("That's it. That's exactly it. Keep going."));
  tick(3);
  expect('the end of what is built', g().hud.says().task, 'That is as far as the game goes for now.');
}

// Pausing and going back to the title.
export async function doPauseAndRestart() {
  g().pause();
  const before = JSON.stringify(g().job.state());
  tick(2);
  expect('nothing moves while paused', JSON.stringify(g().job.state()), before);
  key('KeyQ');
  expect('Q does nothing while paused', g().job.parts.seat.state().seated, true);
  g().toTitle();
  const s = g().job.state();
  expect('back at the title, the job is reset', s.stage, 'waiting');
  expect('back at the title, nobody is sitting', s.seat.seated, false);
  expect('back at the title, the phone is down', s.phone.up, false);
  expect('back at the title, the monitor is off', s.editor.clip, -1);
  expect('back at the title, the camera is wide again', g().camera.fov, g().settings.get('fieldOfView'));
}

export async function run() {
  problems.length = 0;
  checks = 0;
  const started = performance.now();
  await toEditor();
  doClipOne();
  // Standing up and sitting down again.
  key('KeyQ');
  tick(1.2);
  expect('stood up', g().job.parts.seat.state().seated, false);
  expect('walking again', g().job.hands(), 'walk');
  expect('prompt to sit again', stand(2.5, 1.9, 2.5, 1.05, 0.26), 'Sit down');
  key('KeyE');
  tick(1.2);
  expect('sat down again', g().job.parts.seat.state().seated, true);
  await doPauseAndRestart();
  // And once more from the start, to show a second game starts clean.
  await toEditor();
  expect('second game: the first clip starts at the beginning', g().job.parts.editor.state().t, 0);
  expect('second game: the first clip starts a year on', g().job.parts.editor.state().depth, 0);
  g().toTitle();
  g().hold(false);
  const passed = problems.length === 0;
  const took = ((performance.now() - started) / 1000).toFixed(1);
  console.log(passed ? `Play test passed: ${checks} checks in ${took} s.` : `Play test FAILED, ${problems.length} of ${checks} checks:`, problems);
  return passed;
}
