# MViSq — MIDI Visualizer in Squares

MIDI visualizer web app that displays MIDI file playback on a Launchpad-style grid. Instead of a traditional piano keyboard, an 8x8 grid of cells lights up when their assigned MIDI notes are active. Each cell is user-mappable to any MIDI note number.

## Tech Stack

- **Vite + TypeScript** — build tool and type safety
- **React 19** — UI with per-cell selective re-rendering via memoization
- **Zustand 5** — state management; callable from Tone.js audio callbacks without React context overhead
- **Tone.js (v14)** — Web Audio synthesis, Transport (play/pause/seek), `Tone.Draw` for audio-visual sync
- **@tonejs/midi** — MIDI file parsing

## Architecture

```
src/
  types/midi.ts              — NoteEvent, ParsedMidi types
  midi/parser.ts             — parseMidiFile() using @tonejs/midi
  audio/AudioEngine.ts       — Tone.PolySynth wrapper, noteOn/noteOff interface
  transport/MidiScheduler.ts — Schedules notes on Tone.Transport, bridges audio + visual state
  store/
    useTransportStore.ts     — Play/pause/stop state, position, tempo
    useActiveNotesStore.ts   — Map<noteNumber, velocity> updated from Tone.Draw callbacks
    useGridConfigStore.ts    — Grid size, note mapping (persisted to localStorage)
  ui/
    Grid/                    — 8x8 CSS Grid, per-cell note subscription
    TransportControls/       — Play/pause/stop, seek bar, tempo
    FileImport/              — Drag-and-drop + file picker for .mid files
    GridConfigPanel/         — Note mapping editor
  utils/
    noteNames.ts             — MIDI number <-> note name (e.g. 60 -> "C4")
    defaultMapping.ts        — Default chromatic mapping generator
```

## Key Design Decisions

### Audio-Visual Sync

The critical architectural challenge. `Tone.Draw.schedule()` bridges audio and visual timing — audio events fire with sample accuracy on the audio thread, while visual state updates are deferred to the matching `requestAnimationFrame`:

```typescript
transport.schedule((time) => {
  audioEngine.noteOn(note, velocity, duration, time);  // sample-accurate audio
  draw.schedule(() => {
    activeNotesStore.getState().setNoteOn(midi, velocity);  // synced to animation frame
  }, time);
});
```

### Per-Cell Reactivity

Each `GridCell` subscribes to one MIDI note via Zustand selector: `useActiveNotesStore(s => s.activeNotes.get(noteNumber))`. Only cells whose note state changes re-render.

### Grid Mapping

Default: chromatic bottom-to-top, MIDI 36-99 (C2 to D#7). Stored as `number[]` in Zustand, editable per-cell via `GridConfigPanel`.

### AudioEngine Interface

Designed with a swappable interface so SoundFont/sample-based playback can be added behind the same `noteOn`/`noteOff` contract without changing the scheduler.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (tsc + vite)
npm run preview  # Preview production build
```
