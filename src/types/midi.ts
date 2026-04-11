export interface NoteEvent {
  /** MIDI note number (0-127) */
  midi: number;
  /** Note name (e.g. "C4") */
  name: string;
  /** Velocity (1-127, 0 = note off) */
  velocity: number;
  /** Start time in seconds */
  time: number;
  /** Duration in seconds */
  duration: number;
  /** MIDI channel (0-15) */
  channel: number;
  /** Track index */
  track: number;
}

export interface ParsedMidi {
  /** All note events, sorted by time */
  notes: NoteEvent[];
  /** Total duration in seconds */
  duration: number;
  /** Tempo in BPM (initial tempo) */
  bpm: number;
  /** Track names */
  trackNames: string[];
  /** Time signature [numerator, denominator] */
  timeSignature: [number, number];
}
