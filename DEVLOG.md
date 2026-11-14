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
- **The mattress poked through the blanket.** Pale patches all over it in bright light: the sheet showing wherever a wrinkle dipped too low. Found on a last inspection after the furnishing was already committed, and fixed in its own commit.
- **The mirror is a fake.** Dark glass with a highlight. It does not reflect the room, and the player has no body to reflect anyway.
- **Up close, some things are still boxes.** The toilet, the shoes and the tripod will not survive a hard stare.
- **Seven lights cast shadows.** Fine on this PC. Not tested on a weak laptop or a phone.
- **Still no gameplay.** Two days have gone on how it looks. Five are left.

**Eshan's note**

Not yet. He has not walked through the furnished flat at the time of writing.

**Next**

Eshan walks the flat and says what is wrong with it. Then gameplay has to start: the three chores, and the phone.

### Later the same day: his verdict, then a menu and sound

**Eshan's note on the furnished flat**

> "Now this looks pretty good."

Then two requests. The first was small: "the horizontal sensitivity is a little faster make it a bit slower not much just a bit, its playable right now." The second was not: "add a custom menu screen. It should not be a sloppy box in the middle, it should stuck the game in between with all the menu option on the left side all clickable. add settings there where you can configure some settings. Add features like sensitivity adjustment, sound and some other features of your choice. Make it look good similar to the fears to fathom."

**What happened**

- **Look speed.** Turning left and right is about a fifth slower. Up and down was left alone, because he only named sideways. Both can now be changed from the settings anyway.
- **A title screen.** The game no longer opens on a line of text saying CLICK TO PLAY. It opens on a menu down the left side of the screen, with the flat showing behind it: five slow camera shots (the desk, the corridor from the front door, across to the spare room, through the bedroom door, the dining window), with a burst of tape static on every cut.
- **A pause screen.** Esc freezes the picture the way a paused tape freezes: it shivers, and a bar of noise lies across it. The same menu comes back with Resume at the top. A tape counter in the corner shows how long has been played.
- **Settings.** Mouse sensitivity, invert up and down, volume, brightness, tape wear (from clean to heavy), field of view, head bob, picture detail (chunky, normal or fine), full screen, and restore defaults. They take effect while the slider is being dragged, and the browser remembers them.
- **Sound.** The game was silent. It now has a room tone, hums that grow as you walk up to the fridge, the corridor bulb, the PC and the kitchen strip light, the street through the west windows, footsteps that change between mosaic, tile and cement, and clunks for the menu. All of it is made by code while the game runs. There is still not one sound file or image file in the game.
- **The walking test became a file.** It used to be retyped by hand. Now it is `tools/walk-test.js` and runs with one line.

On "similar to the fears to fathom": the menu is in the same family (a plain list on the left, the live game behind it, VHS over everything). It is not a copy of that game's menu. Claude worked from the style of the genre and did not go and look at the real one. The title, the colours (the street lamp's orange for the cursor) and the tape counter are ours.

**Checked**

- Every option by mouse and by keyboard. Settings survive a reload. Restore defaults puts them back.
- Start, pause, resume and back to title, each by click and by key.
- The layout at Eshan's screen size (2400 x 1300) and in a small window.
- The walking test: all seven rooms reached, 400,000 random steps, nobody out, nobody wedged.
- Sound levels by measurement: the loudest moment (running on tile next to the fridge with the volume at full) peaks at about half the level where it would distort. Volume at zero is silence.
- `npm run build` works. No errors in the console.

**What went wrong**

