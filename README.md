# MViSq — MIDI Visualizer in Squares

A web-based MIDI visualizer that displays playback on a Launchpad-style grid. Load a `.mid` file and watch a configurable grid of squares light up in sync with the music. Each cell is mapped to a MIDI note number, glowing with brightness proportional to note velocity.

## Features & Roadmaps

- **Grid visualization**: 8x8 grid of cells that light up when their assigned MIDI note is active
  - ToDo: grid expansion is implemented but not accesible from UI yet
- **Configurable mapping**: assign any MIDI note number (0–127) to any cell via the config panel
  - Uses [WHiSq: Wicki–Hayden in Squares](https://github.com/sozysozbot/WHiSq) or [Midimech](https://github.com/flipcoder/midimech) mapping as default
- **Audio playback**: synthesized audio via Tone.js PolySynth, triggered in sync with the MIDI data
  - ToDo: synthesizer configuration, audio sample loading
- **Transport controls**: play, pause, stop, and seek through the MIDI file
  - ToDo: keep note on when paused inside note duration
- **Click-to-preview**: click any grid cell to hear its assigned note
  - ToDo: use pointerdown / pointerup instead of click event

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), drop a `.mid` file onto the import area, and press Play.

## Usage

1. **Load a MIDI file** — drag and drop a `.mid` file onto the import area, or click Browse
2. **Play** — press Play to start audio and grid visualization
3. **Seek** — drag the seek slider to jump to any position
4. **Configure the grid** — click "Configure Grid" to edit which MIDI note each cell responds to.

## Tech Stack

| | |
|---|---|
| Build | Vite + TypeScript |
| UI | React 19 |
| State | Zustand 5 |
| Audio | Tone.js |
| MIDI parsing | @tonejs/midi |

## Scripts

```bash
npm run dev      # Development server with HMR
npm run build    # Production build
npm run preview  # Preview production build locally
```
