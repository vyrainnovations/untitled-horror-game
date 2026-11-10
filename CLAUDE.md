# Horror game (working title: untitled)

A short first-person lo-fi horror game for the browser. Portfolio piece for Eshan (Vyra Innovations). Target length 10 to 15 minutes. **Deadline: finished and shipped by 16 November 2026.**

## Working with Eshan

- He is the director and playtester; Claude is the builder. He reads HTML, CSS and JS but does not review the code: explain decisions in plain English and verify your own work, because nobody else will check it.
- Straight talk, some humor, no emoji. He dictates, so expect typos.
- Push back when scope grows. Anything added must fit the deadline for one person.
- Keep assets small and do not install heavy tools: disk space is tight.

## The game

Original story, lo-fi PS1/VHS look (low-poly models, small textures, low render resolution, grain). The style comes from the genre; the story, apartment and characters are our own. Do not copy any existing game.

1. **The apartment.** The player is a freelance video editor living alone in a small apartment: bedroom with desk and PC, kitchen corner, bathroom, hallway. One location only.
2. **Chores.** Three short everyday tasks (ideas: take out the trash, make chai, lock the door). They teach the controls and make the place feel safe.
3. **The phone.** An anonymous client messages with an editing job that pays too well, and sends files.
4. **The edit.** The player sits at the PC and scrubs through the footage on a timeline. The footage is liminal (empty corridors, a pool at night) and gets more wrong each time the player scrubs back. Something in it slowly notices it is being watched.
5. **The payoff.** The footage starts to look like the player's own apartment, tying the two halves together.

Out of scope for now: voice acting, multiple endings, a second location, multiplayer.

## Tech

- **Three.js + Vite**, plain JavaScript (no TypeScript, no framework) so Eshan can read it.
- The footage on the in-game PC is rendered in real time by the same engine, so it can change when scrubbed.
- Models are built in Blender (through the Blender connector) and exported as `.glb` into `public/models/`.
- Sound should be synthesized or from properly licensed sources; note the source of every file added.
- Decided against Unreal, Unity and Roblox: slower to build here, bigger downloads, no gain at this art style.

## Layout

- `index.html`, `src/main.js`: entry point (renderer, game loop).
- `src/apartment.js`: the apartment built from boxes in code, its lights, and the list of solid rectangles the player collides with. There is a floor plan at the top of the file.
- `src/player.js`: first-person controls and collisions.
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

Folder set up on 10 November 2026. Same day: a walkable grey-box apartment (bedroom, kitchen, bathroom, hallway with front door) with first-person controls, collisions, dim lighting, fog and the VHS filter. No chores, phone, PC interaction or footage yet.

Things to know:

- The browser panel inside the Claude app cannot capture the mouse, so the game falls back to hold-and-drag to look there. Test mouse look in a normal browser tab.
- In dev mode `window.__game` exposes the player and apartment for tests. `player.update(dt, input)` can be driven by hand to walk a test route.
- Lights cast no shadows, so light leaks through walls. Accepted for now.

**Next step:** Eshan playtests the grey-box and gives his reaction to the mood (not given yet; it is owed as a director's note). Then the three chores.
