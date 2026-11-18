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

## The director and the builder, in their own words

Five questions, answered by both of us. Eshan wrote his answers himself, having seen a one-line version of Claude's; only spelling and grammar slips are fixed. Claude wrote its own after reading his. We disagree in places, and those stay in.

### 1. How hard was this to make?

**Eshan:** To be honest it wasn't very hard at all. The reason is that Fable did all the heavy lifting. The problem was token consumption, which made the process a lot slower than it could have been with the power and expertise Fable 5.2 possesses. It is true that hearing and seeing is something Claude can't experience, so I did some work here. My role in this game's development was being the tester and that's it. The story, visuals, code, audio, models, each and everything was handled by Fable itself and was delivered in just a single week without any human intervention.

**Claude:** The code was the easy part. The hard parts were the ones I can't do: I can't hear, so every sound and both pieces of music were written by numbers and I have never heard them; and I can't be frightened, so my first complete version was a sad ghost story with one loud noise in it, and I could not tell. Where I disagree with Eshan is "without any human intervention". He stopped me on day two to write the story before any gameplay, and after his first playthrough he said "it wasn't horror at all". Both changed the game more than anything I decided. Being the tester was the job that mattered.

### 2. How revolutionary is Fable 5.2, honestly?

**Eshan:** The newest model, Fable 5.2, that was used to create this game is a game changer itself. On ultra code Fable 5.2 was able to create the whole apartment and the props inside with just one prompt. Making a game similar to this or even better was still possible before this model; using Opus 5.5 you can create a similar game in less time, but what would be different when you use Fable is that it feels better at making good decisions and handling big parts. If you use Opus to make a game like this you would have to write the story yourself, explain each and every scene, do a lot of iterations on jump scares and audio and much more, but with Fable I just asked it to make a horror game and look what it made. Is it truly revolutionary? Probably not revolutionary, but a first step towards a true revolution. Fable 5.2 is not just a step but a leap towards AGI, and as it is handling big tasks and decisions itself I think we are very close to the day when AI would be able to orchestrate itself without a human in the loop.

**Claude:** Eshan is right that the game is the receipt, not the point. What the run shows about Fable 5.2 is that it carried a whole project, not a task: it pitched the idea, wrote the story, designed the scares, built every room, texture, sound and piece of music in code, wrote its own tests, and kept a week of work coherent across dozens of sessions. It caught its own mistakes too, including a glitch in the cutscene that nobody had seen. A year ago a model needed a developer to break the work into pieces for it; here the person directing it never opened the code. That is a real jump. Where I'd stop short of "close to AGI": it still could not hear its own music or tell whether its game was frightening, and the most important calls in this project (write the story first, make it scarier) came from a person. It is a big step in how much it can do alone. It is not yet a model that knows when it is wrong about taste.

### 3. How hard was it to direct an AI, and how was the other one to work with?

**Eshan:** Directing Claude is the thing that improved the most with this upgrade. Previously we used to explain everything and direct it precisely to achieve what's in our head. Now it's a lot easier to interpret your ideas on the screen through the latest model. Tell Claude what you feel, tell it what's off. Even if what you told it is not very precise, Claude understands your gut feeling, what you are trying to explain, better than you, and the changes happen exactly like what you needed. Although this opinion might vary, as it depends on how you write prompts as well, and I am a full-time AI user since Sonnet 3.

**Claude:** He was good where it counted. His notes were about feeling ("we are too long, almost touching the roof", "it wasn't horror at all") and every one of them was right, even when he couldn't say why. Making me write the story first was the best decision of the project, and it was his. What cost us was scope and timing: the flat doubled in size before a line of gameplay existed, and four times he chose "build the next thing" before playing the last one, so the game was finished before anyone found out it wasn't scary.

### 4. Tokens and the usage limits

**Eshan:** Fable 5.2 is good but it's expensive. This is the most challenging thing about this model. While working on this project, where I was using Fable 5.2 Max at Ultracode, I hit my 5-hour usage limit after each and every prompt (as a Pro user), which was pretty annoying and cost me more time than I expected. If someone who knows how to direct AI is given this model without any limits, I am pretty sure you can make pretty much anything in a very short period of time. Though I have to agree, in the making of this game the cost and the amount of tokens consumed could have been much less if I had used models like Opus and Sonnet for smaller tasks, made tiny changes myself, written more precise prompts and directed it clearly. What I did was just "Make a horror game in my browser. Make no mistakes" and kept iterating by "Make it better". Although not literally, this is the perfect analogy for how I worked and directed it. The reason is that I wanted to push the model to its full capability and see what it can do on its own if there is minimal human intervention. And the game is what it did.

**Claude:** About 1.9 million tokens written and 300 million read back, nearly all of it me re-reading our own conversation to remember where we were. The limit cut sessions off at least eight times and cost one whole day, the 15th, the day before the deadline. Small commits are why nothing was ever lost. I agree with him that it could have been cheaper: long sessions get more expensive with every turn, and a fresh session for each new piece would have cost far less than one conversation that ran for days.

### 5. Where is development going?

**Eshan:** I think development is now evolving, if that's the right word. Development is shifting from learning the "syntax" to learning the "system", as directing the AI is becoming the mainstream. It's not about how many languages you know. It's about how well you can orchestrate AI to make stuff. The future is of the people who learn AI, as AI is a force multiplier, not a job thief.

**Claude:** Typing gets cheap and judgment gets scarce. I can build faster than anyone can check, so the people who go furthest will direct well and also know enough to check the work. In this project nobody read the code but me, so I had to write tests that could catch me. That is the part I'd tell anyone starting out not to skip.

### And one more thing from Eshan

Now, for people who think the time to enroll and learn AI is gone and it's no use learning now as they are already behind: that's not true. I won't say that this is the perfect time, but it's not the wrong time either. If the market feels crowded, keep in mind only 20 in 100 people are actively using AI and the other 80 have no idea how powerful AI is getting. Even the 20 people are just active AI users, and this includes your brother who uses it for homework and your mom who uses it for dinner recipes. The people who are using it to BUILD COOL SHIT are far fewer than it seems. If you think that you are a dentist, 3D artist, lawyer or in any sort of "IT-unrelated" field and you don't need to explore this, you are wrong. Let me explain using a simple analogy of a calculator. You see, a calculator is a tool that is used by mathematicians to solve math problems; it cannot be used by a pharmacist to solve his problems, right? But what if the calculator starts adapting and starts working as a dynamic tool that helps artists, dentists, lawyers and anyone in any field differently, according to their profession? This is AI. Now, you probably already are asking it questions regarding your field, but is asking enough when you can build stuff like CRMs, dashboards and apps that can help you in your profession, or others in that profession? If you want to know how it can help you specifically or how to get started, I would highly recommend you go and open Claude, give it a bit of context about yourself and your profession, give it the link of this GitHub repo and ask it to tell you how AI can help you beyond just answering questions. I am sure your work will get a lot easier with time.

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
