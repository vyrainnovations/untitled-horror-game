# Untitled (a short horror game)

A short first-person lo-fi horror game for the browser, about 18 minutes long. Portfolio piece for Eshan (Vyra Innovations). **Finished on the deadline, 16 November 2026, and online since 17 November: https://untitled-horror-game.vercel.app**

## Working with Eshan

- He is the director and playtester; Claude is the builder. He reads HTML, CSS and JS but does not review the code: explain decisions in plain English and verify your own work, because nobody else will check it.
- Straight talk, some humor, no emoji. He dictates, so expect typos.
- Push back when scope grows. Anything added must fit the deadline for one person.
- Keep assets small and do not install heavy tools: disk space is tight.

## The game

Original story, lo-fi PS1/VHS look (low-poly models, small textures, low render resolution, grain). The style comes from the genre; the story, apartment and characters are our own. Do not copy any existing game.

**The full story is in `STORY.md`. Read it before building anything.** Eshan's rule, 12 November: "We need everything to happen for a meaning ... reason behind every action we make the player do ... and the sudden feeling of everything clicking at the very end of the game. Build everything around it. I want you to first decide the full story before making the game." He also said the storyline must be kept intact: do not change it, or add anything it does not need, without him saying so.

`STORY.md` was written by Claude on 12 November and **approved by Eshan on 13 November** ("Yes, build it"). **It was revised on 14 November, at his word**, after he played the first complete game and said: "It was good ngl but the thing is it wasn't horror at all ... WE NEED IT TO BE SCARIER!" The revision keeps what happened and how it ends, and makes the middle frightening: a figure on the tapes, a thing with a light that hunts the player, a cutscene in place of the old messages. It is fixed again. Still his to decide, and listed at the bottom of that file: whether the thing with the light may turn out to be Hamza (he asked for "an anomaly pretending to be Saad"; the story gives the player one and then takes it away), the two names, how the characters text, and the setting. The working versions stand until he does: he played the finished game on 16 November with all of them in it and called it "perfect". The title is decided: the game is called Untitled.

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
- `index.html`, `src/main.js`: entry point (renderer, the three states `title` / `playing` / `paused`, game loop, dev-only test hooks). `index.html` also holds the loading screen, so that it shows before any code has arrived.
- `src/loading.js`, `src/loading.css`: the loading screen's bar and words, and everything the game prepares behind it before the title screen comes up (see Things to know).
- `src/menu.js`, `src/menu.css`: the title screen and the pause screen (one menu, a column on the left over the game). The game's name is `TITLE` at the top of `menu.js`, and the credits are `CREDITS` just under it; the end of the game uses both.
- `src/settings.js`: the settings and their limits, saved in the browser. `src/main.js` says what each one does (`apply`).
- `src/audio.js`: every sound, made by code, and the score: a drone that rises (`setTension`), risers, hits (`sting`), a heartbeat, and two pieces of music played by a small sequencer (`music('theme')`, `music('finale')`).
- `src/attract.js`: the camera shots behind the title screen.
- `src/hud.js`, `src/hud.css`: the words on the screen while playing (task line, hint, prompt, keys row, message banner). Nothing in it knows the story.
- `src/interact.js`: looking at something within reach and using it (E or click).
- `src/chores.js`: Part 1, the three chores. Wording, order and timings at the top.
- `src/job.js`: Part 2 in order (phone, sitting down, the clips, the door, the small frights on the way, the drone), and it starts Part 3.
- `src/phone.js`: the phone in the hand, for the one conversation with the client; the messages are in `TONIGHT` at the top.
- `src/seat.js`: sitting at the desk, and the view settling on the monitor.
- `src/editor.js`: the editing program on the monitor: play, scrub, mark.
- `src/footage.js`: how a tape is drawn: the flat from the tape camera, as it was on the date in the corner.
- `src/clips.js`: what is on each tape: camera, dates, the moment, what moves, what follows the mark. All four clips. What of his is in the flat on each date is one table, `FLAT`, that every tape reads.
- `src/figures.js`: Hamza and Saad, built from boxes, with their poses and a walk. Saad is only ever seen on a tape; Hamza also at the peephole and, in the dark, in the flat.
- `src/door.js`: the front door hammered on for real after clip 2, the peephole, and the eye that comes to it.
- `src/hunt.js`: Part 3, "The light": the lights go out, the figure with the head torch searches the flat, the wardrobes, being found and the rewind. Its route, speeds and what it can see are at the top.
- `src/cutscene.js`: the cutscene (Part 4, beat 20): twenty shots and their subtitles, in `SHOTS` at the top.
- `src/ending.js`: Part 4: the cutscene, then the gas, the door, the last shot, the title and the credits.
- `tools/walk-test.js`: the walking test (see Things to know).
- `tools/play-test.js`: the play test (see Things to know).
- `tools/warm-test.js`: the warm-up test (see Things to know).
- `src/plan.js`: the floor plan (drawn in text at the top) and shared measurements.
- `src/apartment.js`: floors, walls, doors, windows and all the lights. Calls the room files.
- `src/rooms/`: furniture and clutter, one file per room (`study`, `bedrooms`, `kitchen`, `bathroom`, `store`, `corridor`), and `landing`, the stairwell outside the front door. Each file also places the invisible barriers for its furniture.
- `src/build.js`: the building blocks (box, cylinder, rod, ball, panel, cloth, group) and the collision barriers.
- `src/fittings.js`: walls with openings, door frames, doors, windows, curtains, things hung on walls, fans, bulbs.
- `src/furniture.js`: pieces used in more than one room (bed, chairs, boxes, bottles, cups, plants).
- `src/textures.js`, `src/materials.js`: every texture painted in code, and the materials made from them.
- `src/outside.js`: the view out of the west windows, which fades into haze (`HAZE` in `src/materials.js`).
- `src/player.js`: first-person controls and collisions (rectangles, and angled lines for open doors). It does not decide when the game has the mouse: the menu calls `capture()`, and letting go of the mouse (Esc) is what pauses.
- `src/vhs.js`: the VHS screen filter.
- `src/`: game code.
- `public/models/`, `public/textures/`, `public/audio/`: assets served as-is.
- `blender/`: source `.blend` files.

