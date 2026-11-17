// The menu: the title screen, and the pause screen you get by pressing Esc.
// It is a column down the left of the screen. The game keeps showing behind
// it: drifting shots of the flat on the title screen, the frozen picture
// when paused. Every option can be clicked, or chosen with the arrow keys.
//
// The look of it lives in menu.css.

// The game's name. It is also written in index.html, on the loading screen,
// so that it shows before this code has arrived: change both.
export const TITLE = 'Untitled';
// The credits: on the Credits page, and at the very end of the game (src/ending.js).
export const CREDITS = [
  'Directed by Eshan, Vyra Innovations.',
  'Built with Claude, an AI model, in Claude Code.',
  'Every texture is painted by code and every sound is made by code. The game holds no image or sound files.',
];
const USUAL_HINT = 'Click an option, or use the arrow keys and Enter.';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wearName = (v) => (v === 0 ? 'Clean' : v <= 60 ? 'Light' : v <= 110 ? 'Normal' : 'Heavy');

export function createMenu({ settings, audio, onPlay, onTitle }) {
  const root = el('div', 'menu');
  root.hidden = true;
  root.innerHTML = `
    <div class="menu__shade"></div>
    <div class="menu__column">
      <header class="menu__head">
        <h1 class="menu__title"></h1>
      </header>
      <div class="menu__page"><span class="menu__cursor"></span></div>
      <footer class="menu__foot">
        <p class="menu__hint"></p>
        <p class="menu__counter"><span class="menu__clock">00:00:00:00</span><span class="menu__state"></span></p>
      </footer>
    </div>`;
  document.body.appendChild(root);
  const titleEl = root.querySelector('.menu__title');
  const pageEl = root.querySelector('.menu__page');
  const cursorEl = root.querySelector('.menu__cursor');
  const hintEl = root.querySelector('.menu__hint');
  const clockEl = root.querySelector('.menu__clock');
  const stateEl = root.querySelector('.menu__state');
  titleEl.textContent = TITLE;
  titleEl.dataset.text = TITLE;
  hintEl.textContent = USUAL_HINT;

  let kind = 'title'; // which menu this is: 'title' or 'pause'
  let page = 'main'; // which page of it is showing
  let rows = []; // the rows on the page that can be chosen
  let current = 0; // which of them is chosen

  // --- The kinds of row ---------------------------------------------------

  // A row that does something when chosen: Start, Settings, Back.
  function plain(label, run, sound = 'select') {
    const node = el('button', 'row row--plain', label);
    node.type = 'button';
    return {
      node,
      focus: node,
      activate() {
        audio.click(sound);
        run();
      },
    };
  }

  // A row with a slider. show(value) turns the number into what is displayed.
  function slider(label, key, step, show) {
    const rule = settings.rule(key);
    const node = el('div', 'row row--set');
    const name = el('button', 'row__name', label);
    name.type = 'button';
    const input = el('input', 'row__slider');
    input.type = 'range';
    input.min = rule.min;
    input.max = rule.max;
    input.step = step;
    input.tabIndex = -1; // the row's name takes the keyboard, not the slider
    input.setAttribute('aria-label', label);
    const value = el('output', 'row__value');
    node.append(name, input, value);
    const paint = () => {
      const v = settings.get(key);
      input.value = v;
      input.style.setProperty('--fill', `${((v - rule.min) / (rule.max - rule.min)) * 100}%`);
      value.textContent = show(v);
    };
    const change = (v) => {
      if (v === settings.get(key)) return;
      settings.set(key, v);
      audio.click('tick');
    };
    input.addEventListener('input', () => change(Number(input.value)));
    paint();
    return { node, focus: name, paint, adjust: (direction) => change(clamp(settings.get(key) + direction * step, rule.min, rule.max)) };
  }

  // A row that switches between a few named choices: [[value, name], ...].
  // read() says which is set now and write(value) sets it.
  function choice(label, options, read, write) {
    const node = el('div', 'row row--set');
    const name = el('button', 'row__name', label);
    name.type = 'button';
    const pick = el('button', 'row__pick');
    pick.type = 'button';
    pick.tabIndex = -1;
    node.append(name, pick);
    const paint = () => {
      const found = options.find(([value]) => value === read());
      pick.textContent = found ? found[1] : '';
      pick.classList.toggle('is-off', found === options[0] && options.length === 2);
    };
    const adjust = (direction) => {
      const index = options.findIndex(([value]) => value === read());
      const next = options[(index + direction + options.length) % options.length];
      audio.click('tick');
      write(next[0]);
      paint();
    };
    paint();
    return { node, focus: name, paint, adjust, activate: () => adjust(1) };
  }
  const onOff = (label, key) => choice(label, [[false, 'Off'], [true, 'On']], () => settings.get(key), (v) => settings.set(key, v));

  // Words that cannot be chosen: a page heading, a line of credits.
  const words = (className, text) => ({ node: el('p', `row ${className}`, text), fixed: true });
  // A control and what it does.
  function control(keys, does) {
    const node = el('p', 'row row--control');
    node.append(el('span', 'row__keys', keys), el('span', 'row__does', does));
    return { node, fixed: true };
  }

  // --- The pages ----------------------------------------------------------

  const back = () => plain('Back', () => open('main'), 'back');
  const pages = {
    main: () =>
      kind === 'title'
        ? [plain('Start', onPlay), plain('Settings', () => open('settings')), plain('Controls', () => open('controls')), plain('Credits', () => open('credits'))]
        : [plain('Resume', onPlay), plain('Settings', () => open('settings')), plain('Controls', () => open('controls')), plain('Back to title', onTitle, 'back')],
    settings: () => [
      words('row--heading', 'Settings'),
      slider('Mouse sensitivity', 'sensitivity', 5, (v) => `${v}%`),
      onOff('Invert up and down', 'invertLook'),
      slider('Volume', 'volume', 5, (v) => (v === 0 ? 'Off' : String(v))),
      slider('Brightness', 'brightness', 5, (v) => `${v}%`),
      slider('Tape wear', 'tapeWear', 10, wearName),
      slider('Field of view', 'fieldOfView', 1, (v) => `${v}°`),
      onOff('Head bob', 'headBob'),
      choice('Picture detail', [[240, 'Chunky'], [360, 'Normal'], [480, 'Fine']], () => settings.get('pictureLines'), (v) => settings.set('pictureLines', v)),
      choice('Full screen', [[false, 'Off'], [true, 'On']], () => !!document.fullscreenElement, (on) => {
        if (!on) {
          document.exitFullscreen?.();
          return;
        }
        document.documentElement.requestFullscreen?.().catch(() => {});
        // Some browser windows say no, and some never answer. Either way, say so.
        setTimeout(() => {
          if (!document.fullscreenElement) say('The browser would not go full screen.');
        }, 1500);
      }),
      plain('Restore defaults', () => settings.reset(), 'back'),
      back(),
    ],
    controls: () => [
      words('row--heading', 'Controls'),
      control('W A S D', 'Walk'),
      control('Mouse', 'Look around'),
      control('Shift', 'Walk faster'),
      control('E / Click', 'Use what you are looking at'),
      control('Space', 'At the PC: play or pause the clip'),
      control('A / D', 'At the PC: scrub back or forward'),
      control('Q', 'At the PC: stand up'),
      control('Esc', 'Pause, and get your mouse back'),
      back(),
    ],
    credits: () => [
      words('row--heading', 'Credits'),
      ...CREDITS.map((line) => words('row--text', line)),
      back(),
    ],
  };

  // --- Showing a page and moving about on it ---------------------------------

  function open(name) {
    page = name;
    for (const old of pageEl.querySelectorAll('.row')) old.remove();
    const all = pages[name]();
    for (const row of all) pageEl.append(row.node);
    rows = all.filter((row) => !row.fixed);
    rows.forEach((row, index) => {
      // Pressing anywhere on a row (its slider, say) chooses it.
      row.node.addEventListener('pointerdown', () => choose(index, true));
      // A click anywhere on a plain row, or on the name or choice of a setting.
      for (const target of row.node.matches('button') ? [row.node] : row.node.querySelectorAll('button')) {
        target.addEventListener('click', (e) => {
          // Enter and Space also "click" a button. Those are handled with the
          // other keys below, so only real mouse clicks count here.
          if (e.detail === 0) return;
          choose(index, true);
          row.activate?.();
        });
      }
    });
    root.dataset.page = name;
    current = -1;
    choose(0, true);
  }

  // Make one row the chosen one.
  function choose(index, quiet) {
    if (!rows.length) return;
    index = clamp(index, 0, rows.length - 1);
    if (index !== current && !quiet) audio.click('move');
    current = index;
    rows.forEach((row, i) => row.node.classList.toggle('is-current', i === index));
    const node = rows[index].node;
    cursorEl.style.transform = `translateY(${node.offsetTop + node.offsetHeight / 2}px)`;
    rows[index].focus.focus({ preventScroll: true });
  }

  const repaint = () => rows.forEach((row) => row.paint?.());
  settings.onChange(repaint);
  document.addEventListener('fullscreenchange', repaint);
  // The cursor is placed by measuring the page, so measure again when the
  // window changes size.
  window.addEventListener('resize', () => {
    if (!root.hidden) choose(current, true);
  });

  // Pointing at a row chooses it, but only when the mouse really moves. If the
  // menu appears underneath a mouse that is lying still, what is chosen must
  // not change: Esc then Enter should always mean Resume. And not while a
  // button is held: that is somebody dragging a slider past other rows.
  let mouseX = -1;
  let mouseY = -1;
  window.addEventListener('mousemove', (e) => {
    const moved = e.clientX !== mouseX || e.clientY !== mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!moved || root.hidden || e.buttons || !(e.target instanceof Element)) return;
    const node = e.target.closest('.row');
    const index = rows.findIndex((row) => row.node === node);
    if (index >= 0 && index !== current) choose(index);
  });

  // The moment the menu last appeared. The key press that brought the menu up
  // (Esc) happened before that moment, and must not also be read as a key
  // press on the menu.
  let shownAt = 0;

  // The keyboard works as well as the mouse.
  window.addEventListener('keydown', (e) => {
    if (root.hidden || e.timeStamp <= shownAt) return;
    const key = e.code;
    if (key === 'ArrowDown' || key === 'KeyS') choose((current + 1) % rows.length);
    else if (key === 'ArrowUp' || key === 'KeyW') choose((current - 1 + rows.length) % rows.length);
    else if (key === 'ArrowLeft' || key === 'KeyA') rows[current].adjust?.(-1);
    else if (key === 'ArrowRight' || key === 'KeyD') rows[current].adjust?.(1);
    else if (key === 'Enter' || key === 'Space') rows[current].activate?.();
    else if (key === 'Escape') {
      if (page !== 'main') {
        audio.click('back');
        open('main');
      } else if (kind === 'pause') {
        // Esc cannot resume the game: browsers do not let the Esc key hand
        // the mouse back to a page. So point at what does work.
        say('Press Enter or click Resume to carry on.');
      }
    } else return;
    e.preventDefault();
  });

  // --- What the rest of the game can ask of the menu -----------------------------

  let sayTimer = 0;
  // Put a message where the hint is, for a few seconds.
  function say(text) {
    hintEl.textContent = text;
    hintEl.classList.add('is-urgent');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => {
      hintEl.textContent = USUAL_HINT;
      hintEl.classList.remove('is-urgent');
    }, 4500);
  }

  function show(which) {
    kind = which;
    stateEl.textContent = which === 'pause' ? 'Paused' : 'Stopped';
    root.hidden = false;
    root.classList.remove('is-opening');
    void root.offsetWidth; // makes the opening animation play again
    root.classList.add('is-opening');
    open('main');
    shownAt = performance.now();
  }

  function hide() {
    root.hidden = true;
  }

  // The tape counter in the corner: how long has been played, as
  // hours:minutes:seconds:frames, the way an editor counts it.
  let shown = '';
  function setClock(seconds) {
    const frames = Math.floor(seconds * 25);
    const two = (n) => String(n).padStart(2, '0');
    const text = `${two(Math.floor(frames / 90000))}:${two(Math.floor(frames / 1500) % 60)}:${two(Math.floor(frames / 25) % 60)}:${two(frames % 25)}`;
    if (text === shown) return;
    shown = text;
    clockEl.textContent = text;
  }

  return { show, hide, say, setClock, isOpen: () => !root.hidden, page: () => page };
}
