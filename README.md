# Untitled horror game

A short first-person lo-fi horror game that runs in the browser. You play a freelance video editor who takes a job from an anonymous client, and the footage is not what it seems.

**Status:** in development. The game opens on a title screen, in a flat of seven furnished rooms and a long corridor, textured, lit and shadowed, with the VHS look on, a pause menu, settings that are remembered, and sound. The first two parts of the story play from start to finish: three chores, the phone, sitting down at the PC, four tapes scrubbed back, what the second one sets off at the front door, what the third leaves in the kitchen, and what the fourth shows. The ending is next. No name yet. Target: shipped by 16 November 2026.

Every texture is painted by code and every sound is made by code. The game holds no image or sound files.

## How this is being made

This game is directed by Eshan (Vyra Innovations) and built with Claude, an AI model, inside Claude Code. Eshan sets the story, the mood and the pacing, and playtests everything. Claude writes the code and builds the models.

The whole process is kept in the open, wrong turns included:

- **[DEVLOG.md](DEVLOG.md)** is the story of the build, day by day, with the ideas that were dropped and the mistakes that were made.
- **The commit history** is the same story in small steps. Every commit says what changed and carries a director's note in Eshan's own words.
- **[CLAUDE.md](CLAUDE.md)** is the brief the AI reads at the start of every session.
- **[STORY.md](STORY.md)** is the whole story, written before any gameplay was built. It gives away the ending: play the game first.

## Run it

You need [Node.js](https://nodejs.org).

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and choose Start. Mouse to look, WASD to walk, Shift to walk faster, E or a click to use what you are looking at, Esc to pause. At the PC: Space plays and pauses a clip, A and D scrub back and forward, E marks a frame, Q stands up. Mouse speed, volume, brightness and the rest are under Settings.

Two tests run in the browser's console while the game is running. The first checks that nothing can be walked through or got stuck in; the second plays the game so far, step by step, and checks each step:

```js
(await import('/tools/walk-test.js')).run()
```

```js
(await import('/tools/play-test.js')).run()
```

## Layout

| Path | What is in it |
|---|---|
| `src/` | Game code (Three.js, plain JavaScript) |
| `src/plan.js` | The floor plan and the main measurements |
| `src/apartment.js` | Walls, floors, doors, windows and lights |
| `src/rooms/` | The furniture and clutter, one file per room |
| `src/textures.js` | Every texture, painted by code when the game starts |
| `src/vhs.js` | The VHS screen filter |
| `src/menu.js`, `src/menu.css` | The title screen and the pause screen |
| `src/settings.js` | The settings, and remembering them |
| `src/audio.js` | Every sound, made by code |
| `src/hud.js`, `src/hud.css`, `src/interact.js` | The words on the screen while playing, and using things |
| `src/chores.js` | Part 1: the three chores |
| `src/job.js` | Part 2, in order: the phone, the PC, the tapes |
| `src/phone.js` | The phone and the messages on it |
| `src/seat.js` | Sitting at the desk |
| `src/editor.js`, `src/footage.js`, `src/clips.js` | The editing program, how the tapes are drawn, and what is on each tape |
| `src/door.js` | The front door, hammered on |
| `src/figures.js` | The two people, seen only on the tapes |
| `tools/walk-test.js` | The test that walks every room and tries to get stuck |
| `tools/play-test.js` | The test that plays the game so far |
| `public/models/`, `public/textures/`, `public/audio/` | Game assets |
| `blender/` | Source Blender files for the models |
| `DEVLOG.md` | The build diary |
| `STORY.md` | The whole story, and what has to be built for it. Spoilers |
| `CLAUDE.md` | The brief for the AI |
