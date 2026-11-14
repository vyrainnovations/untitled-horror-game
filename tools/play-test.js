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

import { CLIPS } from '/src/clips.js';

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
  expect('the ring is lit', g().chores.state().ringLit, true);
  expect('the gas knob is turned on', g().chores.state().knob, -1.4);
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

// Part 2, beats 7 to 9: a clip, from the static to the mark.
export function doClip(index) {
  const ed = () => g().job.parts.editor.state();
  const clip = CLIPS[index];
  const { from, to } = clip.moment;
  const name = `clip ${index + 1}`;
  expect(`${name} is loaded`, ed().clip, index);
  expect(`${name} starts at the beginning, a year on`, [ed().t, ed().depth].join(), '0,0');
  key('Space');
  tick((from + to) / 2); // to the middle of the moment
  expect(`${name}: static while playing over the moment`, ed().static, (s) => s > 0.9);
  key('KeyE');
  expect(`${name}: cannot mark through the static`, ed().marked, null);
  tick(clip.length);
  expect(`${name}: the tape played to the end`, ed().t, clip.length);
  expect(`${name}: the timeline shows the damage`, ed().damageSeen, true);
  // Each scrub back from after the moment takes the tape a step further into the past.
  for (let pass = 1; pass < clip.past.length; pass++) {
    key('KeyA', 1.6);
    expect(`${name}: one step further back on scrub ${pass}`, ed().depth, pass);
    tick(0.2);
    if (pass < clip.past.length - 1) key('KeyD', 2.5); // forward again
  }
  key('KeyA', 0.5);
  expect(`${name}: no further back than the night itself`, ed().depth, clip.past.length - 1);
  // Now at the night itself. Come back into the moment from after it, and stop in it.
  key('KeyD', clip.length);
  const t0 = ed().t;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  for (let i = 0; i < 600 && ed().t > to - 0.6 * (to - from); i++) tick(STEP);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }));
  expect(`${name}: stopped inside the moment`, ed().t, (t) => t > from && t < to);
  expect(`${name}: the static has gone, this far back`, ed().static, (s) => s < 0.3);
  expect(`${name}: the moment was reached from after it`, t0, (t) => t > to);
  key('KeyE');
  expect(`${name}: the frame is marked`, ed().marked, (m) => m !== null);
}

// What follows the mark on clip 1: the answer, and clip 2.
export function doAnswerOne() {
  tick(2.5);
  expect('clip 1 is answered', g().hud.says().banner, (b) => !!b && b.includes(CLIPS[0].reply[0]));
  tick(2.5);
  expect('then clip 2 is loaded', g().job.parts.editor.state().clip, 1);
  expect('task for clip 2', g().hud.says().task, 'Find the frame where it goes wrong');
}

// What follows the mark on clip 2: the tape jumps on to 3:07 and its door
// is hammered on; then the real front door (beat 10).
export function doDoor() {
  const ed = () => g().job.parts.editor.state();
  const door = () => g().job.parts.door.state();
  tick(1.2);
  expect('the tape jumps on by itself', ed().jumpedOn, (s) => s > 0);
  expect('and plays', ed().playing, true);
  tick(CLIPS[1].jumpsOn.seconds);
  expect('then the tape runs out', ed().ended, true);
  tick(1.5);
  expect('the real door is hammered on', door().stage, 'hammering');
  expect('task while it is hammered on', g().hud.says().task, 'Someone is at the front door');
  tick(5.5);
  expect('a hint to get up', g().hud.says().hint, 'Press Q to stand up.');
  expect('still hammering while he sits', door().stage, 'hammering');
  key('KeyQ');
  tick(1.2);
  expect('stood up', g().job.hands(), 'walk');
  stand(4.95, 9.0, 4.95, 1.5, 11.9);
  expect('still hammering from the far end of the corridor', door().stage, 'hammering');
  stand(4.95, 9.6, 4.95, 1.5, 11.9);
  expect('it stops when he gets near', door().stage, 'stopped');
  expect('the door is still again', door().shake, 0);
  tick(0.5);
  expect('no prompt from out of reach', g().hud.says().prompt, null);
  expect('prompt at the peephole', stand(4.95, 10.9, 4.95, 1.52, 11.936), 'Look through the peephole');
  key('KeyE');
  tick(0.1);
  expect('an eye to the peephole', g().job.hands(), 'door');
  tick(3);
  expect('back from the peephole', g().job.hands(), 'walk');
  expect('the view is normal again', g().camera.fov, g().settings.get('fieldOfView'));
  tick(2.2);
  expect('then the answer comes', g().hud.says().banner, (b) => !!b && b.includes(CLIPS[1].reply[0]));
  tick(2.5);
  expect('then clip 3 is loaded', g().job.parts.editor.state().clip, 2);
  expect('standing at the door, the task is to sit down again', g().hud.says().task, 'Sit down at the PC');
}

// What follows the mark on clip 3: the real flame has gone out, the chai
// has boiled over, the gas hisses, and three messages come in.
export function doAnswerThree() {
  const chores = () => g().chores.state();
  expect('the real ring has gone out', chores().ringLit, false);
  expect('the chai has boiled over in the real kitchen', chores().boiledOver, true);
  expect('the gas knob is still on', chores().knob, -1.4);
  tick(2);
  for (const [i, words] of CLIPS[2].reply.entries()) {
    expect(`message ${i + 1} after clip 3`, g().hud.says().banner, (b) => !!b && b.includes(words));
    tick(3.6);
  }
  tick(1.5);
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
  doClip(0);
  doAnswerOne();
  // Standing up and sitting down again.
  key('KeyQ');
  tick(1.2);
  expect('stood up', g().job.parts.seat.state().seated, false);
  expect('walking again', g().job.hands(), 'walk');
  expect('prompt to sit again', stand(2.5, 1.9, 2.5, 1.05, 0.26), 'Sit down');
  key('KeyE');
  tick(1.2);
  expect('sat down again', g().job.parts.seat.state().seated, true);
  expect('sat down again, the task is still the clip', g().hud.says().task, 'Find the frame where it goes wrong');
  doClip(1);
  doDoor();
  expect('back to the PC', stand(2.5, 1.9, 2.5, 1.05, 0.26), 'Sit down');
  key('KeyE');
  tick(1.2);
  tick(2);
  expect('sat down, the task is clip 3', g().hud.says().task, 'Find the frame where it goes wrong');
  doClip(2);
  doAnswerThree();
  await doPauseAndRestart();
  expect('back at the title, the ring is out and nothing hisses', [g().chores.state().ringLit, g().chores.state().boiledOver, g().chores.state().knob].join(), 'false,false,0');
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