- **Eight files were written before any of them was run.** Claude's usage allowance ran out again, more than once, in the middle of the menu. For hours the working folder held a game that could not even load, because one file asked another for something that had not been written yet. Nothing broken was committed, but nothing was committed at all, which is the opposite of small steps.
- **It loaded first time, and was still wrong in six places.** Testing found them:
  - In windows that cannot capture the mouse, Esc paused the game and resumed it in the same key press. Two parts of the code both heard the key.
  - A menu that appeared under a resting mouse chose whichever option the mouse happened to be over. Esc then Enter could have meant "Back to title" and thrown away the player's place. Options are now only chosen by a mouse that actually moves.
  - Dragging a slider did not select its row.
  - Full screen did nothing, silently, where the browser ignores the request.
  - Esc cannot resume a game in a browser. Browsers refuse to let that one key hand the mouse back to a page. So Esc on the pause screen now tells you to press Enter or click Resume.
  - A browser also refuses to hand the mouse back for about a second after Esc. The game waits that second and asks again by itself.
- **A sound measurement that measured nothing.** The first test "stood" in ten places and got the same loudness in all of them. The test moved the player but never moved the ears. The numbers looked reasonable. Only the fact that they were identical gave it away.
- **A false alarm from the new walking test.** It reported walkers escaping. They were standing in narrow gaps that the player really does fit through. The test was wrong, not the flat.
- **Claude cannot hear.** Every sound is tuned by numbers. It may be too quiet, too loud, or just ugly.
- **Not tested: real mouse capture and full screen.** The preview panel inside the Claude app allows neither. The mouse-capture code is the same call that worked for Eshan before, but the new pause and resume around it has only been run in the panel's hold-and-drag mode.
- **The game has no name.** The menu says UNTITLED, with "working title" under it.
- **Still no gameplay.** Most of another day went on a menu. Five days are left, counting the 16th itself.

**Eshan's note**

On the menu: not yet. He has not seen it at the time of writing.

**Next**

Eshan opens the game in Chrome, tries the menu, and listens. He needs to name the game. Then gameplay has to start, with nothing else allowed in front of it: the three chores, and the phone.

---

## Day 2: 12 November 2026. The story comes first

**What happened**

A session was started to build the first gameplay: a way to use things, and the three chores that open the game. It read the code. Before it wrote a line of it, Eshan stopped it. He wanted the whole story decided first, so that everything the player does is there for a reason.

So the evening went on the story instead, and it is written down: [STORY.md](STORY.md). It has an ending that changes what everything before it meant, so it is not repeated here. That file is the whole thing, spoilers and all. What it holds:

- What really happened, in order, with times.
- Six rules that everything in the game has to obey.
- The game beat by beat, about 14 minutes, with what the screen says at each step.
- A table of everything the player does and why it is there, and a table of everything planted in the flat and what it turns out to mean.
- A first draft of every message on the phone.
- What has to be built by the 16th, day by day, and what gets cut first if a day is lost.

His five beats are all still in it, in his order: the flat, the chores, the phone, the edit, the payoff.

The best surprise was how much of it was already standing in the flat. Every clock was painted stopped at 3:07 when the rooms were furnished. There is a camera on a tripod pointed into the study, a chair in the spare room left facing the door, a landline nobody uses, a date ringed on the kitchen calendar, a poster of a figure in a lit doorway. All of it was put there for mood, with no story behind it. In the story, every one of them means something.

**What it changes**

- The chores are the same three, but the order is now rubbish, bolt, chai. The chai is never finished: the phone interrupts it.
- Every clip of footage is this flat. The pool at night, from the first outline, is dropped.
- The flashbacks happen on the tape and on the phone. There are no flashback scenes with people in them.

**What went wrong, and what got pushed back on**

- **Three days in, the game had an outline and no story.** Five lines in the brief, and chores that were listed as "ideas". Claude was one step from building three chores that meant nothing, and would have had to bend a story round them afterwards. Eshan caught it. Claude had not.
- **Nobody had ever said what country the flat is in.** Claude drafted a closing image that only makes sense in one country, then noticed that the setting had never been written down and the image might not belong in this home at all. It was cut before it reached the page. The setting is now a question for Eshan at the bottom of the story.
- **Flashback scenes were asked for and will not be built.** People who move and talk need character models, animation and voices. There are four days. The story gets its flashbacks another way, and says so.
- **A fourth day with no gameplay.** This time for a good reason, but the count is the count. Four days are left, counting the 16th, and the game still cannot be played.
- **The story is a proposal.** Eshan has not read it at the time of writing. If he throws it out, the evening went on a document.

