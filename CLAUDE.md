# Horror game (working title: untitled)

A short first-person lo-fi horror game for the browser. Portfolio piece for Eshan (Vyra Innovations). Target length 10 to 15 minutes. **Deadline: finished and shipped by 16 November 2026.**

## Working with Eshan

- He is the director and playtester; Claude is the builder. He reads HTML, CSS and JS but does not review the code: explain decisions in plain English and verify your own work, because nobody else will check it.
- Straight talk, some humor, no emoji. He dictates, so expect typos.
- Push back when scope grows. Anything added must fit the deadline for one person.
- Keep assets small and do not install heavy tools: disk space is tight.

## The game

Original story, lo-fi PS1/VHS look (low-poly models, small textures, low render resolution, grain). The style comes from the genre; the story, apartment and characters are our own. Do not copy any existing game.

1. **The apartment.** The player is a freelance video editor living alone in a flat that is too big for one person: a study with the PC, his bedroom, a spare bedroom, a kitchen with the dining table in it, a bathroom, a store room, and a 12 m corridor joining them. One location only. (Eshan enlarged it on 10 November from the original four small rooms.) The spare bedroom is the room of a flatmate who moved out: this is Claude's suggestion and Eshan has not confirmed it yet.
2. **Chores.** Three short everyday tasks (ideas: take out the trash, make chai, lock the door). They teach the controls and make the place feel safe.
3. **The phone.** An anonymous client messages with an editing job that pays too well, and sends files.
4. **The edit.** The player sits at the PC and scrubs through the footage on a timeline. The footage is liminal (empty corridors, a pool at night) and gets more wrong each time the player scrubs back. Something in it slowly notices it is being watched.
5. **The payoff.** The footage starts to look like the player's own apartment, tying the two halves together.

Out of scope for now: voice acting, multiple endings, a second location, multiplayer.

## Tech

- **Three.js + Vite**, plain JavaScript (no TypeScript, no framework) so Eshan can read it.
- The footage on the in-game PC is rendered in real time by the same engine, so it can change when scrubbed.
- Everything in the flat is currently built in code from simple shapes (`src/build.js`), and every texture is painted by code at start-up (`src/textures.js`). There are no model or image files yet.
- Blender (through the Blender connector) is for the things simple shapes cannot fake, exported as `.glb` into `public/models/`. Eshan has said Claude may use Blender on his PC.
- Nothing in the flat moves, so shadows are drawn once at start-up (`renderer.shadowMap.autoUpdate = false`). Anything that starts to move later (a door, a figure) must ask for a shadow update or opt out of shadows.
- Sound should be synthesized or from properly licensed sources; note the source of every file added.
- Decided against Unreal, Unity and Roblox: slower to build here, bigger downloads, no gain at this art style.

## Layout

- `index.html`, `src/main.js`: entry point (renderer, game loop, dev-only test hooks).
- `src/plan.js`: the floor plan (drawn in text at the top) and shared measurements.
- `src/apartment.js`: floors, walls, doors, windows and all the lights. Calls the room files.
- `src/rooms/`: furniture and clutter, one file per room (`study`, `bedrooms`, `kitchen`, `bathroom`, `store`, `corridor`). Each file also places the invisible barriers for its furniture.
- `src/build.js`: the building blocks (box, cylinder, rod, ball, panel, cloth, group) and the collision barriers.
- `src/fittings.js`: walls with openings, door frames, doors, windows, curtains, things hung on walls, fans, bulbs.
- `src/furniture.js`: pieces used in more than one room (bed, chairs, boxes, bottles, cups, plants).
- `src/textures.js`, `src/materials.js`: every texture painted in code, and the materials made from them.
- `src/outside.js`: the view out of the west windows.
- `src/player.js`: first-person controls and collisions (rectangles, and angled lines for open doors).
- `src/vhs.js`: the VHS screen filter.
- `src/`: game code.
- `public/models/`, `public/textures/`, `public/audio/`: assets served as-is.
- `blender/`: source `.blend` files.

## Commands

- `npm run dev`: start the game locally (http://localhost:5173).
- `npm run build`: make the shippable version in `dist/`.

## Documenting the build

The repo is a showcase of a game made with AI, told as a story with the mistakes left in. Keep it that way:

- **Commit often, in small steps**, each one a working state where possible. Never squash, amend or rewrite history to hide a mistake; fix it in a new commit and say what went wrong.
- **Commit message format:** a short plain-English title, a few lines on what changed and why, then a `Director's note:` line with Eshan's own words about that step (quote him, do not invent his voice; ask if he has not said anything).
- **`DEVLOG.md`:** add to the current day's entry as work happens (what happened, what went wrong or got dropped, Eshan's note, next). New day, new entry, newest at the bottom. Never edit old entries to look better.
- Keep `README.md` status and this file's Status section current.
- Push to GitHub (`origin`, branch `main`) after committing. The repo is private until Eshan decides to make it public.

## Status

As of 11 November 2026: the whole flat is built, furnished, textured, lit and shadowed, and can be walked end to end. No chores, phone, PC interaction or footage yet. Five days remain and no gameplay exists: that is the risk.

Look decisions Eshan has made (do not undo without asking):

- The mood of the first grey-box "feels good". Keep it dark.
- Big blocky pixels and heavy grain look rushed to him. The picture is 360 lines (`RENDER_HEIGHT` in `src/main.js`), the VHS filter runs at screen resolution, and grain is light.
- Eye level is 1.5 m and ceilings are 2.8 m. At 1.6 m under 2.5 m he felt too tall.
- He wants surfaces textured and rooms full of small real-life detail.

Things to know:

- The browser panel inside the Claude app cannot capture the mouse, so the game falls back to hold-and-drag to look there. It also renders on the weak built-in graphics chip and slows right down when hidden, so do not trust frame rates measured in it.
- Dev-only test hooks on `window.__game`: `player.update(dt, input)` walks the player by hand, `bright(true)` floods the flat with light, `view(x, y, z, yaw, pitch)` looks from anywhere (from above it hides the ceiling), `frame(ms)` draws one frame for timing.
- Collision rule used so far: never leave a gap between two solid things that is narrower than the player (0.5 m). Close it with `b.block(...)`. The walking test (a route through every room, then random walkers) lives in the devlog description, not in a file yet.
- The engine does not bounce light. The bedroom has one soft light standing in for lamplight bouncing off the wall.
- The mirrors are fakes (dark glossy panels).
- The game is played in Chrome in a big window (roughly 2400 x 1300). Check the look at that size.

**Next step:** Eshan walks the furnished flat and reacts (his director's note for the furnishing is owed). Then gameplay must start: the three chores and the phone.
