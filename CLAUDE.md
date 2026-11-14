# Horror game (working title: untitled)

A short first-person lo-fi horror game for the browser. Portfolio piece for Eshan (Vyra Innovations). Target length 10 to 15 minutes. **Deadline: finished and shipped by 16 November 2026.**

## Working with Eshan

- He is the director and playtester; Claude is the builder. He reads HTML, CSS and JS but does not review the code: explain decisions in plain English and verify your own work, because nobody else will check it.
- Straight talk, some humor, no emoji. He dictates, so expect typos.
- Push back when scope grows. Anything added must fit the deadline for one person.
- Keep assets small and do not install heavy tools: disk space is tight.

## The game

Original story, lo-fi PS1/VHS look (low-poly models, small textures, low render resolution, grain). The style comes from the genre; the story, apartment and characters are our own. Do not copy any existing game.

**The full story is in `STORY.md`. Read it before building anything.** Eshan's rule, 12 November: "We need everything to happen for a meaning ... reason behind every action we make the player do ... and the sudden feeling of everything clicking at the very end of the game. Build everything around it. I want you to first decide the full story before making the game." He also said the storyline must be kept intact: do not change it, or add anything it does not need, without him saying so.

`STORY.md` was written by Claude on 12 November and **approved by Eshan on 13 November** ("Yes, build it"). It is fixed. Still his to decide, and listed at the bottom of that file: the two names, the title, how the characters text, and the setting. The working versions stand until he does.

The five lines below are his first outline. The story keeps all five in this order. Where the two differ (the order of the chores, the pool), `STORY.md` is the newer one and wins.

1. **The apartment.** The player is a freelance video editor living alone in a flat that is too big for one person: a study with the PC, his bedroom, a spare bedroom, a kitchen with the dining table in it, a bathroom, a store room, and a 12 m corridor joining them. One location only. (Eshan enlarged it on 10 November from the original four small rooms.) The spare bedroom was Hamza's, the friend who moved out (`STORY.md`, which Eshan approved).
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
- Sound should be synthesized or from properly licensed sources; note the source of every file added. So far every sound is synthesized while the game runs (`src/audio.js`) and there are no sound files. Claude cannot hear: levels are measured with `__game.audio.level()`, and Eshan judges by ear.
- Decided against Unreal, Unity and Roblox: slower to build here, bigger downloads, no gain at this art style.

## Layout

- `STORY.md`: the whole story, the rules it sets, every beat of the game, the message script, and the build order to the deadline. Spoilers.
- `index.html`, `src/main.js`: entry point (renderer, the three states `title` / `playing` / `paused`, game loop, dev-only test hooks).
- `src/menu.js`, `src/menu.css`: the title screen and the pause screen (one menu, a column on the left over the game). The game's name is `TITLE` at the top of `menu.js`.
- `src/settings.js`: the settings and their limits, saved in the browser. `src/main.js` says what each one does (`apply`).
- `src/audio.js`: every sound, made by code.
- `src/attract.js`: the camera shots behind the title screen.
- `src/hud.js`, `src/hud.css`: the words on the screen while playing (task line, hint, prompt, keys row, message banner). Nothing in it knows the story.
- `src/interact.js`: looking at something within reach and using it (E or click).
- `src/chores.js`: Part 1, the three chores. Wording, order and timings at the top.
- `src/job.js`: Part 2 in order (phone, sitting down, the clips). The place where clip 2 will start is marked THE NEXT PART OF THE GAME STARTS HERE.
- `src/phone.js`: the phone in the hand; the messages are in `TONIGHT` at the top.
- `src/seat.js`: sitting at the desk, and the view settling on the monitor.
- `src/editor.js`: the editing program on the monitor: play, scrub, mark.
- `src/footage.js`: how a tape is drawn: the flat from the tape camera, as it was on the date in the corner.
- `src/clips.js`: what is on each tape: camera, dates, the moment, what moves, what follows the mark. Clips 1 and 2 so far. All the tapes must agree about the flat on each date (the list at the top).
- `src/door.js`: the front door hammered on for real after clip 2, and the peephole.
- `tools/walk-test.js`: the walking test (see Things to know).
- `tools/play-test.js`: the play test (see Things to know).
- `src/plan.js`: the floor plan (drawn in text at the top) and shared measurements.
- `src/apartment.js`: floors, walls, doors, windows and all the lights. Calls the room files.
- `src/rooms/`: furniture and clutter, one file per room (`study`, `bedrooms`, `kitchen`, `bathroom`, `store`, `corridor`). Each file also places the invisible barriers for its furniture.
- `src/build.js`: the building blocks (box, cylinder, rod, ball, panel, cloth, group) and the collision barriers.
- `src/fittings.js`: walls with openings, door frames, doors, windows, curtains, things hung on walls, fans, bulbs.
- `src/furniture.js`: pieces used in more than one room (bed, chairs, boxes, bottles, cups, plants).
- `src/textures.js`, `src/materials.js`: every texture painted in code, and the materials made from them.
- `src/outside.js`: the view out of the west windows.
- `src/player.js`: first-person controls and collisions (rectangles, and angled lines for open doors). It does not decide when the game has the mouse: the menu calls `capture()`, and letting go of the mouse (Esc) is what pauses.
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