## Commands

- `npm run dev`: start the game locally (http://localhost:5173).
- `npm run build`: make the shippable version in `dist/`.
- `npm run preview`: serve `dist/` on this computer, to try the shippable version (the `built` entry in `.claude/launch.json` does it on port 4173).

## Documenting the build

The repo is a showcase of a game made with AI, told as a story with the mistakes left in. Keep it that way:

- **Commit often, in small steps**, each one a working state where possible. Never squash, amend or rewrite history to hide a mistake; fix it in a new commit and say what went wrong. (The history was rewritten once, on 17 November, at Eshan's word, for privacy only: see the devlog. Commits use GitHub's private address for him; keep `user.email` that way.)
- **Commit message format:** a short plain-English title, a few lines on what changed and why, then a `Director's note:` line with Eshan's own words about that step (quote him, do not invent his voice; ask if he has not said anything).
- **`DEVLOG.md`:** add to the current day's entry as work happens (what happened, what went wrong or got dropped, Eshan's note, next). New day, new entry, newest at the bottom. Never edit old entries to look better.
- Keep `README.md` status and this file's Status section current.
- Push to GitHub (`origin`, branch `main`) after committing. **Every push to `main` goes live:** Vercel (the project `untitled-horror-game`) rebuilds the game and publishes it at the play link within about a minute. So run the tests before pushing, not after.
- The repo is private until Eshan says to make it public. He has asked for that, once the documents are cleaned (done, 17 November) and his own notes are in the README. The old commits are already scrubbed.

## Status

As of 17 November 2026: the game is finished and online. The whole revised story is built, and the game plays from the title screen to the credits in about 18 minutes. Part 1 (the three chores), Part 2 (the phone, the PC, four tapes with a figure on them, the landline, the door hammered on and an eye at the peephole, the chai boiling over, the live tape burning out), Part 3 (lights out: the thing with the light, the hiding, being found) and Part 4 (the cutscene, the gas, the door, the last shot, the title and the credits). Eshan played the first complete version on 14 November and the revised one on 16 November. His verdict on the second: "Hey the game is made I played it. It is perfect." On 17 November it got its loading screen, lost the words "working title" from the menu, and went online on Vercel.

Two things on the loading screen are Claude's and he has not seen them, so they are his to throw out: the line "Best with headphones, in the dark.", and, on a phone, a note that the game needs a keyboard and a mouse (with a tap to go on anyway).

Look decisions Eshan has made (do not undo without asking):

