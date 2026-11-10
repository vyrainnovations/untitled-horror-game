# Devlog

The story of this build, newest entry at the bottom. Nothing gets tidied up afterwards: dropped ideas, wrong turns and bugs stay in.

Each entry has what happened, what went wrong or got dropped, and a note from Eshan in his own words.

---

## Day 0: 10 November 2026. Picking the game

**What happened**

Eshan opened a fresh Claude Code project with one request: build something impressive together by 16 November, a game or a short film. He comes from video editing and runs a few film channels, and he wanted a creepy, atmospheric horror piece for his portfolio.

Claude pitched a browser horror game about a video editor on a night shift, where the mechanic is a timeline scrubber and the footage changes when you scrub back. Eshan then added the story that made it a real game: a full 3D home, a freelancer doing everyday chores, an anonymous client on the phone, an editing job, and liminal footage that turns uncanny.

**What got dropped, and why**

- **"Something the world has never seen."** That was the first ask. Claude pushed back: not a six-day goal for one person. One fresh idea done tightly is.
- **Unreal Engine.** Eshan has it installed and asked to use it. Dropped because the AI cannot write Unreal's visual scripts directly, disk space on his PC was tight, and a browser link is easier to share than a multi-gigabyte download.
- **Worry that a browser game would not run on weak PCs.** It is the other way round: a low-poly game in the browser is about the lightest 3D there is.
- **A Roblox trend game.** A mash-up of popular Roblox games was suggested to him. Compared side by side and dropped for this week: Eshan has never played the genre, and those games live on months of updates, not a one-week build. Kept as a possible later project.
- **A full multi-floor house.** Cut down to one small apartment so the game can be finished.

**What got built**

Only the project folder: Three.js and Vite, asset folders, the brief for the AI, and a test scene of a dim room with a flickering bulb to prove everything runs.

**Eshan's note**

> "Yo the idea feels pretty good ngl. cant we make this in unreal engine?"

> "I want to showcase this as something I made using Ai ... I want it to look like a story with mistakes intact."

**Next**

A walkable grey-box apartment with the VHS look, to judge the mood before building on top of it.

### Later the same day: the grey-box apartment

**What happened**

The test room was replaced with the first thing you can actually walk around in: the whole apartment, blocked out in plain grey boxes. No textures, no real models, no gameplay. It exists so Eshan can judge the mood before anything is built on top.

- **The flat.** A bedroom (bed, desk with a glowing monitor, chair, wardrobe, a night window), a kitchen (counter, fridge, small table, a cold strip light), a bathroom with no light on, and one long hallway joining them, with the shut front door at the far end. About 7 by 6 metres.
- **Walking.** Click to start, mouse to look, WASD to walk, Shift to go faster, Esc to let go of the mouse. Walls and furniture are solid.
- **The look.** The picture is drawn at 240 lines and stretched, then run through a VHS filter written for this game: colour bleed, wobbling lines, a tracking band rolling up the screen, scanlines, grain, dark corners and blacks that never go fully black. Fog swallows anything more than a few metres away. The only warm light is a bare hallway bulb that flickers and now and then cuts out.

**What went wrong**

- **Getting wedged.** The first version passed a walk through every room, then failed the harder test (a robot walker shoved into every wall and corner). The player could jam into gaps narrower than their own body: between the fridge and a stool, between the desk and the wardrobe, between the bathroom fittings. Fixed by moving the stool against the table and putting invisible barriers across the gaps nobody could fit through anyway. After that, 120,000 random steps with no clipping and no getting stuck.
- **A test that blamed the game for its own mistake.** One "stuck" report was the test route trying to walk straight through the bedroom wall. The wall was right, the route was wrong.
- **The mouse would not capture in the preview window.** The browser panel inside the Claude app refuses to capture the mouse at all, so the game could not be started there. Added a fallback: where capture is refused, the game still starts on click and you hold the mouse button and drag to look. In a normal browser tab the mouse is captured as usual. Honest limit: the normal capture path could not be tested by Claude from inside that panel, only the fallback. Eshan's first playtest in Chrome is the real test of it.
- **Light goes through walls.** The lights do not cast shadows yet, so the hallway bulb faintly lights the bathroom through the wall. Left as it is for now. It is cheap, it suits the lo-fi look, and it is not worth fixing before the mood is approved.

**Eshan's note**

Not yet. He has not walked through it at the time of writing. His reaction goes in the next entry.

**Next**

Eshan walks through the flat and says what the mood needs: darker or brighter, more or less VHS, room sizes. Then the three chores.
