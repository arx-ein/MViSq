# MViSq — Architecture

## File Structure

```
src/
  types/midi.ts              — NoteEvent, ParsedMidi types
  midi/parser.ts             — parseMidiFile() using @tonejs/midi
  audio/AudioEngine.ts       — Tone.PolySynth wrapper; noteOn/attack/release interface
  transport/MidiScheduler.ts — Schedules notes on Tone.Transport, bridges audio + visual state
  input/MidiInputHandler.ts  — Web MIDI API listener; routes device input to scheduler callbacks
  store/
    useTransportStore.ts     — Play/pause/stop state, position, tempo
    useActiveNotesStore.ts   — Map<noteNumber, velocity>; updated from Tone.Draw callbacks and interactive input
    useGridConfigStore.ts    — Grid size, note mapping (persisted to localStorage)
  ui/
    Grid/                    — CSS Grid, per-cell note subscription
    TransportControls/       — Play/pause/stop, seek bar, tempo
    FileImport/              — Drag-and-drop + file picker for .mid files
    GridConfigPanel/         — Note mapping editor
    MidiInput/               — MIDI device toggle + permission status display
  utils/
    noteNames.ts             — MIDI number <-> note name (e.g. 60 -> "C4")
    defaultMapping.ts        — Default chromatic mapping generator
```

## Key Design Decisions

### Audio-Visual Sync (MIDI File Playback)

`Tone.Draw.schedule()` bridges audio and visual timing for MIDI file playback — audio events fire with sample accuracy on the audio thread, while visual state updates are deferred to the matching `requestAnimationFrame`:

```typescript
transport.schedule((time) => {
  audioEngine.noteOn(note, velocity, duration, time);  // sample-accurate audio
  draw.schedule(() => {
    activeNotesStore.getState().setNoteOn(midi, velocity);  // synced to animation frame
  }, time);
});
```

> **Known limitation / planned work:** Pre-scheduling all events upfront means pausing doesn't cut off already-queued note audio, and seeking mid-song won't correctly light up notes that started before the seek point. The intended direction is a playhead-polling model — computing active notes from `transport.seconds` each rAF frame — which would also make the transport freely seekable like a DAW.

### Interactive Note Input (Grid Cells + MIDI Device)

Grid cell interactions and MIDI device input share a separate code path from MIDI file playback. `AudioEngine` exposes `attack(midi, velocity)` / `release(midi)` (using `triggerAttack`/`triggerRelease`) alongside the existing `noteOn` (which uses `triggerAttackRelease` for pre-scheduled playback). `MidiScheduler` wraps these as `noteAttack(midi, velocity=100)` / `noteRelease(midi)`, updating `useActiveNotesStore` directly for visual sync:

- **Grid cells** use pointer events (`onPointerDown` / `onPointerUp` / `onPointerLeave`, and `onPointerEnter` when the primary button is held) so notes sustain while held and release on lift or slide-off. Dragging into a cell while holding also triggers note-on.
- **MIDI device input** routes through `MidiInputHandler`, which attaches to all connected Web MIDI inputs and forwards messages to the same `noteAttack`/`noteRelease` callbacks.

A safety guard in `noteAttack` checks `Tone.getContext().state !== "running"` before triggering audio. If the AudioContext hasn't been unlocked yet (e.g., a MIDI message arrives before any user gesture), only the visual store is updated and no audio is queued — preventing a burst of queued notes when the context eventually unlocks.

### Web MIDI Device Input

`MidiInputHandler` (`src/input/`) manages the Web MIDI API lifecycle: requesting access, attaching `onmidimessage` listeners to all inputs, hot-plugging new devices via `onstatechange`, and parsing raw MIDI bytes (`0x90` note-on, `0x80` note-off, note-on with velocity 0 treated as note-off).

`MidiInputControl` (`src/ui/MidiInput/`) is a self-contained component owning the handler ref, enabled/permission state, and the toggle checkbox UI. Its only prop is `scheduler`. On enable, it calls `scheduler.ensureAudioStarted()` first (a user gesture that unlocks the AudioContext), then `handler.enable()` (which triggers the browser MIDI permission prompt). Permission status is queried via the Permissions API and kept live with a `change` event listener, displayed inline next to the checkbox.

### Per-Cell Reactivity

Each `GridCell` subscribes to exactly one MIDI note via Zustand selector: `useActiveNotesStore(s => s.activeNotes.get(noteNumber))`. Only cells whose note state changes re-render. The grid size is variable (not fixed at 8×8), driven by `useGridConfigStore`.

### Grid Mapping

Default: chromatic bottom-to-top, MIDI 36–99 (C2 to D#7). Stored as `number[]` in Zustand, editable per-cell via `GridConfigPanel`. Rows render top-to-bottom in the UI but the mapping array is ordered bottom-to-top, so the display logic reverses row order.

### AudioEngine Interface

`AudioEngine` exposes two playback modes behind a stable interface:

- `noteOn(midi, velocity, duration, time?)` — pre-scheduled via `triggerAttackRelease`; used by `MidiScheduler` for MIDI file playback
- `attack(midi, velocity, time?)` / `release(midi, time?)` — interactive hold via `triggerAttack`/`triggerRelease`; used for grid clicks and MIDI device input

The split allows SoundFont/sample-based engines to be swapped in behind the same contract without touching the scheduler or input layers.
