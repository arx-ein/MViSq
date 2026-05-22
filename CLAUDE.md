# MViSq — MIDI Visualizer in Squares

MIDI visualizer web app that displays MIDI file playback on a Launchpad-style grid. Instead of a traditional piano keyboard, an 8x8 grid of cells lights up when their assigned MIDI notes are active. Each cell is user-mappable to any MIDI note number.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for file structure and key design decisions.

## Tech Stack

- **Vite + TypeScript** — build tool and type safety
- **React 19** — UI with per-cell selective re-rendering via memoization
- **Zustand 5** — state management; callable from Tone.js audio callbacks without React context overhead
- **Tone.js (v14)** — Web Audio synthesis, Transport (play/pause/seek), `Tone.Draw` for audio-visual sync
- **@tonejs/midi** — MIDI file parsing

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (tsc + vite)
npm run preview  # Preview production build
```
