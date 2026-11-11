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

### Evening: Eshan's verdict, and a much bigger flat

**What happened**

Eshan walked through the grey-box in Chrome. The mood passed. Three things did not: he felt too tall, the screen was too grainy, and the pixels were too big.

- **Height.** Eye level came down from 1.6 m to 1.5 m, and the ceiling went up from 2.5 m to 2.8 m. Lowering the eyes alone only bought 10 cm of headroom, which would not have fixed the feeling of scraping the roof.
- **The screen.** The picture went from 240 lines to 360, so every pixel is a third smaller. The VHS filter was rewritten to run at the screen's real resolution instead of being stretched up with the picture. Grain is now fine specks at less than half the old strength, and colour bleed is a soft smear to the right, the way tape does it, instead of hard red and blue fringes.
- **Then the brief changed.** While the texture work was under way, Eshan asked for a much bigger flat: a longer corridor, a bigger kitchen with the dining table in it, a store room, two bedrooms, a separate room for the PC, and a window you can look out of. The old four-room flat was thrown away and a new shell was built that evening: seven rooms, a 12 m corridor, about 92 square metres against the old 36.
- **Textures and shadows.** Every surface now has a texture, painted by code when the game starts, so there are still no image files. Lights cast real shadows. Nothing in the flat moves, so the shadows are worked out once at start-up and cost nothing after that.
- **A view.** Outside the west windows there is a lane, the buildings opposite, a street lamp and overhead wires. The lamp's light comes in through the windows and throws the window grills across the walls.

**What went wrong, and what got pushed back on**

- **The woven mesh over the picture was a bug, not a style.** Two bugs, in fact: a cheap random-number formula that repeated in a visible grid, and scanlines stretched by an uneven amount (4.5 times) so they beat against the pixels. Eshan called the pattern "negative". He was right to dislike it.
- **Scope.** The bigger flat arrived after the textures for the small one were already painted and its furniture was planned. Claude built it anyway, because rooms made in code are cheap to add, but said plainly that this more than doubles the floor area with six days left and not one line of gameplay written.
- **A second bedroom for a man who lives alone needs a reason.** Claude's answer, not yet approved by Eshan: it was a flatmate's room, and the flatmate moved out. It is nearly empty. That also gives the horror somewhere to go later.
- **Blender was offered and not used.** Eshan said Claude could use Blender on his PC. Everything is still built from simple shapes in code. Reason: at 360 lines and in this light, more props and better lighting buy far more than smoother shapes, and code-built rooms could be torn up and rebuilt in an evening, which is exactly what happened. Blender is being saved for the things boxes cannot fake.

**Eshan's note**

> "This feels good, we need to improve the textures though"

> "The next thing is our hieght make it a little smaller we are too long. amost touvhing the roof."

> "The pixels on the screen should be less "negative" and a little smaller as large ones make it look jald bazi me kiya hua kaam."

> "Bro we need to improve the map as well. The house is too small right now make it a little bigger. ... But it should be big."

**Next**

Furniture. The new flat is seven empty rooms.

---

## Day 1: 11 November 2026. Filling the flat

**What happened**

The seven rooms were furnished, lit and tested.

- **Study.** The room with the PC, and where the player starts. Desk, a monitor showing an editing timeline paused on a corridor, keyboard, drives, a steel tumbler of chai gone cold, an office chair with a hoodie over it, a camera on a tripod pointed into the room, pinboard, posters, a sofa.
- **Bedroom.** Unmade bed with the blanket hanging off one side, alarm clock showing 3:07, steel cupboard, wardrobe, the chair that clothes live on.
- **Spare room.** Stripped bed, shut curtains glowing with lamplight, taped boxes, something under a dust sheet, pale patches where pictures used to hang, and one chair left facing the door. From the study doorway you look straight across the corridor at it.
- **Kitchen and dining.** L-shaped worktop, cabinets, fridge with magnets, a built-in microwave whose clock also says 3:07, a three-ring hob with a pan of chai, a kadhai and a pressure cooker, cutlery stand, knife block, spice shelf, ladles on a rail, sink, plate rack, a table for four, and the big window to look out of.
- **Bathroom.** Toilet, basin, washing machine, towel, bucket and mug, water heater with its red light. The mirror faces the door.
- **Store room.** A steel rack with an old television, a video recorder and a stack of tapes, boxes, a ladder, the spare gas cylinder. No light.
- **Corridor.** Shoe rack and helmet, a jacket on a hook, pictures, a router with blinking lights, and at the dead end a landline nobody uses under a photograph whose faces never quite resolve.

The light does something that was half planned and half luck. The street lamp shines through the bedroom window, out of the bedroom door, across the corridor, through the bathroom door, and lands on the bathroom mirror with the window grill's shadow still in it.

Every poster, picture and label is invented. Nothing is copied from a real film, brand or artwork.

**Checked**

- A scripted walk with 53 stops through all seven rooms: reached every one.
- 400,000 random steps shoved into every wall, door and corner: never outside the flat, never inside anything.
- One frame takes about 5 thousandths of a second on this PC's built-in graphics chip, the weak one, not the main graphics card. The budget for smooth play is 16.
- No errors in the console. `npm run build` works.

**What went wrong**

- **The work stopped half-way through the study.** Claude's usage allowance ran out mid-task on the evening of the 10th and the session was cut off. It picked up the next day from the last commit. Small commits earned their keep.
- **The bedroom was pitch black.** The lamp lit one wall and nothing else, because the engine does not bounce light off surfaces. A soft light now stands in for the bounce. It is a cheat, and it is labelled as one in the code.
- **The spare room's curtains glowed like a television.** Turned down until they looked like cloth with a lamp behind it.
- **A false alarm about speed.** The first reading said 20 frames a second. The preview panel was running in the background, where the app slows everything down. Frames are now timed by hand instead.
- **The new screen filter was too soft on a 4K screen.** Sharpened a little.
- **The mirror is a fake.** Dark glass with a highlight. It does not reflect the room, and the player has no body to reflect anyway.
- **Up close, some things are still boxes.** The toilet, the shoes and the tripod will not survive a hard stare.
- **Seven lights cast shadows.** Fine on this PC. Not tested on a weak laptop or a phone.
- **Still no gameplay.** Two days have gone on how it looks. Five are left.

**Eshan's note**

Not yet. He has not walked through the furnished flat at the time of writing.

**Next**

Eshan walks the flat and says what is wrong with it. Then gameplay has to start: the three chores, and the phone.
