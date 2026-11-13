// What is on the screen while you play (the look of it is in hud.css):
//
//   the task line   one small line, top left, saying what to do now. When
//                   the job is done it is ticked and struck out, stays a
//                   moment, and the next one takes its place.
//   the hint        a quieter line under it, for a player who looks lost.
//   the prompt      "E  Pick up the rubbish", low on the screen, while you
//                   are looking at something you can use.
//   the dot         in the middle of the screen, to aim with.
//
// Nothing here knows what the tasks are. src/chores.js tells it what to say.

const TICK_HOLD = 1.3; // seconds a ticked line stays on the screen before it goes
const FADE = 0.4; // seconds a line takes to fade out, or in

export function createHud() {
  const root = document.createElement('div');
  root.className = 'hud';
  root.hidden = true;
  root.innerHTML = `
    <div class="hud__task">
      <p class="hud__line"></p>
      <p class="hud__hint"></p>
    </div>
    <span class="hud__dot"></span>
    <p class="hud__prompt"><span class="hud__key">E</span><span class="hud__does"></span></p>`;
  document.body.appendChild(root);
  const taskEl = root.querySelector('.hud__task');
  const hintEl = root.querySelector('.hud__hint');
  const dotEl = root.querySelector('.hud__dot');
  const promptEl = root.querySelector('.hud__prompt');
  const doesEl = root.querySelector('.hud__does');
  let lineEl = root.querySelector('.hud__line');

  // --- The task line ---------------------------------------------------------
  // Lines change one at a time. A new one waits in the queue until the old
  // one has been ticked off (if it was finished) and has faded away.
  const queue = [];
  let showing = false; // is there a line on the screen
  let stage = 'steady'; // 'steady', 'ticked' (struck out, being read) or 'leaving' (fading away)
  let wait = 0; // seconds until the stage is over

  // Say what to do now. ticked: the line that is up was finished, so tick it
  // off first. plain: this is a note from the game, not a job (no square).
  // A text of null just takes the old line away.
  function task(text, { ticked = false, plain = false } = {}) {
    queue.push({ text, ticked, plain });
  }

  function update(dt) {
    if (wait > 0) {
      wait -= dt;
      if (wait > 0) return;
    }
    if (stage === 'ticked') {
      lineEl.classList.remove('is-in');
      stage = 'leaving';
      wait = FADE;
      return;
    }
    if (stage === 'leaving') {
      stage = 'steady';
      showing = false;
    }
    if (!queue.length) return;
    const change = queue[0];
    if (showing) {
      // Take the old line away first, with or without a tick.
      if (change.ticked) {
        lineEl.classList.add('is-done');
        stage = 'ticked';
        wait = TICK_HOLD;
      } else {
        lineEl.classList.remove('is-in');
        stage = 'leaving';
        wait = FADE;
      }
      return;
    }
    queue.shift();
    if (change.text === null) return;
    // A brand new line each time, so nothing is left over from the last one.
    const fresh = document.createElement('p');
    fresh.className = change.plain ? 'hud__line is-plain' : 'hud__line';
    const box = document.createElement('span');
    box.className = 'hud__box';
    const words = document.createElement('span');
    words.className = 'hud__words';
    words.textContent = change.text;
    fresh.append(box, words);
    lineEl.replaceWith(fresh);
    lineEl = fresh;
    void fresh.offsetWidth; // lets it fade in instead of just appearing
    fresh.classList.add('is-in');
    showing = true;
    wait = FADE;
  }

  // The quieter line under the task. hint(null) takes it away.
  function hint(text) {
    if (text) hintEl.textContent = text;
    hintEl.classList.toggle('is-in', !!text);
  }

  // The prompt, and the dot that lights up with it. prompt(null) hides it.
  let prompted = null;
  function prompt(text) {
    if (text === prompted) return;
    prompted = text;
    if (text) doesEl.textContent = text;
    promptEl.classList.toggle('is-in', !!text);
    dotEl.classList.toggle('is-on', !!text);
  }

  // Wipe everything at once: used when the game goes back to the start.
  function clear() {
    queue.length = 0;
    showing = false;
    stage = 'steady';
    wait = 0;
    lineEl.className = 'hud__line';
    lineEl.textContent = '';
    hint(null);
    prompt(null);
  }

  return {
    task,
    hint,
    prompt,
    update,
    clear,
    show: (on) => { root.hidden = !on; },
    // For tests: what the screen says right now.
    says: () => ({
      shown: !root.hidden,
      task: showing ? lineEl.textContent : null,
      ticked: lineEl.classList.contains('is-done'),
      hint: hintEl.classList.contains('is-in') ? hintEl.textContent : null,
      prompt: prompted,
      waiting: queue.length,
      top: taskEl.getBoundingClientRect().top,
    }),
  };
}