As of 14 November 2026: the flat, the menu, the settings and the sound are done, and the game plays from the title to the end of beat 10. Part 1 (the three chores) is complete. Part 2 has the phone conversation, sitting at the PC, the editing program, clip 1 (the corridor), clip 2 (the front door, then the tape jumps to 3:07 and its door is hammered on), and the real front door hammered on, with the peephole. Still to build: clip 3 (the kitchen) and the hiss, clip 4 (the study) and the figure, and all of Part 3 (the thread, the gas, the door, the last shot). Three days remain, counting the 16th. Eshan has not said how any of the gameplay plays yet. The game has no name: the menu says "Untitled", with "working title" under it. `STORY.md` offers three.

Look decisions Eshan has made (do not undo without asking):

- The mood of the first grey-box "feels good". Keep it dark.
- Big blocky pixels and heavy grain look rushed to him. The picture is 360 lines by default (`pictureLines` in `src/settings.js`; the player can pick 240 or 480 under Picture detail), the VHS filter runs at screen resolution, and grain is light.
- Eye level is 1.5 m and ceilings are 2.8 m. At 1.6 m under 2.5 m he felt too tall.
- He wants surfaces textured and rooms full of small real-life detail. His verdict on the furnished flat: "Now this looks pretty good."
- Turning left and right was "a little faster and difficult to use". It is 0.0018 radians per pixel now, down from 0.0022 (`LOOK_SIDEWAYS` in `src/player.js`). He did not mention up and down, so that is unchanged.
- The menu is a column on the left with the game showing behind it and every option clickable, "not a sloppy box in the middle". He asked for it to look "similar to the fears to fathom": keep it in that family (a plain list over the live game, VHS all over), but never copy that game's menu.

Things to know:

- The browser panel inside the Claude app cannot capture the mouse, so the game falls back to hold-and-drag to look there. It also renders on the weak built-in graphics chip and slows right down when hidden, so do not trust frame rates measured in it.
- Browsers have rules about the mouse that the menu works around. A page can only take the mouse straight after a click or a key press. The Esc key never counts, so Esc cannot resume the game (the pause screen says to press Enter or click Resume). And for about a second after Esc the browser refuses outright, so `play()` in `src/main.js` waits and asks once more.
- Real mouse capture and full screen cannot be tested in the Claude app's browser panel. Eshan has to confirm those in Chrome.
- Dev-only test hooks on `window.__game`: `mode()` says which state the game is in, `play()`, `pause()` and `toTitle()` change it, `testMode()` skips the menu and silences the feet so the player can be walked by hand with `player.update(dt, input)`, `bright(true)` floods the flat with light, `view(x, y, z, yaw, pitch)` looks from anywhere (from above it hides the ceiling), `frame(ms)` draws one frame for timing, `settings.set(name, value)` changes a setting, `audio.level()` measures how loud the output is. For the gameplay: `hold(true)` stops the game's own clock, `tick(seconds)` moves it on by hand and `draw()` draws without moving it on; `hud.says()` is what the screen says; `chores.state()` and `job.state()` say where the story has got to, and `job.parts` reaches the phone, the seat, the editor and the footage.
- The play test is `tools/play-test.js`: `(await import('/tools/play-test.js')).run()`. It plays the game so far by the hooks and checks every step (93 checks as of 14 November). Run it after changing anything in the gameplay, and add the new beat to it. Its helpers (`toEditor()`, `doClip(i)`, `stand()`, `key()`, `tick()`) are handy for getting to one moment and looking at it. When the panel will not take pictures at all, a tape can still be checked from its pixels: `renderer.readRenderTargetPixels(job.parts.footage.target, ...)` reads it back (half floats).
- Things the game moves are named with `b.tag(name, object)` and found in `apartment.things`. Each room's furniture is one group in `apartment.rooms`, so a tape can hide it; the corridor's things are in two sets (`hallByDoor`, `hallWalls`). `apartment.walls` is every wall as a box, for telling whether a wall is in the way.
- A tape is drawn by changing the flat (hiding furniture, turning lights down) for one picture and putting it all back at once (`film()` in `src/footage.js`). It never lets that picture redraw the shadows. Things that move on a tape are copies that only the tape sees, so the real ones stay where the player left them.
- Pictures of the browser panel lie while it is hidden: they can show only the top-left two thirds of the page, or a stale frame, and the static from a cut only fades as frames are drawn in real time. Before a picture: scale the page by `1 / devicePixelRatio`, draw a few frames a tenth of a second apart, and switch off the HUD's fades. To see a tape full size, `view(2.5, 1.078, 0.6, 0, 0)` puts the eye in front of the monitor.
- Collision rule used so far: never leave a gap between two solid things that is narrower than the player (0.5 m). Close it with `b.block(...)`.
- The walking test is `tools/walk-test.js`. With the game running in dev, type `(await import('/tools/walk-test.js')).run()` in the browser's console. It walks to every room, lets random walkers loose and checks the footstep floors. Run it after anything that moves a wall, a door or a piece of furniture, and reload the page afterwards.
- Screenshots of the browser panel are often one frame stale. Draw a frame by hand (`__game.frame(performance.now())`), wait a second, then look, and trust what the page reports over what the picture shows.
- The engine does not bounce light. The bedroom has one soft light standing in for lamplight bouncing off the wall.
- The mirrors are fakes (dark glossy panels).
- The game is played in Chrome in a big window (roughly 2400 x 1300). Check the look at that size.

**Next step:** clip 3, the kitchen (`STORY.md`, beat 11: the ring that lights by itself, the chai boiling over, the flame dying at 01:10; marked, the real ring goes out and the kitchen hisses), then clip 4, the study (live, the figure nearer at every scrub back, then Saad asleep at the desk), then Part 3. Adding a clip to `src/clips.js` is enough for `src/job.js` to load it after the one before. Eshan should play what exists in Chrome as soon as he can; his words go in the next commit. Still owed by Eshan: the two names, the title, how the two of them text, and the setting. And one slip in `STORY.md` for him: it says the bolt went on both at 00:40 and at 00:52 (the tape uses 00:41).

Things the rest of the story needs that are not there yet, so nobody is surprised: the kitchen's things split into what was built in (the hob, the counters) and what he owned, as the corridor's are, so clip 3 can show an emptied kitchen with its hob; a figure (Hamza) that can sit and stand in a few places, and Saad asleep at the desk. Clip 4 films the study, which has the monitor in it: hide the tape's own picture on the monitor while filming it. All of these appear or move, so all of them touch the rule about shadows being drawn once.