- The mood of the first grey-box "feels good". Keep it dark.
- Big blocky pixels and heavy grain look rushed to him. The picture is 360 lines by default (`pictureLines` in `src/settings.js`; the player can pick 240 or 480 under Picture detail), the VHS filter runs at screen resolution, and grain is light.
- Eye level is 1.5 m and ceilings are 2.8 m. At 1.6 m under 2.5 m he felt too tall.
- He wants surfaces textured and rooms full of small real-life detail. His verdict on the furnished flat: "Now this looks pretty good."
- Turning left and right was "a little faster and difficult to use". It is 0.0018 radians per pixel now, down from 0.0022 (`LOOK_SIDEWAYS` in `src/player.js`). He did not mention up and down, so that is unchanged.
- The menu is a column on the left with the game showing behind it and every option clickable, "not a sloppy box in the middle". He asked for it to look "similar to the fears to fathom": keep it in that family (a plain list over the live game, VHS all over), but never copy that game's menu.

- The game is called Untitled (his decision, 16 November), with nothing written under the title. The name is in two places: `TITLE` in `src/menu.js` and the loading screen in `index.html`.

What he said after playing the whole game on 14 November (the devlog has it in full). These are decisions too:

- It has to be frightening: "WE NEED IT TO BE SCARIER!" Suspense, "risers, small jumpscares, and music", something to hide from. A sad story with nothing at stake is not what he wants.
- Every chat "slower and simpler to understand". Short sentences, one thought each, time to read each one twice. Words on the phone have to be big: the picture is only 360 lines tall.
- The client is "a little uncanny ... not like a human being", "very straight forward and just telling to edit", and the player does the work "for the sake of money".
- The game must not point at the answer: no "red bar" on the timeline, and the thing to find "at different parts instead of the same place every time".
- Story is told with "cinematics with subtitles", not by scrolling old messages, and the ending is "fast paced".
- No place may end in a box or a blank: there has to be "a place there" outside the front door, and fog outside the windows "so ... borders are not visible".

Things to know:

- The browser panel inside the Claude app cannot capture the mouse, so the game falls back to hold-and-drag to look there. It also renders on the weak built-in graphics chip and slows right down when hidden, so do not trust frame rates measured in it.
- Browsers have rules about the mouse that the menu works around. A page can only take the mouse straight after a click or a key press. The Esc key never counts, so Esc cannot resume the game (the pause screen says to press Enter or click Resume). And for about a second after Esc the browser refuses outright, so `play()` in `src/main.js` waits and asks once more.
- Real mouse capture and full screen cannot be tested in the Claude app's browser panel. Eshan has to confirm those in Chrome.
- Dev-only test hooks on `window.__game`: `mode()` says which state the game is in, `play()`, `pause()` and `toTitle()` change it, `testMode()` skips the menu and silences the feet so the player can be walked by hand with `player.update(dt, input)`, `bright(true)` floods the flat with light, `view(x, y, z, yaw, pitch)` looks from anywhere (from above it hides the ceiling), `frame(ms)` draws one frame for timing, `settings.set(name, value)` changes a setting, `audio.level()` measures how loud the output is. For the gameplay: `hold(true)` stops the game's own clock, `tick(seconds)` moves it on by hand and `draw()` draws without moving it on; `hud.says()` is what the screen says; `chores.state()` and `job.state()` say where the story has got to, and `job.parts` reaches the phone, the seat, the editor and the footage.
- The play test is `tools/play-test.js`: `(await import('/tools/play-test.js')).run()`. It plays the whole game by the hooks, from the title screen to the credits, and checks every step (240 checks as of 16 November). Run it after changing anything in the gameplay. Its helpers (`toEditor()`, `doClip(i)`, `doLightsOut()`, `doFound()`, `doHide()`, `doCutscene()`, `doGas()`, `doTheDoor()`, `doTheEnd()`, `stand()`, `key()`, `tick()`) are handy for getting to one moment and looking at it. To look at the cutscene alone: `await t.toEditor(); __game.ending.start()`, then `tick()`. When the panel will not take pictures at all (it stops drawing on screen while the Claude window is minimized), the game still draws: read the canvas back with `gl.readPixels` straight after `__game.draw()`, and save it through a small local helper that writes what the page posts to it, then look at the file. A tape alone can be read with `renderer.readRenderTargetPixels(job.parts.footage.target, ...)` (half floats).
- Things the game moves are named with `b.tag(name, object)` and found in `apartment.things`. Each room's furniture is one group in `apartment.rooms`, so a tape can hide it; the corridor's things are in two sets (`hallByDoor`, `hallWalls`), and the kitchen's in `kitchenThings` and `chaiPan`, apart from what was built in. The gas knob (`gasKnob`) is on after the chores; `chores.boilOver()` is the real chai boiling over (flame out, puddle, hiss). `apartment.walls` is every wall as a box, for telling whether a wall is in the way.
- A tape is drawn by changing the flat (hiding furniture, turning lights down) for one picture and putting it all back at once (`film()` in `src/footage.js`). It never lets that picture redraw the shadows. Things that move on a tape are copies that only the tape sees, so the real ones stay where the player left them.
- Pictures of the browser panel lie while it is hidden: they can show only the top-left two thirds of the page, or a stale frame, and the static from a cut only fades as frames are drawn in real time. Before a picture: scale the page by `1 / devicePixelRatio`, draw a few frames a tenth of a second apart, and switch off the HUD's fades. To see a tape full size, `view(2.5, 1.078, 0.6, 0, 0)` puts the eye in front of the monitor.
- Collision rule used so far: never leave a gap between two solid things that is narrower than the player (0.5 m). Close it with `b.block(...)`.
- The walking test is `tools/walk-test.js`. With the game running in dev, type `(await import('/tools/walk-test.js')).run()` in the browser's console. It walks to every room, lets random walkers loose and checks the footstep floors. Run it after anything that moves a wall, a door or a piece of furniture, and reload the page afterwards.
- Screenshots of the browser panel are often one frame stale. Draw a frame by hand (`__game.frame(performance.now())`), wait a second, then look, and trust what the page reports over what the picture shows.
- The engine does not bounce light. The bedroom has one soft light standing in for lamplight bouncing off the wall.
- The mirrors are fakes (dark glossy panels).
- The game is played in Chrome in a big window (roughly 2400 x 1300). Check the look at that size.
- The loading screen (`index.html`, `src/loading.js`) prepares everything the game will ever draw before the title screen comes up, so that nothing makes the picture catch in the middle of the game. It can only prepare what is already in the flat. So anything that appears later must be built at start-up and kept hidden (as the figures, the phone and the late lights are), never built while the game is being played. After adding anything that appears or moves, run the warm-up test: `(await import('/tools/warm-test.js')).run()`. It plays the whole game, drawing as it goes, and fails if anything new had to be made after the loading screen lifted, or if the graphics card refused to draw something. In a test, `await __game.ready` waits for the loading screen to lift.
- A tape must never film the thing it is shown on. `footage.keepOff(object)` keeps an object out of every tape: the tripod, the monitor's picture, and the sheet the cutscene hangs in front of the player's eyes are all kept off that way.

