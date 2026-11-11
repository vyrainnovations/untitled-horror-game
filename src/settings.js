// The settings the player can change from the menu. They are kept in the
// browser's own storage, so they are still there the next time the game is
// opened on the same computer.
const STORAGE_KEY = 'untitled-horror.settings.v1';

// Each setting: its starting value, and the lowest and highest it may be.
const RULES = {
  sensitivity: { start: 100, min: 30, max: 200 }, // mouse look speed, percent
  invertLook: { start: false }, // push the mouse away to look down
  volume: { start: 80, min: 0, max: 100 }, // percent
  brightness: { start: 100, min: 60, max: 160 }, // percent
  tapeWear: { start: 100, min: 0, max: 150 }, // how damaged the tape looks, percent
  fieldOfView: { start: 64, min: 54, max: 80 }, // degrees, top to bottom
  headBob: { start: true }, // the camera rises and falls as you walk
  pictureLines: { start: 360, options: [240, 360, 480] }, // how many lines tall the picture is
};

function allowed(key, value) {
  const rule = RULES[key];
  if (!rule || typeof value !== typeof rule.start) return false;
  if (rule.options) return rule.options.includes(value);
  if (typeof value === 'number') return Number.isFinite(value) && value >= rule.min && value <= rule.max;
  return true;
}

export function createSettings() {
  const values = {};
  for (const key of Object.keys(RULES)) values[key] = RULES[key].start;

  // Read back what was saved last time. Storage can be switched off or full
  // of nonsense, so anything that does not fit the rules is ignored.
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const key of Object.keys(RULES)) if (allowed(key, saved[key])) values[key] = saved[key];
  } catch {
    // Carry on with the starting values.
  }

  const listeners = [];
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Not being able to save a setting is not worth stopping the game for.
    }
  }

  function set(key, value) {
    if (!allowed(key, value) || values[key] === value) return;
    values[key] = value;
    save();
    for (const listener of listeners) listener(key, value);
  }

  return {
    get: (key) => values[key],
    set,
    rule: (key) => RULES[key],
    keys: () => Object.keys(RULES),
    reset() {
      for (const key of Object.keys(RULES)) set(key, RULES[key].start);
    },
    // Calls listener(key, value) whenever a setting changes.
    onChange(listener) {
      listeners.push(listener);
    },
  };
}