**Eshan's note**

> "Bro we need to follow a full storyline that I want you keep intact. It should be a suspensful horror game, We need everything to happen for a meaning, flashbacks, backstory, reason behind every action we make the player do and a somewhat understanding and the sudden feeling of everything clicking at the very end of the game. Build everything around it. I want you to first decide the full story before making the game."

**Next**

Eshan reads the story and says yes, no, or what to change. He also owes it two names and a title. The build starts the moment he answers: using things, the task line, the three chores, the phone buzzing.

---

## Day 3: 13 November 2026. The first gameplay, and the first tape

Eshan read the story. Asked "Is this the story the game gets built around?", he answered "Yes, build it". The build started straight away, and by the end of the day the game can be played from the title screen to the first tape marked.

**What happened**

- **Using things.** Look at something within about a metre and a half and a prompt appears low on the screen, "E  Pick up the rubbish". E or a click does it. A wall in the way hides the prompt. The Controls page lists the keys.
- **The task line.** One small line at the top left says what to do now. When it is done it is ticked and struck out, and the next one takes its place. A quieter hint appears under it if the player seems lost: first the walking keys, later where things are.
- **The three chores** (STORY.md, Part 1). Pick up the rubbish bag by the kitchen bin and carry it down the corridor; the front door opens onto a landing that is pitch black, the bag goes out, the door shuts. "Lock up": the bolt slides across. "Make chai": the ring under the pan ticks, catches, and burns. "Wait for it to boil", and before it can, the phone buzzes in the study, loud enough to hear from the kitchen. The chai line is never ticked off, and the ring is never put out. Each has its own sounds, made in code.
- **The phone** (Part 2, beat 6). It comes up into his hand: "Unknown number", two messages already there, each stamped 3:07. The replies are sent with E, the other side types, and three files arrive. The phone is a real object in the hand with the messages painted on its screen, so it gets the same VHS look as everything else.
- **The PC.** "Sit down at the PC". The view glides into the chair and settles on the monitor, which now shows an editing program with the first clip loaded. Looking away opens the view out again, so the room can still be looked round from the chair (the last clip will need that). Q stands up.
- **The first tape** (beats 7 and 8). The footage is not a video: it is the flat itself, drawn from where Hamza's camera stood, as it was on the date in the corner. A year on, it is emptied and lit only by the camera's infra-red lamp, so it is black and white and dark at the far end. Played forward, the moment the rubbish bag slides out of the kitchen and down to the front door is lost in static. Each scrub back takes the tape one step further into the past: the date in the corner goes back, his doormat and shoe rack return, then his pictures and the rest of the flat, and the static thins. At NOV 16 2026 the corridor is in colour under the flickering bulb, and the bag can be seen moving with nobody touching it. Mark that frame, and a message comes in across the top of the screen: "That's it. That's exactly it. Keep going."
- **A play test** next to the walking test: `tools/play-test.js` plays everything above by the test hooks and makes 57 checks.

Partway through the day Eshan switched the session from Claude Fable 5.2 to Claude Opus 5.5, so the later commits name a different model.

**Choices Claude made that Eshan has not seen yet**

- The dates the first tape steps back through (AUG 02 2027, APR 19 2027, JAN 07 2027, then NOV 16 2026) are Claude's. STORY.md only says the date gets earlier.
- The tape's look is Claude's: black and white under the camera's lamp, colour coming back as it goes back in time. Black plastic shows up pale on the night picture, so the bag can be seen at the far end.
- Once the static has been seen, the timeline shows where the tape is damaged, in red. It is a help, and could go.
- The task line "Your phone is buzzing in the study" was "Your phone." in the first draft of the story. The longer one tells a new player where to go. STORY.md was changed to match.
- The dot in the middle of the screen was not asked for. It lights up over something that can be used. One rule in `src/hud.css` removes it.