**Next step:** two things, both waiting on Eshan.

1. **His half of the conversation for the README.** Done, 18 November: it is in `README.md`, in his words.
2. **Making the repo public.** The history is scrubbed (17 November, his choice), so nothing personal is left in it. What remains is his go-ahead, after his notes are in.

Things to know about the ending: the landing light (`lights.landing`) is in the flat from the start, turned down to nothing, so switching it on does not stall the game; the front door opens wide at the end but the doorway's barrier stays, so the player never walks out; the microwave's clock is repainted to 3:08 and back (`src/ending.js`). Anything that appears or moves still touches the rule about shadows being drawn once.

Things to know about the hunt and the cutscene:

- The figure's torch (`src/hunt.js`) is the one light whose shadows move. While it is on, every other light's `shadow.autoUpdate` is switched off and the torch's on (`takeShadows`), and `renderer.shadowMap.needsUpdate` is set each frame, so only its shadows are drawn again. It is in the scene from the start at zero brightness, like the other late lights.
- Its light is a wedge on the floor plan, not a cone in the air, and furniture does not hide the player from it: only walls and the two wardrobes do. Found, the player goes back to the chair with the lights out (`seat.snap()`).
- `apartment.power(false)` kills every light of Saad's and everything that glows off the mains by darkening the shared glowing materials. `audio.setPower(false)` stops the hums.
- The figure on the tapes is given its night look in `src/footage.js` (`NIGHT`): Saad pale and faceless, Hamza a grey man with a face. Keep them tellable apart: the cutscene depends on it.
- A tape that fills the whole screen (the cutscene, the last shot) is drawn at 480 by 360: `footage.sharp(true)`. On the monitor it is 240 by 180.
- The music runs on the sound card's clock and the cutscene on the game's. Shot lengths are in beats (`BEAT` in `src/cutscene.js` must match the finale's tempo in `src/audio.js`).
- The words the game puts over the picture stack in this order, back to front: the peephole's ring and the wardrobe's doors, the HUD, the subtitle and the end card, the menu (z-index in `src/hud.css` and `src/menu.css`).
- A very long shell command with quotes in it can fail before it runs. Write the script or the message to a file and run that.
