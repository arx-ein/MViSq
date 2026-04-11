import * as Tone from "tone";

export class AudioEngine {
  private synth: Tone.PolySynth;
  private started = false;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.3,
      },
    }).toDestination();
    this.synth.maxPolyphony = 32;
  }

  /** Must be called from a user gesture before any audio plays */
  async ensureStarted(): Promise<void> {
    if (!this.started) {
      await Tone.start();
      this.started = true;
    }
  }

  /**
   * Trigger a note with the given velocity and duration.
   * @param midi MIDI note number
   * @param velocity 0-127
   * @param duration Duration in seconds
   * @param time Audio context time (from Tone.Transport callback)
   */
  noteOn(midi: number, velocity: number, duration: number, time?: number): void {
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    const vel = velocity / 127;
    this.synth.triggerAttackRelease(freq, duration, time, vel);
  }

  /** Immediately release all notes */
  releaseAll(): void {
    this.synth.releaseAll();
  }

  dispose(): void {
    this.synth.dispose();
  }
}
