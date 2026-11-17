# Untitled

**[Play it in your browser](https://untitled-horror-game.vercel.app)** · about 18 minutes · keyboard and mouse · best with headphones, in the dark

A short first-person horror game. You are a freelance video editor, alone in a flat at night. An unknown number offers too much money for a small job: three video files, and in each one something goes wrong.

Directed by Eshan (Vyra Innovations). Built by Claude, an AI model, in Claude Code. Eshan set the story, the mood and the pacing, and played every version. Claude wrote the code. Nobody drew or recorded anything: every texture is painted by code and every sound, the music included, is made by code while the game runs.

## By the numbers

| | |
|---|---|
| Made in | 7 days, 10 to 17 November 2026 |
| Commits | 50 and counting, each with a note from the director |
| Game code | about 10,800 lines of plain JavaScript in 40 files, on Three.js |
| Image, sound and model files | none |
| Download | about 210 KB |
| Tests | three: one walks every room and tries to get stuck (400,000 random steps), one plays the whole game (240 checks), one checks nothing is left to load mid-game |
| AI models | Claude Fable 5.2 and Claude Opus 5.5 |
| Tokens | about 1.9 million written by the AI, and about 300 million read back, nearly all of it the AI re-reading its own conversation |

## How it was made, in the open

The whole process is here, wrong turns included:

- **[DEVLOG.md](DEVLOG.md)** is the build diary, day by day: what was built, what went wrong, what was dropped, and what the director said about it.
- **The commit history** is the same story in small steps. Every commit says what changed and carries a director's note in Eshan's own words.
- **[STORY.md](STORY.md)** is the whole story, written before any gameplay was built. It gives away the ending: play the game first.
- **[CLAUDE.md](CLAUDE.md)** is the brief the AI reads at the start of every session.

## Run it yourself

You need [Node.js](https://nodejs.org).

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and choose Start. Mouse to look, WASD to walk, Shift to walk faster, E or a click to use what you are looking at, Esc to pause. At the PC: Space plays and pauses a clip, A and D scrub back and forward, E marks a frame, Q stands up. Mouse speed, volume, brightness and the rest are under Settings.

The three tests run in the browser's console while the game is running. Reload the page after each:

```js
(await import('/tools/walk-test.js')).run()
```

```js
(await import('/tools/play-test.js')).run()
```

```js
(await import('/tools/warm-test.js')).run()
```

## Layout

| Path | What is in it |
|---|---|
| `index.html` | The page, and the loading screen |
| `src/` | Game code (Three.js, plain JavaScript) |
| `src/main.js` | Where it all starts: the three states (title, playing, paused) and the game loop |
| `src/loading.js`, `src/loading.css` | What the game prepares behind the loading screen |
| `src/plan.js` | The floor plan and the main measurements |
| `src/apartment.js` | Walls, floors, doors, windows and lights |
| `src/rooms/` | The furniture and clutter, one file per room |
| `src/textures.js` | Every texture, painted by code when the game starts |
| `src/vhs.js` | The VHS screen filter |
| `src/menu.js`, `src/menu.css` | The title screen and the pause screen |
| `src/settings.js` | The settings, and remembering them |
| `src/audio.js` | Every sound, made by code, and the music |
| `src/hud.js`, `src/hud.css`, `src/interact.js` | The words on the screen while playing, and using things |
| `src/chores.js` | Part 1: the three chores |
| `src/job.js` | Parts 2 and 3, in order: the phone, the PC, the tapes, and what follows |
| `src/phone.js` | The phone and the messages on it |
| `src/seat.js` | Sitting at the desk |
| `src/editor.js`, `src/footage.js`, `src/clips.js` | The editing program, how the tapes are drawn, and what is on each tape |
| `src/door.js` | The front door, hammered on, and the peephole |
| `src/figures.js` | The two people in the game, built from boxes |
| `src/hunt.js` | Part 3: the lights go out |
| `src/cutscene.js` | The cutscene near the end |
| `src/ending.js` | The end of the game |
| `tools/` | The three tests |
| `DEVLOG.md` | The build diary |
| `STORY.md` | The whole story, and what had to be built for it. Spoilers |
| `CLAUDE.md` | The brief for the AI |
