# Untitled horror game

A short first-person lo-fi horror game that runs in the browser. You play a freelance video editor who takes a job from an anonymous client, and the footage is not what it seems.

**Status:** in development. You can walk around the whole flat: seven furnished rooms and a long corridor, textured, lit and shadowed, with a view out of the windows and the VHS look on. No story or gameplay yet. Target: shipped by 16 November 2026.

## How this is being made

This game is directed by Eshan (Vyra Innovations) and built with Claude, an AI model, inside Claude Code. Eshan sets the story, the mood and the pacing, and playtests everything. Claude writes the code and builds the models.

The whole process is kept in the open, wrong turns included:

- **[DEVLOG.md](DEVLOG.md)** is the story of the build, day by day, with the ideas that were dropped and the mistakes that were made.
- **The commit history** is the same story in small steps. Every commit says what changed and carries a director's note in Eshan's own words.
- **[CLAUDE.md](CLAUDE.md)** is the brief the AI reads at the start of every session.

## Run it

You need [Node.js](https://nodejs.org).

```bash
npm install
npm run dev
```

Then open http://localhost:5173. Click to start, mouse to look, WASD to walk, Shift to walk faster, Esc to release the mouse.

## Layout

| Path | What is in it |
|---|---|
| `src/` | Game code (Three.js, plain JavaScript) |
| `src/plan.js` | The floor plan and the main measurements |
| `src/apartment.js` | Walls, floors, doors, windows and lights |
| `src/rooms/` | The furniture and clutter, one file per room |
| `src/textures.js` | Every texture, painted by code when the game starts |
| `src/vhs.js` | The VHS screen filter |
| `public/models/`, `public/textures/`, `public/audio/` | Game assets |
| `blender/` | Source Blender files for the models |
| `DEVLOG.md` | The build diary |
| `CLAUDE.md` | The brief for the AI |