**Checked**

- The play test passes: chores, phone, sitting down, the first clip from the static to the mark, standing up and sitting again, pausing, back to the title, and a second game from the start that begins clean. The walking test passes, before and after the chores (the bag moves, and the barrier round the bin moves with it).
- Pause in the middle of every chore and of the tape: nothing moves. Back to title, then Start: everything is where it began.
- Real key presses in the browser panel: E for the chores; Space, Esc, Enter and Q at the PC.
- The words at Eshan's window size (2400 x 1300): the task line is 30 pixels tall, the keys along the bottom 27, and the whole editing program fits in the view.
- Sound levels by measurement: every new sound is clearly above the room tone and far from distorting. The loudest is the phone buzzing next to you.
- `npm run build` works. No errors in the console.

**What went wrong**

- **The usage limit cut the session off again**, in the middle of checking the chores. They had been committed one by one, so nothing was lost.
- **Hours went on pictures that lied.** Screenshots of the hidden browser panel kept showing the game wrong: the bag too big, things out of place. Measured from inside the page, the game was right. The panel sometimes captures only part of the page, and stale frames. Pictures are now taken a particular way, and numbers from the page win any argument with a picture.
- **The first tape could not show what it is about.** The bag at the front door was invisible on the night picture: a black bag at the dark end of a corridor. Fixed by making the camera's lamp reach further and the bag show up pale under it.
- **The monitor's stand poked through the bottom of its own screen.** It had been there since the study was furnished. Nobody saw it until the screen had something on it.
- **Smaller ones, all fixed:** the carried bag filled too much of the view; through the open front door the landing showed as dark blue instead of black; the lit ring washed the kitchen tiles blue; on a squarer window the editing program was cut off at the sides, and the task line sat on top of its title bar.
- **Cut, as planned:** the figure at the far end of the first tape. It is the first thing on the story's cut list. The figure is due tomorrow anyway, for the last tape.
- **Not checked:** how any of it sounds (Claude cannot hear); real mouse capture (the panel cannot do it); the frame rate (the panel's timings are nonsense: half a millisecond one moment, 38 the next); how it looks in Chrome on his own screen.

**Eshan's notes**

- On the story, asked "Is this the story the game gets built around?": "Yes, build it".
- On yesterday's menu, as passed on by the session that built it: asked "Does the menu work in your Chrome, sound included?", he answered "It works".
- On today: "Please continue the work and also extend the gameplay as well and dont stop until a big milestone or story chapter change."
- On the gameplay itself: not yet. He has not played it at the time of writing.

**Next**

Eshan plays it in Chrome: the chores, the phone, the first tape. What he says goes in the next commit. Then the rest of Part 2, as STORY.md plans it for the 14th: clips 2, 3 and 4, the figure, and the hammering on the door. Still his to decide: the two names, the title, how the two of them text, and the setting.

---

## Day 4: 14 November 2026. Clip 2, and the door

Asked how the first gameplay felt to play, Eshan chose "Build clip 2 next". So the morning went on the second tape and on what it sets off.

**What happened**

- **Clip 2: the front door** (STORY.md, beat 9). Hamza's camera stands close on the front door, looking up at the bolt. A year on, the wood of the door frame is split round the bolt and the lock, where the door was forced the night Saad died. Played, the moment the bolt slides across by itself is lost in static. Scrubbed back, the tape steps through JUN 09 2027, FEB 14 2027 and NOV 23 2026 to the night itself: the wood whole again, the bulb on, the colour back, and the bolt sliding home with nobody touching it. Mark it, and the tape jumps on by itself to 03:07, and the door on it is hammered on from outside hard enough to shake it. Then the tape runs out to a blank blue screen.
- **The door, for real** (beat 10, the loud scare). A moment later his own front door is hammered on, down the corridor behind him. "Someone is at the front door". It is loud anywhere in the flat; the door rattles against its bolt and the corridor bulb cuts out at every blow. It keeps on, in bursts, until he walks up to it, and then stops dead. "E  Look through the peephole": an empty, black landing. Nobody. Only then does the phone buzz: "That bolt. I have thought about that bolt every day."
- **The dates on the tapes now come from the thread.** The dates a tape steps back through are the dates of Hamza's messages at the end of the story wherever one fits (9 June: "I found the bolt on"; 14 February: "The landlord wants to let the flat"; 23 November: "They gave me your phone today"), so they click when the thread is read. And every tape agrees about the flat on every date: the story's second rule is that the tape shows what is really there. That changed one of clip 1's dates from yesterday, JAN 07 2027 to NOV 23 2026, and clip 1 now shows the forced door frame too.
- **The play test** plays both clips, the hammering and the peephole: 93 checks.

**Checked**

- The play test and the walking test pass. `npm run build` works.
- The tape, read straight out of the graphics card as a small text picture: the door fills it, the bolt is the bright bar near the top, and between the start and the end of the tape it moves across into the frame.
- The hammering, measured: from the desk it is about as loud as the phone buzzing beside you, the loudest sound in the game; standing at the door, louder still, and well clear of distorting. On the tape it is small and thin, out of the PC's speakers.

**What went wrong**

- **No pictures today.** The browser panel stopped drawing altogether while the Claude window was not on screen, so every screenshot timed out. The tape was checked from its pixels instead, and the rest by the play test. Nobody has looked at the peephole view, the split wood or the door shaking with eyes yet.
- **A warning flood from a window with no size.** The hidden panel sometimes has a width and height of zero, and the game then made pictures with no size, hundreds of WebGL warnings. It now waits for the window to have a size. A real browser window never has none, so players never saw this.
- **A story slip, found, not fixed.** STORY.md says both that he bolted the door at 00:40 and that "the bolt went on at 00:52". The tape follows the minute-by-minute part: the bolt goes on at 00:41, straight after the rubbish. The 00:52 line is for Eshan to keep or drop.
- **Not checked:** how the hammering actually sounds, the peephole view, and the look of any of it in Chrome.

**Eshan's note**

Asked "How does it feel when you play it?", he chose "Build clip 2 next". He has not said how it plays yet.

**Next**

Clip 3, the kitchen (beat 11): the ring that lights by itself, the chai boiling over, the flame dying at 01:10, and from then on a hiss in the real kitchen. It needs the kitchen's things split from what is built in, the way the corridor's are. Then clip 4 and the figure, then Part 3.

### Later the same day: clip 3, the kitchen

Asked "Build clip 3, the kitchen, next?", Eshan chose "Build clip 3 next".

**What happened**

- **Clip 3** (STORY.md, beat 11). The camera looks down at the hob from across the kitchen. A year on (OCT 30 2027, the night of Hamza's message "A ring on the hob was lit tonight") the kitchen is emptied to what was built into the flat, and in the moment a ring lights by itself on the bare hob. Scrubbed back, his things come back, and on the night itself the pan of chai is on the ring, its foam rising. In the moment it boils over, runs down the pan into a puddle on the hob, and the flame gutters and goes out: 01:10:01 in the corner. Marked, three messages come in one after another: "1:10." "Two hours." "There is one more. I did not want to send it."
- **The real kitchen changes too.** At that mark, the chai the player left on the ring in Part 1 boils over in the real kitchen: the flame is out, the puddle is there, the knob is still turned on, and near the hob the gas hisses. Nothing announces it. It is there for the player to find, and Part 3 ("Turn off the gas") will need all of it.
- **The kitchen is split** the way the corridor is: what was built in (cabinets, worktop, hob, sink) is on every tape, his things come and go, and the pan of chai is a set of its own because the night itself is the only date it stands on the hob.
- **The gas knob** for that ring now has a white mark and turns when the player lights the ring.
- **One table for the flat's history.** What of his is in the flat on each date is now a single table that every tape reads, so the tapes cannot contradict each other.
- The play test now covers clip 3, the boil-over and the three messages: 122 checks.

**Checked**

- The play test and the walking test pass; `npm run build` works.
- By eye, for the first time today. The browser panel still would not draw on screen, so the pictures were read straight out of the game's own canvas and saved through a small helper on this computer. They show the emptied kitchen a year on with the ring lighting by itself, the night in colour with the foam rising over a blue flame, the boil-over, the flame out with the puddle round the pan, and the real kitchen afterwards matching the tape.
- The hiss, measured: standing at the hob it lifts the level by about a third; at the dining table it is barely there; from the corridor and the study, nothing. Faint, and only in the kitchen, as the story asks.

**What went wrong**

- **A light that leaked onto the tapes.** The glow of the lit gas ring was being switched on in the tapes' version of the night at 00:40, twenty minutes before the chai went on. It would have shown as a faint blue on the hob through the kitchen archway in clip 1. Found while building the kitchen tape; the ring's glow now follows its flame on every tape.
- **The first hiss was too quiet to hear** over the fridge (it lifted the level at the hob by a fifteenth). It is twice as loud now, and still only near the hob.
- **Still not checked:** how any of it sounds, and the look in Chrome on Eshan's screen.

**Next**

Clip 4, the study (beats 12 to 14): a fourth file arrives, the tape is live, a figure sits in the spare room and comes nearer at every scrub back, and at the very end of it Saad is asleep at the desk. It needs the figure, built from simple shapes. Then Part 3: the thread, the gas, the door, the last shot.

### Later still: clip 4, and the end of Part 2

Asked "Build clip 4 and the figure next?", Eshan chose "Build clip 4 next".

**What happened**

- **The fourth file** (beat 12). A moment after "There is one more. I did not want to send it." it arrives and loads by itself.
- **Clip 4: the study, live** (beat 13). LIVE in the corner with a red light, NOV 16 2027, the time running from 03:07. An empty room, and far off, through the study door and the spare room door opposite, someone sitting in the chair in the spare room. There is no static and nothing to mark: pressing E says "Keep going back." Each scrub back, his things are back in the study and the figure is nearer: the spare room doorway, the corridor, the study doorway, then right beside the empty chair, bent over to look at the screen.
- **All the way back** (beat 14). One more, and the date falls back to NOV 16 2026, 3:07: the room in colour, and somebody asleep at the desk in a grey hoodie, headphones on, head on his arms. Seven seconds later Part 2 is over, and the game hands on to Part 3, which is next to build.
- **The figure.** Hamza and Saad are built from boxes, with a handful of poses: sitting, standing, bending to a screen, asleep at a desk. They only ever appear on a tape, and under the camera's infra-red lamp they show up pale. Blocky, and at 240 by 180 that reads as a person, and an unpleasant one.
- **The tripod moved.** From its corner it could not see through both doorways at once, and the story needs that shot. It now stands by the study window, in line with both doors. The spare room's chair stands apart from that room's things, because it is the one thing still there a year on.
- The play test covers all four tapes now: 137 checks.

**Choices Claude made that Eshan has not seen yet**

- The live clock stops at 03:07:59. Every clock in the flat says 3:07 and the story only lets one of them reach 3:08, at the very end, so this one waits.
- The figure's places, and the tripod's new spot, are Claude's. STORY.md names the places (the spare room chair, the doorways, beside the desk) but not where exactly.
- The task line for the last tape ("Find the frame where it goes wrong") is never ticked off, like the chai.

**Checked**

- The play test, the walking test (with the tripod moved), the build. No errors in the console.
- By eye, from pictures read straight out of the game: every step of the last tape, from the empty room and the small pale figure far off, to the figure bent over the desk beside the empty chair, to Saad asleep in colour.

**What went wrong**

- **The first framing hid the point of the shot.** At the fourth step the figure stood between the camera and the monitor he was meant to be looking at, so the picture was a white blur on the edge of the frame. The camera now turns more towards the desk, and he bends on the far side of the empty chair, with the screen in view.
- **Pictures that came out as grey squares**, because the hidden browser panel had no size at all, and pictures buried under the static from pressing Start. Both were testing problems, not the game's.
- **Not checked:** how any of it sounds, and how it looks in Chrome on Eshan's screen. Nobody has played any of the tapes yet but the test.

**Next**

Part 3, the cut (beats 15 to 18): the phone lights up and the thread scrolls up through a year of messages to the night itself; "Turn off the gas"; "Open the door"; and the last shot, Hamza in a lit doorway, 3:07 turning to 3:08. Then the title and the credits. That is all that is left of the story.

### Late: Part 3, and the whole game

Asked "Build Part 3, the ending, next?", Eshan chose "Build Part 3 next". With that, the game plays from the title screen to the credits, the whole of STORY.md.

**What happened**

- **The thread** (beat 15). Seven seconds after the last tape has gone all the way back, the phone buzzes and comes up into his hand, still sat at the desk. "It's me. It was always me. You only ever answered clients." Then the thread scrolls up by itself, lingering on each message: a year of them, every one sent at 3:07, then the night itself, from "9 missed calls" and "OPEN THE DOOR" back up to "It's Hamza. New number." At the name, the top of the thread stops saying "Unknown number" and says Hamza. Then down again, and the last three messages, ending "Turn it off. Then open the door." Every word is STORY.md's script.
- **The gas** (beat 16). In the kitchen the hiss is loud now. Turn the knob back: the whole flat drops almost to silence for a few seconds, one small beep, and the microwave says 3:08.
- **The door** (beat 17). The corridor bulb has stopped flickering. Slide the bolt back and the door swings wide by itself onto a lit landing, the first light from outside in the whole game.
- **The last shot** (beat 18). The screen becomes the tape: the empty flat, NOV 16 2027, the front door open with light coming through it, and Hamza in the corridor looking at it, dark against the lit doorway, the picture on the poster of their film. 03:07:59 turns to 03:08:00. STOP. Black, the title, the credits, then back to the title screen with everything in the flat as it was.
- The play test now plays the whole game: 181 checks.

**Choices Claude made that Eshan has not seen yet**

- How the thread is staged: the first of the last four messages comes in before the scroll, the other three after it, so that the year and the night are read before "Turn it off". The header changes to the name when the scroll reaches "It's Hamza. New number." STORY.md says the header has a name, not when it gets it.
- The silence after the gas is the whole flat, not only the hiss stopping, and the microwave beeps once as it turns to 3:08, so the eye goes to it.
- The door opens by itself once the bolt is back; the player does not push it.
- The end card uses the game's working title, "Untitled", until Eshan names it.

**Checked**

- The play test twice in a row, the walking test, the build. No errors in the console.
- By eye, from pictures read straight out of the game: the thread at the night, at the name and at the end; the microwave at 3:08; the door open on the lit landing; the last shot at 03:08:00 and stopped.
- The sounds, measured: the silence really is near silence (a tenth of the kitchen's usual level), and comes back after four seconds; the knob, the creak of the door and the beep are all clear.

**What went wrong**

- **The editing program wrote over the end of the game.** Once the last shot stopped, the program on the monitor, still running underneath, wrote its own words back onto the tape: PAUSE, 2026. Found in a picture; the ending now keeps the tape to itself, and the play test checks the stopped tape says STOP at 3:08.
- **The beep that nobody could hear.** It sounded inside the silence after the gas, and the silence swallowed it. It now plays outside the flat's own volume.
- **Two checks in the play test that only passed by luck**, because of the random gaps in the hammering and the time the task line takes to tick. Both now wait long enough.
- **Not checked:** how any of it sounds to a person, and how it plays in Chrome on Eshan's screen. Nobody has played the game from start to finish except the test.

**Next**

Eshan plays the whole game in Chrome and says what he thinks. Then the game needs its name, and to be put online by the 16th. Still his to decide: the two names, the title, how they text, and the setting.
